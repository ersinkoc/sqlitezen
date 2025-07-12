import { create } from 'zustand';
import { SQLiteService } from '@/services/sqliteService';
import { StorageService } from '@/services/storageService';
import { ExportService } from '@/services/exportService';
import { QueryTemplateService } from '@/services/queryTemplateService';
import { DatabaseConnection, QueryResult, QueryHistory, SearchOptions, SearchResult, QueryTemplate, ExportOptions } from '@/types/database';
import { generateUUID } from '@/utils/uuid';
import toast from 'react-hot-toast';

interface DatabaseState {
  sqliteService: SQLiteService;
  storageService: StorageService;
  exportService: ExportService;
  queryTemplateService: QueryTemplateService;
  connections: DatabaseConnection[];
  activeConnectionId: string | null;
  queryHistory: QueryHistory[];
  isInitialized: boolean;
  currentQuery: string;
  activeResultTab: string;
  structureActiveTab: string;
  schemaVersion: number;
  showQueryPlan: boolean;
  searchResults: SearchResult[];
  queryTemplates: QueryTemplate[];
  
  // Actions
  initialize: () => Promise<void>;
  createDatabase: (name: string, data?: Uint8Array) => Promise<void>;
  openDatabase: (file: File) => Promise<void>;
  closeDatabase: (id: string) => Promise<void>;
  setActiveConnection: (id: string) => void;
  executeQuery: (query: string) => Promise<QueryResult | null>;
  saveDatabase: (id: string) => Promise<void>;
  exportDatabase: (id: string, options: ExportOptions) => Promise<void>;
  setCurrentQuery: (query: string) => void;
  setActiveResultTab: (tab: string) => void;
  setStructureActiveTab: (tab: string) => void;
  setShowQueryPlan: (show: boolean) => void;
  searchInDatabase: (options: SearchOptions) => Promise<void>;
  clearSearchResults: () => void;
  
  // Query Templates
  getQueryTemplates: () => QueryTemplate[];
  addQueryTemplate: (template: Omit<QueryTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  applyQueryTemplate: (templateId: string, variables: Record<string, any>) => void;
}

const queryTemplateService = new QueryTemplateService();

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  sqliteService: SQLiteService.getInstance(),
  storageService: new StorageService(),
  exportService: new ExportService(SQLiteService.getInstance()),
  queryTemplateService,
  connections: [],
  activeConnectionId: null,
  queryHistory: [],
  isInitialized: false,
  currentQuery: '',
  activeResultTab: 'results',
  structureActiveTab: 'columns',
  schemaVersion: 0,
  showQueryPlan: false,
  searchResults: [],
  queryTemplates: queryTemplateService.getTemplates(),

  initialize: async () => {
    const { sqliteService, storageService, queryTemplateService } = get();
    
    try {
      await sqliteService.initialize();
      await storageService.initialize();
      
      // Load saved databases
      const savedDatabases = await storageService.getAllDatabases();
      for (const dbFile of savedDatabases) {
        await sqliteService.createDatabase(dbFile.name, dbFile.data);
      }
      
      // Load query templates
      const templates = queryTemplateService.getTemplates();
      set({ isInitialized: true, queryTemplates: templates });
    } catch (error) {
      console.error('Failed to initialize database store:', error);
      toast.error('Failed to initialize database system');
    }
  },

  createDatabase: async (name: string, data?: Uint8Array) => {
    const { sqliteService, connections } = get();
    
    try {
      const connection = await sqliteService.createDatabase(name, data);
      set({ 
        connections: [...connections, connection],
        activeConnectionId: connection.id
      });
      
      toast.success(`Database "${name}" created successfully`);
    } catch (error) {
      console.error('Failed to create database:', error);
      toast.error('Failed to create database');
    }
  },

  openDatabase: async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      await get().createDatabase(file.name, data);
    } catch (error) {
      console.error('Failed to open database file:', error);
      toast.error('Failed to open database file');
    }
  },

  closeDatabase: async (id: string) => {
    const { sqliteService, connections, activeConnectionId } = get();
    
    try {
      sqliteService.closeDatabase(id);
      const newConnections = connections.filter(conn => conn.id !== id);
      
      set({ 
        connections: newConnections,
        activeConnectionId: activeConnectionId === id 
          ? (newConnections.length > 0 ? newConnections[0].id : null)
          : activeConnectionId
      });
      
      toast.success('Database closed');
    } catch (error) {
      console.error('Failed to close database:', error);
      toast.error('Failed to close database');
    }
  },

  setActiveConnection: (id: string) => {
    set({ activeConnectionId: id });
  },

  executeQuery: async (query: string) => {
    const { sqliteService, activeConnectionId, queryHistory, showQueryPlan } = get();
    
    if (!activeConnectionId) {
      toast.error('No active database connection');
      return null;
    }

    const historyEntry: QueryHistory = {
      id: generateUUID(),
      query,
      timestamp: Date.now(),
      databaseId: activeConnectionId,
      success: false,
    };

    try {
      const result = await sqliteService.executeQuery(activeConnectionId, query, showQueryPlan);
      
      historyEntry.success = true;
      historyEntry.result = result;
      
      set({ queryHistory: [historyEntry, ...queryHistory].slice(0, 100) });
      
      // Check if query is a DDL statement that modifies schema
      const isDDL = /^\s*(CREATE|DROP|ALTER)\s+(TABLE|INDEX|VIEW|TRIGGER)/i.test(query);
      if (isDDL) {
        // Increment schema version to trigger re-fetching
        set({ schemaVersion: get().schemaVersion + 1 });
      }
      
      return result;
    } catch (error) {
      historyEntry.error = (error as Error).message;
      set({ queryHistory: [historyEntry, ...queryHistory].slice(0, 100) });
      
      toast.error((error as Error).message);
      return null;
    }
  },

  saveDatabase: async (id: string) => {
    const { sqliteService, storageService, connections } = get();
    
    try {
      const connection = connections.find(conn => conn.id === id);
      if (!connection) throw new Error('Database connection not found');
      
      const data = sqliteService.exportDatabase(id);
      await storageService.saveDatabase({
        id,
        name: connection.name,
        size: data.length,
        lastModified: Date.now(),
        data,
      });
      
      // Update connection state
      const updatedConnections = connections.map(conn =>
        conn.id === id 
          ? { ...conn, isModified: false, lastSaved: Date.now() }
          : conn
      );
      
      set({ connections: updatedConnections });
      toast.success('Database saved');
    } catch (error) {
      console.error('Failed to save database:', error);
      toast.error('Failed to save database');
    }
  },

  exportDatabase: async (id: string, options: ExportOptions) => {
    const { exportService, connections } = get();
    
    try {
      const connection = connections.find(conn => conn.id === id);
      if (!connection) throw new Error('Database connection not found');
      
      const blob = await exportService.exportDatabase(id, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const extension = {
        sqlite: 'db',
        sql: 'sql',
        csv: 'csv',
        json: 'json'
      }[options.format];
      
      a.download = `${connection.name.replace(/\.[^.]+$/, '')}-${new Date().toISOString().split('T')[0]}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success(`Database exported as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Failed to export database:', error);
      toast.error('Failed to export database');
    }
  },

  setCurrentQuery: (query: string) => {
    set({ currentQuery: query });
  },
  
  setActiveResultTab: (tab: string) => {
    set({ activeResultTab: tab });
  },
  
  setStructureActiveTab: (tab: string) => {
    set({ structureActiveTab: tab });
  },
  
  setShowQueryPlan: (show: boolean) => {
    set({ showQueryPlan: show });
  },
  
  searchInDatabase: async (options: SearchOptions) => {
    const { sqliteService, activeConnectionId } = get();
    
    if (!activeConnectionId) {
      toast.error('No active database connection');
      return;
    }
    
    try {
      const results = await sqliteService.searchInDatabase(activeConnectionId, options);
      set({ searchResults: results });
      toast.success(`Found ${results.length} results`);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    }
  },
  
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
  
  getQueryTemplates: () => {
    return get().queryTemplates;
  },
  
  addQueryTemplate: (template: Omit<QueryTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const { queryTemplateService } = get();
    queryTemplateService.addTemplate(template);
    const updatedTemplates = queryTemplateService.getTemplates();
    set({ queryTemplates: updatedTemplates });
    toast.success('Query template added');
  },
  
  applyQueryTemplate: (templateId: string, variables: Record<string, any>) => {
    const { queryTemplateService } = get();
    try {
      const query = queryTemplateService.applyTemplate(templateId, variables);
      set({ currentQuery: query });
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error('Failed to apply template');
    }
  },
}));
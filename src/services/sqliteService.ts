import initSqlJs, { SqlJsStatic } from 'sql.js';
import { DatabaseConnection, QueryResult, SchemaInfo, TableInfo, ColumnInfo } from '@/types/database';

export class SQLiteService {
  private static instance: SQLiteService;
  private SQL: SqlJsStatic | null = null;
  private databases: Map<string, DatabaseConnection> = new Map();
  private wasmBinaryPath = '/sql-wasm.wasm';

  private constructor() {}

  static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  async initialize(): Promise<void> {
    if (this.SQL) return;

    try {
      this.SQL = await initSqlJs({
        locateFile: (file) => {
          if (file === 'sql-wasm.wasm') {
            return this.wasmBinaryPath;
          }
          return file;
        },
      });
    } catch (error) {
      console.error('Failed to initialize SQL.js:', error);
      throw new Error('Failed to initialize SQLite WebAssembly module');
    }
  }

  async createDatabase(name: string, data?: Uint8Array): Promise<DatabaseConnection> {
    if (!this.SQL) {
      await this.initialize();
    }

    const id = crypto.randomUUID();
    const database = data ? new this.SQL!.Database(data) : new this.SQL!.Database();
    
    const connection: DatabaseConnection = {
      id,
      name,
      database,
      isModified: false,
    };

    this.databases.set(id, connection);
    return connection;
  }

  getDatabase(id: string): DatabaseConnection | undefined {
    return this.databases.get(id);
  }

  getAllDatabases(): DatabaseConnection[] {
    return Array.from(this.databases.values());
  }

  closeDatabase(id: string): void {
    const connection = this.databases.get(id);
    if (connection) {
      connection.database.close();
      this.databases.delete(id);
    }
  }

  async executeQuery(databaseId: string, query: string): Promise<QueryResult> {
    const connection = this.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    const startTime = performance.now();
    
    try {
      const stmt = connection.database.prepare(query);
      const columns = stmt.getColumnNames();
      const values: any[][] = [];
      
      while (stmt.step()) {
        values.push(stmt.get());
      }
      
      stmt.free();
      
      const executionTime = performance.now() - startTime;
      
      connection.isModified = this.isModifyingQuery(query);
      
      return {
        columns,
        values,
        rowCount: values.length,
        executionTime,
      };
    } catch (error) {
      throw new Error(`Query execution failed: ${(error as Error).message}`);
    }
  }

  async executeMultipleQueries(databaseId: string, queries: string): Promise<QueryResult[]> {
    const connection = this.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    const results: QueryResult[] = [];
    const individualQueries = this.splitQueries(queries);

    for (const query of individualQueries) {
      if (query.trim()) {
        try {
          const result = await this.executeQuery(databaseId, query);
          results.push(result);
        } catch (error) {
          throw new Error(`Query failed: ${(error as Error).message}\nQuery: ${query}`);
        }
      }
    }

    return results;
  }

  exportDatabase(databaseId: string): Uint8Array {
    const connection = this.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    return connection.database.export();
  }

  async getSchemaInfo(databaseId: string): Promise<SchemaInfo> {
    const connection = this.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    const tables = await this.getTables(databaseId);
    const indices = await this.getIndices(databaseId);
    const triggers = await this.getTriggers(databaseId);
    const views = await this.getViews(databaseId);

    return {
      tables,
      indices,
      triggers,
      views,
    };
  }

  private async getTables(databaseId: string): Promise<TableInfo[]> {
    const result = await this.executeQuery(
      databaseId,
      "SELECT name, type, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );

    const tables: TableInfo[] = [];
    
    for (const row of result.values) {
      const tableName = row[0] as string;
      const columns = await this.getTableColumns(databaseId, tableName);
      
      tables.push({
        name: tableName,
        type: row[1] as string,
        sql: row[2] as string,
        columns,
      });
    }

    return tables;
  }

  private async getTableColumns(databaseId: string, tableName: string): Promise<ColumnInfo[]> {
    const result = await this.executeQuery(
      databaseId,
      `PRAGMA table_info('${tableName}')`
    );

    return result.values.map(row => ({
      cid: row[0] as number,
      name: row[1] as string,
      type: row[2] as string,
      notnull: row[3] as number,
      dflt_value: row[4],
      pk: row[5] as number,
    }));
  }

  private async getIndices(databaseId: string): Promise<any[]> {
    const result = await this.executeQuery(
      databaseId,
      "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL ORDER BY name"
    );

    return result.values.map(row => ({
      name: row[0],
      tableName: row[1],
      sql: row[2],
    }));
  }

  private async getTriggers(databaseId: string): Promise<any[]> {
    const result = await this.executeQuery(
      databaseId,
      "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger' ORDER BY name"
    );

    return result.values.map(row => ({
      name: row[0],
      tableName: row[1],
      sql: row[2],
    }));
  }

  private async getViews(databaseId: string): Promise<TableInfo[]> {
    const result = await this.executeQuery(
      databaseId,
      "SELECT name, type, sql FROM sqlite_master WHERE type='view' ORDER BY name"
    );

    return result.values.map(row => ({
      name: row[0] as string,
      type: row[1] as string,
      sql: row[2] as string,
      columns: [],
    }));
  }

  private isModifyingQuery(query: string): boolean {
    const modifyingKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TRUNCATE'
    ];
    
    const upperQuery = query.trim().toUpperCase();
    return modifyingKeywords.some(keyword => upperQuery.startsWith(keyword));
  }

  private splitQueries(queries: string): string[] {
    const result: string[] = [];
    let currentQuery = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < queries.length; i++) {
      const char = queries[i];
      const prevChar = i > 0 ? queries[i - 1] : '';
      
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      currentQuery += char;
      
      if (!inString && char === ';') {
        result.push(currentQuery.trim());
        currentQuery = '';
      }
    }
    
    if (currentQuery.trim()) {
      result.push(currentQuery.trim());
    }
    
    return result;
  }
}
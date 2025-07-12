import type { Database as SqlJsDatabase } from 'sql.js';

export interface DatabaseFile {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  data: Uint8Array;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  database: SqlJsDatabase;
  file?: DatabaseFile;
  isModified: boolean;
  lastSaved?: number;
}

export interface QueryResult {
  columns: string[];
  values: any[][];
  rowCount: number;
  executionTime: number;
  queryPlan?: QueryPlanStep[];
}

export interface QueryPlanStep {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export interface TableInfo {
  name: string;
  type: string;
  sql: string;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface IndexInfo {
  name: string;
  tableName: string;
  unique: boolean;
  columns: string[];
}

export interface TriggerInfo {
  name: string;
  tableName: string;
  event: string;
  timing: string;
  sql: string;
}

export interface SchemaInfo {
  tables: TableInfo[];
  indices: IndexInfo[];
  triggers: TriggerInfo[];
  views: TableInfo[];
}

export interface QueryHistory {
  id: string;
  query: string;
  timestamp: number;
  databaseId: string;
  success: boolean;
  error?: string;
  result?: QueryResult;
}

export interface ExportOptions {
  format: 'sqlite' | 'sql' | 'csv' | 'json';
  tables?: string[];
  includeSchema?: boolean;
  includeData?: boolean;
}

export interface ImportOptions {
  format: 'sqlite' | 'sql' | 'csv' | 'json';
  tableName?: string;
  headerRow?: boolean;
  delimiter?: string;
  encoding?: string;
}

export interface QueryTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  query: string;
  variables?: QueryVariable[];
  createdAt: number;
  updatedAt: number;
}

export interface QueryVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: any;
  description?: string;
}

export interface SearchOptions {
  query: string;
  tables?: string[];
  columns?: string[];
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  limit?: number;
}

export interface SearchResult {
  table: string;
  column: string;
  rowId: number;
  value: any;
  context?: string;
}
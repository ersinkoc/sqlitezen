import * as monaco from 'monaco-editor';
import { SQLiteService } from './sqliteService';
import { SchemaInfo } from '@/types/database';

export class MonacoService {
  private static instance: MonacoService;
  private sqliteService: SQLiteService;
  private schemaCache: Map<string, SchemaInfo> = new Map();
  private disposables: monaco.IDisposable[] = [];

  private constructor(sqliteService: SQLiteService) {
    this.sqliteService = sqliteService;
  }

  static getInstance(sqliteService: SQLiteService): MonacoService {
    if (!MonacoService.instance) {
      MonacoService.instance = new MonacoService(sqliteService);
    }
    return MonacoService.instance;
  }

  initialize(): void {
    // Register SQLite language configuration
    monaco.languages.setLanguageConfiguration('sql', {
      comments: {
        lineComment: '--',
        blockComment: ['/*', '*/'],
      },
      brackets: [
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string', 'comment'] },
      ],
      surroundingPairs: [
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
      ],
    });

    // Register completion provider
    const completionProvider = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems: this.provideCompletionItems.bind(this),
      triggerCharacters: ['.', ' ', '('],
    });

    this.disposables.push(completionProvider);
  }

  async updateSchema(databaseId: string): Promise<void> {
    try {
      const schema = await this.sqliteService.getSchemaInfo(databaseId);
      this.schemaCache.set(databaseId, schema);
    } catch (error) {
      console.error('Failed to update schema:', error);
    }
  }

  private async provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken
  ): Promise<monaco.languages.CompletionList> {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions: monaco.languages.CompletionItem[] = [];

    // Add SQL keywords
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
      'DROP TABLE', 'ALTER TABLE', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
      'UNIQUE', 'NOT NULL', 'DEFAULT', 'CHECK', 'INDEX', 'VIEW', 'TRIGGER',
      'BEGIN', 'END', 'TRANSACTION', 'COMMIT', 'ROLLBACK', 'AND', 'OR', 'IN',
      'EXISTS', 'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'AS', 'CASE',
      'WHEN', 'THEN', 'ELSE', 'DISTINCT', 'ASC', 'DESC'
    ];

    keywords.forEach(keyword => {
      suggestions.push({
        label: keyword,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: keyword,
        range: range,
        detail: 'SQL Keyword',
      });
    });

    // Add SQL functions
    const functions = [
      { name: 'COUNT', signature: 'COUNT(expression)' },
      { name: 'SUM', signature: 'SUM(expression)' },
      { name: 'AVG', signature: 'AVG(expression)' },
      { name: 'MIN', signature: 'MIN(expression)' },
      { name: 'MAX', signature: 'MAX(expression)' },
      { name: 'ROUND', signature: 'ROUND(value, precision)' },
      { name: 'LENGTH', signature: 'LENGTH(string)' },
      { name: 'SUBSTR', signature: 'SUBSTR(string, start, length)' },
      { name: 'UPPER', signature: 'UPPER(string)' },
      { name: 'LOWER', signature: 'LOWER(string)' },
      { name: 'TRIM', signature: 'TRIM(string)' },
      { name: 'REPLACE', signature: 'REPLACE(string, old, new)' },
      { name: 'COALESCE', signature: 'COALESCE(value1, value2, ...)' },
      { name: 'NULLIF', signature: 'NULLIF(expr1, expr2)' },
      { name: 'DATE', signature: 'DATE(timestring, modifier, ...)' },
      { name: 'TIME', signature: 'TIME(timestring, modifier, ...)' },
      { name: 'DATETIME', signature: 'DATETIME(timestring, modifier, ...)' },
      { name: 'STRFTIME', signature: 'STRFTIME(format, timestring, modifier, ...)' },
      { name: 'JULIANDAY', signature: 'JULIANDAY(timestring, modifier, ...)' },
    ];

    functions.forEach(func => {
      suggestions.push({
        label: func.name,
        kind: monaco.languages.CompletionItemKind.Function,
        insertText: `${func.name}($1)`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
        detail: func.signature,
        documentation: `SQLite function: ${func.signature}`,
      });
    });

    // Add table and column suggestions from schema
    const currentDatabaseId = this.getCurrentDatabaseId();
    if (currentDatabaseId) {
      const schema = this.schemaCache.get(currentDatabaseId);
      if (schema) {
        // Add table names
        schema.tables.forEach(table => {
          suggestions.push({
            label: table.name,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: table.name,
            range: range,
            detail: 'Table',
            documentation: `Table with ${table.columns.length} columns`,
          });

          // Add columns for this table
          table.columns.forEach(column => {
            suggestions.push({
              label: `${table.name}.${column.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `${table.name}.${column.name}`,
              range: range,
              detail: `${column.type}${column.pk ? ' PRIMARY KEY' : ''}${column.notnull ? ' NOT NULL' : ''}`,
              documentation: `Column in ${table.name}`,
            });
          });
        });

        // Add view names
        schema.views.forEach(view => {
          suggestions.push({
            label: view.name,
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: view.name,
            range: range,
            detail: 'View',
          });
        });
      }
    }

    // Add data type suggestions
    const dataTypes = [
      'INTEGER', 'REAL', 'TEXT', 'BLOB', 'NULL',
      'NUMERIC', 'BOOLEAN', 'DATE', 'DATETIME',
      'VARCHAR', 'CHAR', 'DECIMAL', 'DOUBLE', 'FLOAT'
    ];

    dataTypes.forEach(type => {
      suggestions.push({
        label: type,
        kind: monaco.languages.CompletionItemKind.TypeParameter,
        insertText: type,
        range: range,
        detail: 'Data Type',
      });
    });

    return { suggestions };
  }

  private getCurrentDatabaseId(): string | null {
    // This should be passed from the component using the editor
    // For now, return the first database ID from cache
    const ids = Array.from(this.schemaCache.keys());
    return ids.length > 0 ? ids[0] : null;
  }

  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }
}
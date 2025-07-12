import { SQLiteService } from './sqliteService';
import { DatabaseConnection, ExportOptions, ImportOptions } from '@/types/database';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

export class ImportExportService {
  private sqliteService: SQLiteService;

  constructor(sqliteService: SQLiteService) {
    this.sqliteService = sqliteService;
  }

  async exportDatabase(databaseId: string, options: ExportOptions): Promise<void> {
    const connection = this.sqliteService.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    switch (options.format) {
      case 'sqlite':
        await this.exportAsSQLite(databaseId, connection);
        break;
      case 'sql':
        await this.exportAsSQL(databaseId, connection, options);
        break;
      case 'csv':
        await this.exportAsCSV(databaseId, options);
        break;
      case 'json':
        await this.exportAsJSON(databaseId, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async exportAsSQLite(databaseId: string, connection: DatabaseConnection): Promise<void> {
    const data = this.sqliteService.exportDatabase(databaseId);
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const filename = `${connection.name.replace(/\.db$/i, '')}_${new Date().toISOString().split('T')[0]}.db`;
    saveAs(blob, filename);
  }

  private async exportAsSQL(databaseId: string, connection: DatabaseConnection, options: ExportOptions): Promise<void> {
    let sqlContent = '';
    
    // Add header
    sqlContent += `-- SQLite Zen SQL Export\n`;
    sqlContent += `-- Database: ${connection.name}\n`;
    sqlContent += `-- Generated: ${new Date().toISOString()}\n\n`;
    
    // Get schema info
    const schema = await this.sqliteService.getSchemaInfo(databaseId);
    
    if (options.includeSchema !== false) {
      // Export tables schema
      for (const table of schema.tables) {
        if (!options.tables || options.tables.includes(table.name)) {
          sqlContent += `-- Table: ${table.name}\n`;
          sqlContent += `${table.sql};\n\n`;
        }
      }
      
      // Export indices
      for (const index of schema.indices) {
        if (!options.tables || options.tables.includes((index as any).tableName)) {
          sqlContent += `${(index as any).sql};\n`;
        }
      }
      sqlContent += '\n';
      
      // Export triggers
      for (const trigger of schema.triggers) {
        if (!options.tables || options.tables.includes((trigger as any).tableName)) {
          sqlContent += `${(trigger as any).sql};\n`;
        }
      }
      sqlContent += '\n';
    }
    
    if (options.includeData !== false) {
      // Export table data
      for (const table of schema.tables) {
        if (!options.tables || options.tables.includes(table.name)) {
          const result = await this.sqliteService.executeQuery(
            databaseId,
            `SELECT * FROM "${table.name}"`
          );
          
          if (result.values.length > 0) {
            sqlContent += `-- Data for table: ${table.name}\n`;
            
            for (const row of result.values) {
              const values = row.map(value => {
                if (value === null) return 'NULL';
                if (typeof value === 'number') return value.toString();
                if (typeof value === 'boolean') return value ? '1' : '0';
                return `'${String(value).replace(/'/g, "''")}'`;
              }).join(', ');
              
              sqlContent += `INSERT INTO "${table.name}" VALUES (${values});\n`;
            }
            sqlContent += '\n';
          }
        }
      }
    }
    
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const filename = `${connection.name.replace(/\.db$/i, '')}_${new Date().toISOString().split('T')[0]}.sql`;
    saveAs(blob, filename);
  }

  private async exportAsCSV(databaseId: string, options: ExportOptions): Promise<void> {
    const tables = options.tables || [];
    if (tables.length === 0) {
      throw new Error('Please specify tables to export');
    }
    
    for (const tableName of tables) {
      const result = await this.sqliteService.executeQuery(
        databaseId,
        `SELECT * FROM "${tableName}"`
      );
      
      const csvData = Papa.unparse({
        fields: result.columns,
        data: result.values,
      });
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
      const filename = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      saveAs(blob, filename);
    }
  }

  private async exportAsJSON(databaseId: string, options: ExportOptions): Promise<void> {
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'SQLite Zen JSON Export',
        version: '1.0',
      },
      data: {},
    };
    
    const schema = await this.sqliteService.getSchemaInfo(databaseId);
    
    if (options.includeSchema !== false) {
      exportData.schema = {
        tables: schema.tables.filter(t => !options.tables || options.tables.includes(t.name)),
        indices: schema.indices.filter(i => !options.tables || options.tables.includes((i as any).tableName)),
        triggers: schema.triggers.filter(t => !options.tables || options.tables.includes((t as any).tableName)),
      };
    }
    
    if (options.includeData !== false) {
      for (const table of schema.tables) {
        if (!options.tables || options.tables.includes(table.name)) {
          const result = await this.sqliteService.executeQuery(
            databaseId,
            `SELECT * FROM "${table.name}"`
          );
          
          exportData.data[table.name] = result.values.map(row => {
            const obj: any = {};
            result.columns.forEach((col, i) => {
              obj[col] = row[i];
            });
            return obj;
          });
        }
      }
    }
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const filename = `database_export_${new Date().toISOString().split('T')[0]}.json`;
    saveAs(blob, filename);
  }

  async importData(databaseId: string, file: File, options: ImportOptions): Promise<void> {
    const connection = this.sqliteService.getDatabase(databaseId);
    if (!connection) {
      throw new Error('Database connection not found');
    }

    switch (options.format) {
      case 'sqlite':
        await this.importSQLite(databaseId, file);
        break;
      case 'sql':
        await this.importSQL(databaseId, file);
        break;
      case 'csv':
        await this.importCSV(databaseId, file, options);
        break;
      case 'json':
        await this.importJSON(databaseId, file);
        break;
      default:
        throw new Error(`Unsupported import format: ${options.format}`);
    }
  }

  private async importSQLite(_databaseId: string, _file: File): Promise<void> {
    // SQLite import is handled by opening a new database
    throw new Error('Use "Open Database" to import SQLite files');
  }

  private async importSQL(databaseId: string, file: File): Promise<void> {
    const text = await file.text();
    const queries = this.splitSQLQueries(text);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          await this.sqliteService.executeQuery(databaseId, query);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to execute query: ${error}`);
        }
      }
    }
    
    if (errorCount > 0) {
      throw new Error(`Import completed with ${successCount} successful queries and ${errorCount} errors`);
    }
  }

  private async importCSV(databaseId: string, file: File, options: ImportOptions): Promise<void> {
    if (!options.tableName) {
      throw new Error('Table name is required for CSV import');
    }
    
    const text = await file.text();
    const parseResult = Papa.parse(text, {
      header: options.headerRow !== false,
      delimiter: options.delimiter,
      skipEmptyLines: true,
    });
    
    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parseResult.errors.map((e: any) => e.message).join(', ')}`);
    }
    
    const data = parseResult.data as any[];
    if (data.length === 0) {
      throw new Error('No data found in CSV file');
    }
    
    // Get column names
    const columns = options.headerRow !== false 
      ? Object.keys(data[0])
      : data[0].map((_: any, i: number) => `column${i + 1}`);
    
    // Create table if it doesn't exist
    const columnDefs = columns.map((col: any) => `"${col}" TEXT`).join(', ');
    try {
      await this.sqliteService.executeQuery(
        databaseId,
        `CREATE TABLE IF NOT EXISTS "${options.tableName}" (${columnDefs})`
      );
    } catch (error) {
      console.warn('Table might already exist:', error);
    }
    
    // Insert data
    const values = data.map(row => {
      const rowValues = columns.map((col: any) => {
        const value = (row as any)[col];
        if (value === null || value === undefined || value === '') return 'NULL';
        return `'${String(value).replace(/'/g, "''")}'`;
      }).join(', ');
      return `(${rowValues})`;
    }).join(', ');
    
    await this.sqliteService.executeQuery(
      databaseId,
      `INSERT INTO "${options.tableName}" VALUES ${values}`
    );
  }

  private async importJSON(databaseId: string, file: File): Promise<void> {
    const text = await file.text();
    const jsonData = JSON.parse(text);
    
    if (jsonData.metadata && jsonData.metadata.format === 'SQLite Zen JSON Export') {
      // Import our own export format
      if (jsonData.schema) {
        // Create tables
        for (const table of jsonData.schema.tables) {
          try {
            await this.sqliteService.executeQuery(databaseId, (table as any).sql);
          } catch (error) {
            console.warn(`Failed to create table ${(table as any).name}:`, error);
          }
        }
        
        // Create indices
        for (const index of jsonData.schema.indices || []) {
          try {
            await this.sqliteService.executeQuery(databaseId, (index as any).sql);
          } catch (error) {
            console.warn(`Failed to create index ${(index as any).name}:`, error);
          }
        }
      }
      
      // Import data
      if (jsonData.data) {
        for (const [tableName, rows] of Object.entries(jsonData.data)) {
          if (Array.isArray(rows) && rows.length > 0) {
            const columns = Object.keys(rows[0]);
            const values = rows.map(row => {
              const rowValues = columns.map((col: any) => {
                const value = (row as any)[col];
                if (value === null) return 'NULL';
                if (typeof value === 'number') return value.toString();
                if (typeof value === 'boolean') return value ? '1' : '0';
                return `'${String(value).replace(/'/g, "''")}'`;
              }).join(', ');
              return `(${rowValues})`;
            }).join(', ');
            
            await this.sqliteService.executeQuery(
              databaseId,
              `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES ${values}`
            );
          }
        }
      }
    } else {
      throw new Error('Unsupported JSON format. Use SQLite Zen export format or specify a table name.');
    }
  }

  private splitSQLQueries(sql: string): string[] {
    const queries: string[] = [];
    let currentQuery = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let commentType = '';
    
    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];
      const prevChar = sql[i - 1];
      
      // Handle comments
      if (!inString) {
        if (!inComment && char === '-' && nextChar === '-') {
          inComment = true;
          commentType = 'line';
          i++; // Skip next char
          continue;
        } else if (!inComment && char === '/' && nextChar === '*') {
          inComment = true;
          commentType = 'block';
          i++; // Skip next char
          continue;
        } else if (inComment && commentType === 'line' && char === '\n') {
          inComment = false;
          continue;
        } else if (inComment && commentType === 'block' && char === '*' && nextChar === '/') {
          inComment = false;
          i++; // Skip next char
          continue;
        }
      }
      
      if (inComment) continue;
      
      // Handle strings
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
      }
      
      currentQuery += char;
      
      // Check for query end
      if (!inString && char === ';') {
        queries.push(currentQuery.trim());
        currentQuery = '';
      }
    }
    
    if (currentQuery.trim()) {
      queries.push(currentQuery.trim());
    }
    
    return queries;
  }
}
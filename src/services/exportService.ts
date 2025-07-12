import { SQLiteService } from './sqliteService';
import { ExportOptions } from '@/types/database';

export class ExportService {
  constructor(private sqliteService: SQLiteService) {}

  async exportDatabase(databaseId: string, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'sqlite':
        return this.exportSQLite(databaseId);
      case 'sql':
        return this.exportSQL(databaseId, options);
      case 'csv':
        return this.exportCSV(databaseId, options);
      case 'json':
        return this.exportJSON(databaseId, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async exportSQLite(databaseId: string): Promise<Blob> {
    const data = this.sqliteService.exportDatabase(databaseId);
    return new Blob([data], { type: 'application/x-sqlite3' });
  }

  private async exportSQL(databaseId: string, options: ExportOptions): Promise<Blob> {
    let sql = '';
    const tables = options.tables || await this.getAllTableNames(databaseId);

    if (options.includeSchema !== false) {
      for (const table of tables) {
        const schemaResult = await this.sqliteService.executeQuery(
          databaseId,
          `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`
        );
        if (schemaResult.values.length > 0) {
          sql += `${schemaResult.values[0][0]};\n\n`;
        }
      }
    }

    if (options.includeData !== false) {
      for (const table of tables) {
        const dataResult = await this.sqliteService.executeQuery(databaseId, `SELECT * FROM "${table}"`);
        if (dataResult.values.length > 0) {
          sql += `-- Data for table ${table}\n`;
          for (const row of dataResult.values) {
            const values = row.map(v => 
              v === null ? 'NULL' : 
              typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : 
              v
            ).join(', ');
            sql += `INSERT INTO "${table}" VALUES (${values});\n`;
          }
          sql += '\n';
        }
      }
    }

    return new Blob([sql], { type: 'text/plain' });
  }

  private async exportCSV(databaseId: string, options: ExportOptions): Promise<Blob> {
    const tables = options.tables || await this.getAllTableNames(databaseId);
    let csv = '';

    for (const table of tables) {
      const result = await this.sqliteService.executeQuery(databaseId, `SELECT * FROM "${table}"`);
      
      if (result.values.length > 0) {
        csv += `Table: ${table}\n`;
        csv += result.columns.join(',') + '\n';
        
        for (const row of result.values) {
          csv += row.map(v => {
            if (v === null) return '';
            const str = String(v);
            return str.includes(',') || str.includes('"') || str.includes('\n') 
              ? `"${str.replace(/"/g, '""')}"` 
              : str;
          }).join(',') + '\n';
        }
        csv += '\n';
      }
    }

    return new Blob([csv], { type: 'text/csv' });
  }

  private async exportJSON(databaseId: string, options: ExportOptions): Promise<Blob> {
    const tables = options.tables || await this.getAllTableNames(databaseId);
    const data: any = {};

    for (const table of tables) {
      const result = await this.sqliteService.executeQuery(databaseId, `SELECT * FROM "${table}"`);
      data[table] = result.values.map(row => {
        const obj: any = {};
        result.columns.forEach((col, i) => {
          obj[col] = row[i];
        });
        return obj;
      });
    }

    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }


  private async getAllTableNames(databaseId: string): Promise<string[]> {
    const result = await this.sqliteService.executeQuery(
      databaseId,
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    return result.values.map(row => row[0] as string);
  }
}
import { QueryTemplate } from '@/types/database';
import { generateUUID } from '@/utils/uuid';

export class QueryTemplateService {
  private static STORAGE_KEY = 'sqlitezen_query_templates';
  private templates: Map<string, QueryTemplate> = new Map();

  constructor() {
    this.loadTemplates();
    this.initializeDefaultTemplates();
  }

  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(QueryTemplateService.STORAGE_KEY);
      if (stored) {
        const templates = JSON.parse(stored) as QueryTemplate[];
        templates.forEach(template => this.templates.set(template.id, template));
      }
    } catch (error) {
      console.error('Failed to load query templates:', error);
    }
  }

  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem(QueryTemplateService.STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save query templates:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.size === 0) {
      // Add default templates
      this.addTemplate({
        name: 'Select All',
        category: 'Basic',
        description: 'Select all records from a table',
        query: 'SELECT * FROM {{tableName}}',
        variables: [
          { name: 'tableName', type: 'string', description: 'Name of the table' }
        ]
      });

      this.addTemplate({
        name: 'Count Records',
        category: 'Basic',
        description: 'Count total records in a table',
        query: 'SELECT COUNT(*) as total FROM {{tableName}}',
        variables: [
          { name: 'tableName', type: 'string', description: 'Name of the table' }
        ]
      });

      this.addTemplate({
        name: 'Find Duplicates',
        category: 'Analysis',
        description: 'Find duplicate values in a column',
        query: `SELECT {{columnName}}, COUNT(*) as count 
FROM {{tableName}} 
GROUP BY {{columnName}} 
HAVING COUNT(*) > 1 
ORDER BY count DESC`,
        variables: [
          { name: 'tableName', type: 'string', description: 'Name of the table' },
          { name: 'columnName', type: 'string', description: 'Column to check for duplicates' }
        ]
      });

      this.addTemplate({
        name: 'Table Info',
        category: 'Schema',
        description: 'Get table structure information',
        query: 'PRAGMA table_info({{tableName}})',
        variables: [
          { name: 'tableName', type: 'string', description: 'Name of the table' }
        ]
      });

      this.addTemplate({
        name: 'Create Index',
        category: 'DDL',
        description: 'Create an index on a table column',
        query: 'CREATE INDEX idx_{{indexName}} ON {{tableName}}({{columnName}})',
        variables: [
          { name: 'indexName', type: 'string', description: 'Name for the index' },
          { name: 'tableName', type: 'string', description: 'Name of the table' },
          { name: 'columnName', type: 'string', description: 'Column to index' }
        ]
      });

      this.addTemplate({
        name: 'Date Range Query',
        category: 'Filters',
        description: 'Select records within a date range',
        query: `SELECT * FROM {{tableName}} 
WHERE {{dateColumn}} BETWEEN '{{startDate}}' AND '{{endDate}}'`,
        variables: [
          { name: 'tableName', type: 'string', description: 'Name of the table' },
          { name: 'dateColumn', type: 'string', description: 'Date column name' },
          { name: 'startDate', type: 'date', description: 'Start date' },
          { name: 'endDate', type: 'date', description: 'End date' }
        ]
      });
    }
  }

  getTemplates(): QueryTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): QueryTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  getTemplate(id: string): QueryTemplate | undefined {
    return this.templates.get(id);
  }

  addTemplate(templateData: Omit<QueryTemplate, 'id' | 'createdAt' | 'updatedAt'>): QueryTemplate {
    const template: QueryTemplate = {
      ...templateData,
      id: generateUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.templates.set(template.id, template);
    this.saveTemplates();
    return template;
  }

  updateTemplate(id: string, updates: Partial<Omit<QueryTemplate, 'id' | 'createdAt'>>): QueryTemplate | undefined {
    const template = this.templates.get(id);
    if (!template) return undefined;

    const updated = {
      ...template,
      ...updates,
      updatedAt: Date.now(),
    };

    this.templates.set(id, updated);
    this.saveTemplates();
    return updated;
  }

  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  applyTemplate(templateId: string, variables: Record<string, any>): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    let query = template.query;
    
    // Replace variables in the query
    if (template.variables) {
      template.variables.forEach(variable => {
        const value = variables[variable.name];
        if (value !== undefined) {
          const regex = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g');
          query = query.replace(regex, String(value));
        }
      });
    }

    return query;
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(template => categories.add(template.category));
    return Array.from(categories).sort();
  }
}
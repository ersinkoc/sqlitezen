export function formatSQL(sql: string): string {
  return SQLFormatter.format(sql);
}

export class SQLFormatter {
  private static readonly KEYWORDS = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
    'DROP', 'ALTER', 'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'CHECK', 'INDEX', 'VIEW', 'TRIGGER',
    'BEGIN', 'END', 'TRANSACTION', 'COMMIT', 'ROLLBACK', 'AND', 'OR', 'IN',
    'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE',
    'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'COALESCE'
  ];

  private static readonly FUNCTIONS = [
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'LENGTH', 'SUBSTR',
    'UPPER', 'LOWER', 'TRIM', 'LTRIM', 'RTRIM', 'REPLACE', 'COALESCE',
    'NULLIF', 'DATE', 'TIME', 'DATETIME', 'STRFTIME', 'JULIANDAY'
  ];

  static format(sql: string): string {
    if (!sql) return '';

    // Remove extra whitespace and normalize line endings
    let formatted = sql.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

    // Add line breaks for major clauses
    const clauses = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
      'LIMIT', 'OFFSET', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE',
      'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
      'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW'
    ];

    clauses.forEach(clause => {
      const regex = new RegExp(`\\b${clause}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${clause}`);
    });

    // Add line breaks for JOIN clauses
    formatted = formatted.replace(/\b(LEFT|RIGHT|INNER|OUTER|CROSS)?\s*JOIN\b/gi, '\n$&');

    // Add line breaks for AND/OR in WHERE clauses
    formatted = formatted.replace(/\b(AND|OR)\b/gi, '\n  $1');

    // Handle commas in SELECT lists
    formatted = formatted.replace(/,\s*(?=\S)/g, ',\n  ');

    // Indent subqueries
    formatted = this.indentSubqueries(formatted);

    // Capitalize keywords
    this.KEYWORDS.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, keyword);
    });

    // Capitalize functions
    this.FUNCTIONS.forEach(func => {
      const regex = new RegExp(`\\b${func}\\s*\\(`, 'gi');
      formatted = formatted.replace(regex, `${func}(`);
    });

    // Clean up multiple line breaks
    formatted = formatted.replace(/\n\s*\n/g, '\n');

    // Trim each line
    formatted = formatted.split('\n').map(line => line.trim()).join('\n');

    // Remove leading newline if present
    formatted = formatted.replace(/^\n/, '');

    return formatted;
  }

  private static indentSubqueries(sql: string): string {
    let depth = 0;
    const lines = sql.split('\n');
    const indentedLines: string[] = [];

    for (const line of lines) {
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      
      if (closeParens > openParens) {
        depth -= (closeParens - openParens);
      }

      const indent = '  '.repeat(Math.max(0, depth));
      indentedLines.push(indent + line);

      if (openParens > closeParens) {
        depth += (openParens - closeParens);
      }
    }

    return indentedLines.join('\n');
  }

  static validateSQL(sql: string): { valid: boolean; error?: string } {
    try {
      // Basic syntax validation
      const trimmed = sql.trim();
      
      if (!trimmed) {
        return { valid: false, error: 'Empty query' };
      }

      // Check for common syntax errors
      const openParens = (trimmed.match(/\(/g) || []).length;
      const closeParens = (trimmed.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        return { valid: false, error: 'Mismatched parentheses' };
      }

      const openQuotes = (trimmed.match(/'/g) || []).length;
      if (openQuotes % 2 !== 0) {
        return { valid: false, error: 'Unclosed string literal' };
      }

      // Check for semicolon at the end (optional)
      if (!trimmed.endsWith(';') && !trimmed.endsWith(';')) {
        // This is just a warning, not an error
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  }
}
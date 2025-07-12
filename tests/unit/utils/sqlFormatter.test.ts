import { describe, it, expect } from 'vitest';
import { formatSQL } from '@/utils/sqlFormatter';

describe('formatSQL', () => {
  it('should format simple SELECT statement', () => {
    const sql = 'SELECT * FROM users WHERE id = 1';
    const formatted = formatSQL(sql);
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('WHERE');
  });

  it('should format INSERT statement', () => {
    const sql = 'INSERT INTO users (name, email) VALUES ("John", "john@example.com")';
    const formatted = formatSQL(sql);
    expect(formatted).toContain('INSERT INTO');
    expect(formatted).toContain('VALUES');
  });

  it('should format CREATE TABLE statement', () => {
    const sql = 'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)';
    const formatted = formatSQL(sql);
    expect(formatted).toContain('CREATE TABLE');
    expect(formatted).toContain('PRIMARY KEY');
  });

  it('should handle empty string', () => {
    const formatted = formatSQL('');
    expect(formatted).toBe('');
  });

  it('should preserve case for identifiers', () => {
    const sql = 'SELECT userId, userName FROM UserTable';
    const formatted = formatSQL(sql);
    expect(formatted).toContain('userId');
    expect(formatted).toContain('userName');
    expect(formatted).toContain('UserTable');
  });
});
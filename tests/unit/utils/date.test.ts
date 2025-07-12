import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/date';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-01T12:00:00');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/2024-01-01/);
  });

  it('should handle invalid dates', () => {
    const invalidDate = new Date('invalid');
    const formatted = formatDate(invalidDate);
    expect(formatted).toBe('Invalid Date');
  });

  it('should format current date', () => {
    const now = new Date();
    const formatted = formatDate(now);
    expect(formatted).toBeTruthy();
    expect(formatted).not.toBe('Invalid Date');
  });
});
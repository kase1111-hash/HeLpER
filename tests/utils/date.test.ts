import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDateISO,
  formatDateDisplay,
  formatDateShort,
  getTimestamp,
  isToday,
  getRelativeDay,
  parseDate,
  addDays,
} from '../../src/lib/utils/date';

describe('Date Utilities', () => {
  // Spec: Date handling and formatting
  describe('formatDateISO', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date('2025-12-26T10:30:00Z');
      expect(formatDateISO(date)).toBe('2025-12-26');
    });

    it('should handle different dates correctly', () => {
      expect(formatDateISO(new Date('2025-01-01'))).toBe('2025-01-01');
      expect(formatDateISO(new Date('2025-12-31'))).toBe('2025-12-31');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date for display (e.g., "December 26, 2025")', () => {
      const result = formatDateDisplay('2025-12-26', 'en-US');
      expect(result).toContain('December');
      expect(result).toContain('26');
      expect(result).toContain('2025');
    });

    it('should handle different locales', () => {
      const result = formatDateDisplay('2025-12-26', 'en-GB');
      expect(result).toContain('December');
    });
  });

  describe('formatDateShort', () => {
    it('should format date for short display (e.g., "Dec 26")', () => {
      const result = formatDateShort('2025-12-26', 'en-US');
      expect(result).toContain('Dec');
      expect(result).toContain('26');
    });
  });

  describe('getTimestamp', () => {
    it('should return ISO 8601 timestamp', () => {
      const timestamp = getTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = formatDateISO(new Date());
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('getRelativeDay', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-12-26T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "Today" for today\'s date', () => {
      expect(getRelativeDay('2025-12-26')).toBe('Today');
    });

    it('should return "Yesterday" for yesterday', () => {
      expect(getRelativeDay('2025-12-25')).toBe('Yesterday');
    });

    it('should return "Tomorrow" for tomorrow', () => {
      expect(getRelativeDay('2025-12-27')).toBe('Tomorrow');
    });

    it('should return formatted date for other dates', () => {
      const result = getRelativeDay('2025-01-01');
      expect(result).toContain('January');
    });
  });

  describe('parseDate', () => {
    it('should parse date string to Date object', () => {
      const date = parseDate('2025-12-26');
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(11); // December is 11
      expect(date.getDate()).toBe(26);
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      expect(addDays('2025-12-26', 1)).toBe('2025-12-27');
      expect(addDays('2025-12-26', 7)).toBe('2026-01-02');
    });

    it('should subtract days with negative numbers', () => {
      expect(addDays('2025-12-26', -1)).toBe('2025-12-25');
    });

    it('should handle month boundaries', () => {
      expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    });
  });
});

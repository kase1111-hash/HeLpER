import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import {
  validateEntry,
  publishEntry,
  getAuthorStats,
  checkConnection,
  noteToEntry,
  getContentTypeLabel,
  getContentTypeIcon,
  getMonetizationLabel,
  getVisibilityLabel,
  formatPrice,
  detectContentType,
  suggestIntent,
  getDefaultTags,
  extractChapterNumber,
} from '../../src/lib/services/natlangchain';
import type { Note, NatLangChainEntry, JournalContext } from '../../src/lib/types';

// Mock is set up in setup.ts
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('NatLangChain Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // API functions
  describe('validateEntry', () => {
    it('should validate an entry successfully', async () => {
      const mockValidation = {
        valid: true,
        clarity_score: 0.95,
        intent_detected: 'Sharing personal thoughts',
        suggestions: [],
        warnings: [],
      };

      mockInvoke.mockResolvedValueOnce(mockValidation);

      const entry: NatLangChainEntry = {
        author: 'test-author',
        content: 'Test content',
        intent: 'Sharing thoughts',
        contentType: 'journal',
        monetization: 'free',
        visibility: 'public',
        createdAt: new Date().toISOString(),
      };

      const result = await validateEntry('http://localhost:5000', entry);

      expect(mockInvoke).toHaveBeenCalledWith('nlc_validate_entry', {
        apiUrl: 'http://localhost:5000',
        entry,
      });
      expect(result).toEqual(mockValidation);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Validation failed'));

      const entry: NatLangChainEntry = {
        author: 'test',
        content: 'Test',
        intent: 'Test',
        contentType: 'journal',
        monetization: 'free',
        visibility: 'public',
        createdAt: new Date().toISOString(),
      };

      const result = await validateEntry('http://localhost:5000', entry);
      expect(result).toBeNull();
    });
  });

  describe('publishEntry', () => {
    const baseEntry: NatLangChainEntry = {
      author: 'test-author',
      content: 'Test content',
      intent: 'Sharing thoughts',
      contentType: 'journal',
      monetization: 'free',
      visibility: 'public',
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    // publishEntry makes several IPC calls (sign, public key, publish, audit log), so route
    // the mock by command name rather than by call order.
    function mockIpc(handlers: Record<string, unknown | (() => unknown)>) {
      mockInvoke.mockImplementation(async (command: string) => {
        const handler = handlers[command];
        if (typeof handler === 'function') return handler();
        return handler;
      });
    }

    it('should sign and publish an entry successfully', async () => {
      mockIpc({
        nlc_sign_entry: 'sig-abc',
        nlc_get_author_public_key: 'pub-xyz',
        nlc_publish_entry: { success: true, entryId: 'entry-123', blockHash: 'hash-456' },
        log_audit_event: undefined,
      });

      const result = await publishEntry('http://localhost:5000', baseEntry);

      expect(mockInvoke).toHaveBeenCalledWith('nlc_sign_entry', { content: 'Test content' });
      expect(mockInvoke).toHaveBeenCalledWith('nlc_publish_entry', {
        apiUrl: 'http://localhost:5000',
        entry: { ...baseEntry, signature: 'sig-abc', publicKey: 'pub-xyz' },
      });
      expect(result).toEqual({ success: true, entryId: 'entry-123', blockHash: 'hash-456' });
    });

    it('should write an audit event after a successful publish', async () => {
      mockIpc({
        nlc_sign_entry: 'sig-abc',
        nlc_get_author_public_key: 'pub-xyz',
        nlc_publish_entry: { success: true, entryId: 'entry-123', blockHash: 'hash-456' },
        log_audit_event: undefined,
      });

      await publishEntry('http://localhost:5000', baseEntry);

      expect(mockInvoke).toHaveBeenCalledWith('log_audit_event', {
        eventType: 'nlc_publish',
        eventData: JSON.stringify({
          entryId: 'entry-123',
          blockHash: 'hash-456',
          author: 'test-author',
        }),
      });
    });

    it('should not write an audit event when the publish is unsuccessful', async () => {
      mockIpc({
        nlc_sign_entry: 'sig-abc',
        nlc_get_author_public_key: 'pub-xyz',
        nlc_publish_entry: { success: false, error: 'rejected' },
      });

      const result = await publishEntry('http://localhost:5000', baseEntry);

      expect(result.success).toBe(false);
      expect(mockInvoke).not.toHaveBeenCalledWith('log_audit_event', expect.anything());
    });

    it('should still publish unsigned when signing fails', async () => {
      mockIpc({
        nlc_sign_entry: () => {
          throw new Error('keychain unavailable');
        },
        nlc_get_author_public_key: () => {
          throw new Error('keychain unavailable');
        },
        nlc_publish_entry: { success: true, entryId: 'entry-1', blockHash: 'hash-1' },
        log_audit_event: undefined,
      });

      const result = await publishEntry('http://localhost:5000', baseEntry);

      expect(result.success).toBe(true);
      expect(mockInvoke).toHaveBeenCalledWith('nlc_publish_entry', {
        apiUrl: 'http://localhost:5000',
        entry: { ...baseEntry, signature: undefined, publicKey: undefined },
      });
    });

    it('should return error result on failure', async () => {
      mockIpc({
        nlc_sign_entry: 'sig-abc',
        nlc_get_author_public_key: 'pub-xyz',
        nlc_publish_entry: () => {
          throw new Error('Publish failed');
        },
      });

      const result = await publishEntry('http://localhost:5000', baseEntry);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Publish failed');
    });

    it('should block publishing content that contains secrets', async () => {
      const result = await publishEntry('http://localhost:5000', {
        ...baseEntry,
        content: 'My key is AKIAIOSFODNN7EXAMPLE',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('AWS Access Key');
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });

  describe('getAuthorStats', () => {
    it('should fetch author stats', async () => {
      const mockStats = {
        totalEntries: 10,
      };

      mockInvoke.mockResolvedValueOnce(mockStats);

      const result = await getAuthorStats('http://localhost:5000', 'author-id');

      expect(mockInvoke).toHaveBeenCalledWith('nlc_get_stats', {
        apiUrl: 'http://localhost:5000',
        authorId: 'author-id',
      });
      expect(result).toEqual(mockStats);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Stats failed'));

      const result = await getAuthorStats('http://localhost:5000', 'author-id');
      expect(result).toBeNull();
    });
  });

  describe('checkConnection', () => {
    it('should return true when connected', async () => {
      mockInvoke.mockResolvedValueOnce(true);

      const result = await checkConnection('http://localhost:5000');

      expect(mockInvoke).toHaveBeenCalledWith('nlc_check_connection', {
        apiUrl: 'http://localhost:5000',
      });
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await checkConnection('http://localhost:5000');
      expect(result).toBe(false);
    });
  });

  // Utility functions
  describe('noteToEntry', () => {
    it('should convert a note to an entry', () => {
      const note: Note = {
        id: 'note-1',
        date: '2025-01-27',
        title: 'Test Title',
        content: 'Test content for journal',
        createdAt: '2025-01-27T10:00:00Z',
        updatedAt: '2025-01-27T10:00:00Z',
      };

      const entry = noteToEntry(
        note,
        'author-id',
        'Sharing thoughts',
        'journal',
        'free',
        'public'
      );

      expect(entry.author).toBe('author-id');
      expect(entry.content).toBe('Test content for journal');
      expect(entry.intent).toBe('Sharing thoughts');
      expect(entry.title).toBe('Test Title');
      expect(entry.contentType).toBe('journal');
      expect(entry.monetization).toBe('free');
      expect(entry.visibility).toBe('public');
    });

    it('should include weather context when provided', () => {
      const note: Note = {
        id: 'note-1',
        date: '2025-01-27',
        title: null,
        content: 'Test content',
        createdAt: '2025-01-27T10:00:00Z',
        updatedAt: '2025-01-27T10:00:00Z',
      };

      const journalContext: JournalContext = {
        weather: {
          location: 'New York, USA',
          tempCelsius: 20,
          tempFahrenheit: 68,
          feelsLikeCelsius: 18,
          feelsLikeFahrenheit: 64,
          condition: 'clear',
          conditionText: 'Sunny',
          humidity: 50,
          windKph: 10,
          windMph: 6,
          windDirection: 'N',
          pressure: 1013,
          uvIndex: 5,
          visibility: 10,
          isDay: true,
          timestamp: '2025-01-27T10:00:00Z',
        },
        dayOfWeek: 'Monday',
        timeOfDay: 'morning',
        moonPhase: 'Full Moon',
      };

      const entry = noteToEntry(
        note,
        'author-id',
        'Sharing thoughts',
        'journal',
        'free',
        'public',
        undefined,
        journalContext
      );

      expect(entry.context).toBeDefined();
      expect(entry.context?.weather).toContain('Sunny');
      expect(entry.context?.location).toBe('New York, USA');
    });
  });

  describe('getContentTypeLabel', () => {
    it('should return correct labels', () => {
      expect(getContentTypeLabel('journal')).toBe('Journal Entry');
      expect(getContentTypeLabel('article')).toBe('News Article');
      expect(getContentTypeLabel('story_chapter')).toBe('Story Chapter');
    });
  });

  describe('getContentTypeIcon', () => {
    it('should return correct icons', () => {
      expect(getContentTypeIcon('journal')).toBe('📝');
      expect(getContentTypeIcon('article')).toBe('📰');
      expect(getContentTypeIcon('story_chapter')).toBe('📖');
    });
  });

  describe('getMonetizationLabel', () => {
    it('should return correct labels', () => {
      expect(getMonetizationLabel('free')).toBe('Free');
      expect(getMonetizationLabel('subscription')).toBe('Subscribers Only');
      expect(getMonetizationLabel('per_entry')).toBe('Pay Per Entry');
      expect(getMonetizationLabel('tip_jar')).toBe('Tip Jar');
    });
  });

  describe('getVisibilityLabel', () => {
    it('should return correct labels', () => {
      expect(getVisibilityLabel('public')).toBe('Public');
      expect(getVisibilityLabel('subscribers_only')).toBe('Subscribers Only');
      expect(getVisibilityLabel('private')).toBe('Private (Draft)');
    });
  });

  describe('formatPrice', () => {
    it('should format prices correctly', () => {
      expect(formatPrice(0)).toBe('$0.00');
      expect(formatPrice(1.5)).toBe('$1.50');
      expect(formatPrice(99.99)).toBe('$99.99');
    });
  });

  describe('detectContentType', () => {
    it('should detect journal content', () => {
      expect(detectContentType('Today I went to the store')).toBe('journal');
      expect(detectContentType('I feel happy this morning')).toBe('journal');
      expect(detectContentType('Dear diary, this was my day')).toBe('journal');
    });

    it('should detect article content', () => {
      expect(detectContentType('According to officials, the new policy was announced')).toBe('article');
      expect(detectContentType('Breaking: Major announcement reported today')).toBe('article');
    });

    it('should detect story content', () => {
      expect(detectContentType('Chapter 1: The Beginning. Once upon a time, she said hello')).toBe('story_chapter');
      expect(detectContentType('"Hello," he said. She looked at him and walked away.')).toBe('story_chapter');
    });

    it('should default to journal for ambiguous content', () => {
      expect(detectContentType('Random text without clear indicators')).toBe('journal');
    });
  });

  describe('suggestIntent', () => {
    it('should suggest intent for journal content', () => {
      const intent = suggestIntent('Today I learned something new', 'journal');
      expect(intent).toContain('learning');
    });

    it('should prefer specific journal themes over the generic daily-entry intent', () => {
      expect(suggestIntent('Today I am grateful for my family', 'journal')).toContain('gratitude');
      expect(suggestIntent('This morning I set a goal for the year', 'journal')).toContain('goals');
    });

    it('should fall back to the daily-entry intent for plain daily journal content', () => {
      expect(suggestIntent('Today I went to the store', 'journal')).toContain('daily journal');
    });

    it('should suggest intent for article content', () => {
      const intent = suggestIntent('Breaking news: Major event happened', 'article');
      expect(intent).toContain('breaking');
    });

    it('should suggest intent for story content', () => {
      const intent = suggestIntent('Chapter 1: The story begins', 'story_chapter');
      expect(intent).toContain('story');
    });
  });

  describe('getDefaultTags', () => {
    it('should return correct default tags', () => {
      expect(getDefaultTags('journal')).toContain('personal');
      expect(getDefaultTags('article')).toContain('news');
      expect(getDefaultTags('story_chapter')).toContain('fiction');
    });
  });

  describe('extractChapterNumber', () => {
    it('should extract chapter numbers', () => {
      expect(extractChapterNumber('Chapter 5: The Test')).toBe(5);
      expect(extractChapterNumber('Ch. 10 - New Beginning')).toBe(10);
      expect(extractChapterNumber('Part 3')).toBe(3);
      expect(extractChapterNumber('#7')).toBe(7);
    });

    it('should return null when no chapter number found', () => {
      expect(extractChapterNumber('No chapter number here')).toBeNull();
    });
  });
});

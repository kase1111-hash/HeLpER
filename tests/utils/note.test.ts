import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateId,
  createNote,
  extractTitle,
  getNotePreview,
  updateNoteContent,
  softDeleteNote,
  isDeleted,
  sortNotesByCreated,
  sortNotesByUpdated,
} from '../../src/lib/utils/note';
import type { Note } from '../../src/lib/types';

describe('Note Utilities', () => {
  // Spec: Note capacity - up to 5,000 characters per note
  describe('generateId', () => {
    it('should generate a valid UUID', () => {
      const id = generateId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const ids = new Set(Array.from({ length: 100 }, () => generateId()));
      expect(ids.size).toBe(100);
    });
  });

  describe('createNote', () => {
    it('should create a note with default values', () => {
      const note = createNote();
      expect(note.id).toBeDefined();
      expect(note.content).toBe('');
      expect(note.title).toBeNull();
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it('should create a note with provided content', () => {
      const note = createNote('Test content');
      expect(note.content).toBe('Test content');
    });

    it('should create a note with provided date', () => {
      const note = createNote('', '2025-12-26');
      expect(note.date).toBe('2025-12-26');
    });
  });

  describe('extractTitle', () => {
    // Spec: Note title max 50 chars
    it('should extract first line as title', () => {
      const title = extractTitle('First line\nSecond line');
      expect(title).toBe('First line');
    });

    it('should truncate title to 50 characters', () => {
      const longContent = 'A'.repeat(100);
      const title = extractTitle(longContent);
      expect(title?.length).toBeLessThanOrEqual(50);
      expect(title).toContain('...');
    });

    it('should return null for empty content', () => {
      expect(extractTitle('')).toBeNull();
      expect(extractTitle('   ')).toBeNull();
    });
  });

  describe('getNotePreview', () => {
    it('should return title if available', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: 'My Title',
        content: 'Some content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(getNotePreview(note)).toBe('My Title');
    });

    it('should return "Empty note" for empty content', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(getNotePreview(note)).toBe('Empty note');
    });
  });

  describe('updateNoteContent', () => {
    it('should update content and timestamp', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'Old content',
        createdAt: '2025-12-26T10:00:00Z',
        updatedAt: '2025-12-26T10:00:00Z',
      };

      const updated = updateNoteContent(note, 'New content');
      expect(updated.content).toBe('New content');
      expect(updated.updatedAt).not.toBe(note.updatedAt);
    });

    it('should extract title from new content', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = updateNoteContent(note, 'New Title\nBody text');
      expect(updated.title).toBe('New Title');
    });
  });

  describe('softDeleteNote', () => {
    // Spec: Soft delete support
    it('should set deletedAt timestamp', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const deleted = softDeleteNote(note);
      expect(deleted.deletedAt).toBeDefined();
    });
  });

  describe('isDeleted', () => {
    it('should return true for deleted notes', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
      };
      expect(isDeleted(note)).toBe(true);
    });

    it('should return false for non-deleted notes', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(isDeleted(note)).toBe(false);
    });
  });

  describe('sortNotesByCreated', () => {
    it('should sort notes by creation time (newest first)', () => {
      const notes: Note[] = [
        {
          id: '1',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T10:00:00Z',
          updatedAt: '2025-12-26T10:00:00Z',
        },
        {
          id: '2',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T12:00:00Z',
          updatedAt: '2025-12-26T12:00:00Z',
        },
        {
          id: '3',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T11:00:00Z',
          updatedAt: '2025-12-26T11:00:00Z',
        },
      ];

      const sorted = sortNotesByCreated(notes);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });
  });

  describe('sortNotesByUpdated', () => {
    it('should sort notes by last updated (most recent first)', () => {
      const notes: Note[] = [
        {
          id: '1',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T10:00:00Z',
          updatedAt: '2025-12-26T15:00:00Z',
        },
        {
          id: '2',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T12:00:00Z',
          updatedAt: '2025-12-26T12:00:00Z',
        },
        {
          id: '3',
          date: '2025-12-26',
          title: null,
          content: '',
          createdAt: '2025-12-26T11:00:00Z',
          updatedAt: '2025-12-26T16:00:00Z',
        },
      ];

      const sorted = sortNotesByUpdated(notes);
      expect(sorted[0].id).toBe('3');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('2');
    });
  });
});

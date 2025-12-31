import type { Note } from '../types';
import { formatDateISO, getTimestamp } from './date';
import { NOTE_TITLE_MAX_LENGTH } from '../constants';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new note with defaults
 */
export function createNote(content = '', date?: string): Note {
  const now = getTimestamp();
  return {
    id: generateId(),
    date: date || formatDateISO(new Date()),
    title: null,
    content,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Extract title from note content (first line, max 50 chars)
 */
export function extractTitle(content: string): string | null {
  if (!content.trim()) return null;

  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length <= NOTE_TITLE_MAX_LENGTH) {
    return firstLine;
  }
  return firstLine.substring(0, NOTE_TITLE_MAX_LENGTH - 3) + '...';
}

/**
 * Get preview text for a note
 */
export function getNotePreview(note: Note, _maxLength = 50): string {
  if (note.title) return note.title;
  if (!note.content.trim()) return 'Empty note';
  return extractTitle(note.content) || 'Empty note';
}

/**
 * Update a note's content and timestamp
 */
export function updateNoteContent(note: Note, content: string): Note {
  return {
    ...note,
    content,
    title: extractTitle(content),
    updatedAt: getTimestamp(),
  };
}

/**
 * Soft delete a note
 */
export function softDeleteNote(note: Note): Note {
  return {
    ...note,
    deletedAt: getTimestamp(),
  };
}

/**
 * Check if a note is deleted
 */
export function isDeleted(note: Note): boolean {
  return !!note.deletedAt;
}

/**
 * Sort notes by creation time (newest first)
 */
export function sortNotesByCreated(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Sort notes by last updated (most recent first)
 */
export function sortNotesByUpdated(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

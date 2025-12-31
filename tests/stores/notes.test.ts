import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  currentDate,
  notesMap,
  selectedNoteId,
  currentNotes,
  selectedNote,
  addNote,
  updateNote,
  deleteNote,
  navigateToDate,
  navigatePreviousDay,
  navigateNextDay,
  navigateToToday,
} from '../../src/lib/stores/notes';
import type { Note } from '../../src/lib/types';

describe('Notes Store', () => {
  beforeEach(() => {
    // Reset stores to initial state
    notesMap.set(new Map());
    selectedNoteId.set(null);
    navigateToToday();
  });

  // Spec: Daily Organization - Notes automatically organized by date
  describe('currentDate', () => {
    it("should initialize to today's date", () => {
      const today = new Date().toISOString().split('T')[0];
      expect(get(currentDate)).toBe(today);
    });
  });

  // Spec: Navigation - Scroll/browse through each day's notes
  describe('navigatePreviousDay', () => {
    it('should navigate to previous day', () => {
      const initial = get(currentDate);
      navigatePreviousDay();
      const newDate = get(currentDate);

      const initialDate = new Date(initial);
      const expectedDate = new Date(initialDate);
      expectedDate.setDate(expectedDate.getDate() - 1);

      expect(newDate).toBe(expectedDate.toISOString().split('T')[0]);
    });

    it('should clear selected note when navigating', () => {
      selectedNoteId.set('some-id');
      navigatePreviousDay();
      expect(get(selectedNoteId)).toBeNull();
    });
  });

  describe('navigateNextDay', () => {
    it('should navigate to next day', () => {
      const initial = get(currentDate);
      navigateNextDay();
      const newDate = get(currentDate);

      const initialDate = new Date(initial);
      const expectedDate = new Date(initialDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      expect(newDate).toBe(expectedDate.toISOString().split('T')[0]);
    });
  });

  describe('navigateToDate', () => {
    it('should navigate to specific date', () => {
      navigateToDate('2025-01-15');
      expect(get(currentDate)).toBe('2025-01-15');
    });
  });

  describe('navigateToToday', () => {
    it('should navigate back to today', () => {
      navigateToDate('2020-01-01');
      navigateToToday();
      const today = new Date().toISOString().split('T')[0];
      expect(get(currentDate)).toBe(today);
    });
  });

  // Spec: Multiple Notes - Multiple notes per day supported
  describe('addNote', () => {
    it('should add a note to the current date', () => {
      const note: Note = {
        id: 'test-1',
        date: get(currentDate),
        title: 'Test Note',
        content: 'Test content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);

      const notes = get(currentNotes);
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('test-1');
    });

    it('should select the newly added note', () => {
      const note: Note = {
        id: 'test-2',
        date: get(currentDate),
        title: 'Test Note',
        content: 'Test content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);
      expect(get(selectedNoteId)).toBe('test-2');
    });

    it('should support multiple notes per day', () => {
      const date = get(currentDate);

      addNote({
        id: 'note-1',
        date,
        title: 'Note 1',
        content: 'Content 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      addNote({
        id: 'note-2',
        date,
        title: 'Note 2',
        content: 'Content 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      expect(get(currentNotes)).toHaveLength(2);
    });
  });

  describe('updateNote', () => {
    it('should update an existing note', () => {
      const date = get(currentDate);
      const note: Note = {
        id: 'test-update',
        date,
        title: 'Original',
        content: 'Original content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);

      updateNote({
        ...note,
        title: 'Updated',
        content: 'Updated content',
      });

      const notes = get(currentNotes);
      expect(notes[0].title).toBe('Updated');
      expect(notes[0].content).toBe('Updated content');
    });
  });

  describe('deleteNote', () => {
    it('should remove a note from the list', () => {
      const date = get(currentDate);
      const note: Note = {
        id: 'test-delete',
        date,
        title: 'To Delete',
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);
      expect(get(currentNotes)).toHaveLength(1);

      deleteNote('test-delete', date);
      expect(get(currentNotes)).toHaveLength(0);
    });

    it('should clear selection if deleted note was selected', () => {
      const date = get(currentDate);
      const note: Note = {
        id: 'test-delete-selected',
        date,
        title: 'Selected Note',
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);
      expect(get(selectedNoteId)).toBe('test-delete-selected');

      deleteNote('test-delete-selected', date);
      expect(get(selectedNoteId)).toBeNull();
    });
  });

  // Spec: Derived stores
  describe('currentNotes', () => {
    it('should return notes for current date only', () => {
      const today = get(currentDate);

      addNote({
        id: 'today-note',
        date: today,
        title: 'Today',
        content: 'Today content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Add note to different date directly
      notesMap.update((map) => {
        map.set('2020-01-01', [
          {
            id: 'old-note',
            date: '2020-01-01',
            title: 'Old',
            content: 'Old content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
        return new Map(map);
      });

      const notes = get(currentNotes);
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('today-note');
    });
  });

  describe('selectedNote', () => {
    it('should return the currently selected note', () => {
      const note: Note = {
        id: 'selected-test',
        date: get(currentDate),
        title: 'Selected',
        content: 'Selected content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(note);

      const selected = get(selectedNote);
      expect(selected?.id).toBe('selected-test');
    });

    it('should return null when no note is selected', () => {
      selectedNoteId.set(null);
      expect(get(selectedNote)).toBeNull();
    });
  });
});

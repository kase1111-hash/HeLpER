import { writable, derived, get } from 'svelte/store';
import type { Note } from '../types';
import { formatDateISO, getTimestamp } from '../utils/date';
import {
  fetchNotesForDate,
  saveNote,
  updateNoteInDb,
  deleteNoteFromDb,
} from '../services/tauri';

// Current date being viewed
export const currentDate = writable<string>(formatDateISO(new Date()));

// All notes (keyed by date for efficient lookup)
export const notesMap = writable<Map<string, Note[]>>(new Map());

// Alias for export functionality
export { notesMap as allNotes };

// Currently selected note ID
export const selectedNoteId = writable<string | null>(null);

// Loading state for notes
export const notesLoading = writable<boolean>(false);

// Notes for the current date
export const currentNotes = derived(
  [notesMap, currentDate],
  ([$notesMap, $currentDate]) => {
    return $notesMap.get($currentDate) || [];
  }
);

// Currently selected note
export const selectedNote = derived(
  [currentNotes, selectedNoteId],
  ([$currentNotes, $selectedNoteId]) => {
    if (!$selectedNoteId) return null;
    return $currentNotes.find(note => note.id === $selectedNoteId) || null;
  }
);

// Load notes from database for a specific date
export async function loadNotesForDate(date: string): Promise<void> {
  notesLoading.set(true);
  try {
    const notes = await fetchNotesForDate(date);
    notesMap.update(map => {
      map.set(date, notes);
      return new Map(map);
    });
  } catch (error) {
    console.error('Failed to load notes:', error);
  } finally {
    notesLoading.set(false);
  }
}

// Note operations - with database persistence
export async function addNote(note: Note): Promise<void> {
  // Store previous state for potential revert
  const previousNotes = get(notesMap).get(note.date) || [];

  // Optimistically add to local state
  notesMap.update(map => {
    const dateNotes = map.get(note.date) || [];
    map.set(note.date, [...dateNotes, note]);
    return new Map(map);
  });
  selectedNoteId.set(note.id);

  // Persist to database
  const saved = await saveNote(note);
  if (!saved) {
    console.error('Failed to save note to database');
    // Revert optimistic update
    notesMap.update(map => {
      map.set(note.date, previousNotes);
      return new Map(map);
    });
    selectedNoteId.set(previousNotes.length > 0 ? previousNotes[0].id : null);
  }
}

export async function updateNote(updatedNote: Note): Promise<void> {
  // Store previous state for potential revert
  const previousNotes = get(notesMap).get(updatedNote.date) || [];
  const previousNote = previousNotes.find(n => n.id === updatedNote.id);

  // Optimistically update local state
  notesMap.update(map => {
    const dateNotes = map.get(updatedNote.date) || [];
    const index = dateNotes.findIndex(n => n.id === updatedNote.id);
    if (index !== -1) {
      dateNotes[index] = updatedNote;
      map.set(updatedNote.date, [...dateNotes]);
    }
    return new Map(map);
  });

  // Persist to database
  const saved = await updateNoteInDb(updatedNote);
  if (!saved) {
    console.error('Failed to update note in database');
    // Revert optimistic update
    if (previousNote) {
      notesMap.update(map => {
        map.set(updatedNote.date, previousNotes);
        return new Map(map);
      });
    }
  }
}

export async function deleteNote(noteId: string, date: string): Promise<void> {
  // Store previous state for potential revert
  const previousNotes = get(notesMap).get(date) || [];
  const previousSelectedId = get(selectedNoteId);

  // Optimistically remove from local state
  notesMap.update(map => {
    const dateNotes = map.get(date) || [];
    map.set(date, dateNotes.filter(n => n.id !== noteId));
    return new Map(map);
  });
  selectedNoteId.update(id => id === noteId ? null : id);

  // Persist to database (soft delete)
  const deleted = await deleteNoteFromDb(noteId, getTimestamp());
  if (!deleted) {
    console.error('Failed to delete note from database');
    // Revert optimistic update
    notesMap.update(map => {
      map.set(date, previousNotes);
      return new Map(map);
    });
    selectedNoteId.set(previousSelectedId);
  }
}

export function navigateToDate(date: string): void {
  currentDate.set(date);
  selectedNoteId.set(null);
}

export function navigatePreviousDay(): void {
  currentDate.update(date => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return formatDateISO(d);
  });
  selectedNoteId.set(null);
}

export function navigateNextDay(): void {
  currentDate.update(date => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  });
  selectedNoteId.set(null);
}

export function navigateToToday(): void {
  currentDate.set(formatDateISO(new Date()));
  selectedNoteId.set(null);
}

import { writable, derived } from 'svelte/store';
import type { Note } from '../types';
import { formatDateISO } from '../utils/date';

// Current date being viewed
export const currentDate = writable<string>(formatDateISO(new Date()));

// All notes (keyed by date for efficient lookup)
export const notesMap = writable<Map<string, Note[]>>(new Map());

// Currently selected note ID
export const selectedNoteId = writable<string | null>(null);

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

// Note operations
export function addNote(note: Note): void {
  notesMap.update(map => {
    const dateNotes = map.get(note.date) || [];
    map.set(note.date, [...dateNotes, note]);
    return new Map(map);
  });
  selectedNoteId.set(note.id);
}

export function updateNote(updatedNote: Note): void {
  notesMap.update(map => {
    const dateNotes = map.get(updatedNote.date) || [];
    const index = dateNotes.findIndex(n => n.id === updatedNote.id);
    if (index !== -1) {
      dateNotes[index] = updatedNote;
      map.set(updatedNote.date, [...dateNotes]);
    }
    return new Map(map);
  });
}

export function deleteNote(noteId: string, date: string): void {
  notesMap.update(map => {
    const dateNotes = map.get(date) || [];
    map.set(date, dateNotes.filter(n => n.id !== noteId));
    return new Map(map);
  });
  selectedNoteId.update(id => id === noteId ? null : id);
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

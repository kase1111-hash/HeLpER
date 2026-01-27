import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { Note, ChatMessage, OllamaStatus } from '../types';
import { addNote, navigateToToday } from '../stores/notes';
import { toggleSettings } from '../stores/ui';
import { createNote } from '../utils/note';
import { currentDate } from '../stores/notes';
import { get } from 'svelte/store';

// Custom error class for Tauri operations
export class TauriServiceError extends Error {
  constructor(
    public operation: string,
    public originalError: unknown
  ) {
    const message = originalError instanceof Error ? originalError.message : String(originalError);
    super(`${operation}: ${message}`);
    this.name = 'TauriServiceError';
  }
}

// Note operations
export async function fetchNotesForDate(date: string): Promise<Note[]> {
  try {
    return await invoke<Note[]>('get_notes_for_date', { date });
  } catch (error) {
    const tauriError = new TauriServiceError(`Failed to fetch notes for date ${date}`, error);
    console.error(tauriError.message, { date, originalError: error });
    return [];
  }
}

export async function saveNote(note: Note): Promise<Note | null> {
  try {
    return await invoke<Note>('create_note', { note });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to save note', error);
    console.error(tauriError.message, { noteId: note.id, originalError: error });
    return null;
  }
}

export async function updateNoteInDb(note: Note): Promise<Note | null> {
  try {
    return await invoke<Note>('update_note', { note });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to update note', error);
    console.error(tauriError.message, { noteId: note.id, originalError: error });
    return null;
  }
}

export async function deleteNoteFromDb(id: string, deletedAt: string): Promise<boolean> {
  try {
    await invoke('delete_note', { id, deletedAt });
    return true;
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to delete note', error);
    console.error(tauriError.message, { id, deletedAt, originalError: error });
    return false;
  }
}

// Database health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    return await invoke<boolean>('check_database_health');
  } catch (error) {
    const tauriError = new TauriServiceError('Database health check failed', error);
    console.error(tauriError.message, { originalError: error });
    return false;
  }
}

// Ollama operations
export async function checkOllamaStatus(url: string): Promise<OllamaStatus> {
  try {
    return await invoke<OllamaStatus>('check_ollama_status', { url });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to check Ollama status', error);
    console.error(tauriError.message, { url, originalError: error });
    return {
      connected: false,
      model: null,
      error: tauriError.message,
    };
  }
}

export async function sendChatMessage(
  url: string,
  model: string,
  messages: ChatMessage[],
  temperature: number,
  maxTokens: number
): Promise<ChatMessage | null> {
  try {
    return await invoke<ChatMessage>('send_chat_message', {
      url,
      model,
      messages,
      temperature,
      maxTokens,
    });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to send chat message', error);
    console.error(tauriError.message, { url, model, messageCount: messages.length, originalError: error });
    return null;
  }
}

// Event listeners for tray actions
export function setupTrayListeners(): () => void {
  const unlisteners: (() => void)[] = [];

  listen('new-note', () => {
    const date = get(currentDate);
    const note = createNote('', date);
    addNote(note);
  }).then((unlisten) => unlisteners.push(unlisten));

  listen('go-to-today', () => {
    navigateToToday();
  }).then((unlisten) => unlisteners.push(unlisten));

  listen('open-settings', () => {
    toggleSettings();
  }).then((unlisten) => unlisteners.push(unlisten));

  return () => {
    unlisteners.forEach((unlisten) => unlisten());
  };
}

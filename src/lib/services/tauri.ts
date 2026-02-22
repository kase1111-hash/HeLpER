import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { Note, ChatMessage, OllamaStatus, AuditChainVerification } from '../types';
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

// Weather operations
export async function getWeather(
  apiKey: string,
  location: string
): Promise<unknown> {
  try {
    return await invoke('get_weather', { apiKey, location });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to get weather', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

// Secret storage operations (OS keychain)
export async function storeSecret(service: string, key: string, value: string): Promise<void> {
  try {
    await invoke('store_secret', { service, key, value });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to store secret', error);
    console.error(tauriError.message, { originalError: error });
  }
}

export async function getSecret(service: string, key: string): Promise<string | null> {
  try {
    return await invoke<string | null>('get_secret', { service, key });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to get secret', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

export async function deleteSecret(service: string, key: string): Promise<void> {
  try {
    await invoke('delete_secret', { service, key });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to delete secret', error);
    console.error(tauriError.message, { originalError: error });
  }
}

// Settings integrity operations
export async function computeSettingsHmac(settingsJson: string): Promise<string | null> {
  try {
    return await invoke<string>('compute_settings_hmac', { settingsJson });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to compute settings HMAC', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

export async function verifySettingsHmac(settingsJson: string, hmacHex: string): Promise<boolean> {
  try {
    return await invoke<boolean>('verify_settings_hmac', { settingsJson, hmacHex });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to verify settings HMAC', error);
    console.error(tauriError.message, { originalError: error });
    return false;
  }
}

// Audit log operations
export async function logAuditEvent(eventType: string, eventData: object): Promise<void> {
  try {
    await invoke('log_audit_event', { eventType, eventData: JSON.stringify(eventData) });
  } catch (error) {
    // Audit logging should not block the user - fail silently
    console.warn('Audit log failed:', error);
  }
}

// Audit chain verification
export async function verifyAuditChain(): Promise<AuditChainVerification | null> {
  try {
    return await invoke<AuditChainVerification>('verify_audit_chain');
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to verify audit chain', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

// Author identity operations
export async function getAuthorPublicKey(): Promise<string | null> {
  try {
    return await invoke<string>('nlc_get_author_public_key');
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to get author public key', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

export async function signEntry(content: string): Promise<string | null> {
  try {
    return await invoke<string>('nlc_sign_entry', { content });
  } catch (error) {
    const tauriError = new TauriServiceError('Failed to sign entry', error);
    console.error(tauriError.message, { originalError: error });
    return null;
  }
}

// Event listeners for tray actions.
// Returns an async cleanup function that awaits all listener registrations
// before invoking their unlisten handles, preventing a race where cleanup
// runs before the listen() promises resolve.
export function setupTrayListeners(): () => Promise<void> {
  const listenerPromises: Promise<() => void>[] = [];

  listenerPromises.push(
    listen('new-note', () => {
      const date = get(currentDate);
      const note = createNote('', date);
      addNote(note);
    })
  );

  listenerPromises.push(
    listen('go-to-today', () => {
      navigateToToday();
    })
  );

  listenerPromises.push(
    listen('open-settings', () => {
      toggleSettings();
    })
  );

  return async () => {
    const unlisteners = await Promise.all(listenerPromises);
    unlisteners.forEach((unlisten) => unlisten());
  };
}

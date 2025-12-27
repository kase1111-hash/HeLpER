import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import {
  fetchNotesForDate,
  saveNote,
  updateNoteInDb,
  deleteNoteFromDb,
  checkOllamaStatus,
  sendChatMessage,
} from '../../src/lib/services/tauri';
import type { Note, ChatMessage } from '../../src/lib/types';

// Mock is set up in setup.ts
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('Tauri Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Spec: Database operations
  describe('fetchNotesForDate', () => {
    it('should fetch notes for a specific date', async () => {
      const mockNotes: Note[] = [
        {
          id: '1',
          date: '2025-12-26',
          title: 'Test',
          content: 'Content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockInvoke.mockResolvedValueOnce(mockNotes);

      const notes = await fetchNotesForDate('2025-12-26');

      expect(mockInvoke).toHaveBeenCalledWith('get_notes_for_date', { date: '2025-12-26' });
      expect(notes).toEqual(mockNotes);
    });

    it('should return empty array on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Database error'));

      const notes = await fetchNotesForDate('2025-12-26');

      expect(notes).toEqual([]);
    });
  });

  describe('saveNote', () => {
    it('should save a new note', async () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: 'New Note',
        content: 'Content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockInvoke.mockResolvedValueOnce(note);

      const result = await saveNote(note);

      expect(mockInvoke).toHaveBeenCalledWith('create_note', { note });
      expect(result).toEqual(note);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Save failed'));

      const result = await saveNote({} as Note);

      expect(result).toBeNull();
    });
  });

  describe('updateNoteInDb', () => {
    it('should update an existing note', async () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: 'Updated',
        content: 'Updated content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockInvoke.mockResolvedValueOnce(note);

      const result = await updateNoteInDb(note);

      expect(mockInvoke).toHaveBeenCalledWith('update_note', { note });
      expect(result).toEqual(note);
    });
  });

  describe('deleteNoteFromDb', () => {
    it('should soft delete a note', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      const result = await deleteNoteFromDb('note-id', '2025-12-26T12:00:00Z');

      expect(mockInvoke).toHaveBeenCalledWith('delete_note', {
        id: 'note-id',
        deletedAt: '2025-12-26T12:00:00Z',
      });
      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Delete failed'));

      const result = await deleteNoteFromDb('note-id', '2025-12-26T12:00:00Z');

      expect(result).toBe(false);
    });
  });

  // Spec: Ollama integration
  describe('checkOllamaStatus', () => {
    it('should check Ollama connection status', async () => {
      const mockStatus = {
        connected: true,
        model: 'llama3.2:3b',
        error: null,
      };

      mockInvoke.mockResolvedValueOnce(mockStatus);

      const status = await checkOllamaStatus('http://localhost:11434');

      expect(mockInvoke).toHaveBeenCalledWith('check_ollama_status', {
        url: 'http://localhost:11434',
      });
      expect(status).toEqual(mockStatus);
    });

    it('should return disconnected status on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Connection refused'));

      const status = await checkOllamaStatus('http://localhost:11434');

      expect(status.connected).toBe(false);
      expect(status.error).toContain('Connection refused');
    });
  });

  describe('sendChatMessage', () => {
    it('should send chat message to Ollama', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      ];

      const mockResponse: ChatMessage = {
        role: 'assistant',
        content: 'Hi there!',
        timestamp: new Date().toISOString(),
      };

      mockInvoke.mockResolvedValueOnce(mockResponse);

      const response = await sendChatMessage(
        'http://localhost:11434',
        'llama3.2:3b',
        messages,
        0.7,
        500
      );

      expect(mockInvoke).toHaveBeenCalledWith('send_chat_message', {
        url: 'http://localhost:11434',
        model: 'llama3.2:3b',
        messages,
        temperature: 0.7,
        maxTokens: 500,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Model not found'));

      const response = await sendChatMessage(
        'http://localhost:11434',
        'invalid-model',
        [],
        0.7,
        500
      );

      expect(response).toBeNull();
    });
  });
});

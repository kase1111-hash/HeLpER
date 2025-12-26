import { describe, it, expect } from 'vitest';
import type {
  Note,
  ChatMessage,
  ChatHistory,
  OllamaStatus,
  OllamaRequest,
  Theme,
  DateFormat,
  TimeFormat,
  BackupFrequency,
  ExportFormat,
  AppSettings,
  AISettings,
  DataSettings,
  NotificationSettings,
  Settings,
  QuickAction,
  QuickActionConfig,
  WindowState,
} from '../src/lib/types';

describe('Type Definitions', () => {
  // Spec: Note Structure
  describe('Note type', () => {
    it('should conform to spec structure', () => {
      const note: Note = {
        id: 'uuid-v4',
        date: '2025-12-26',
        title: 'Test Note',
        content: 'Note content here',
        createdAt: '2025-12-26T10:00:00Z',
        updatedAt: '2025-12-26T10:30:00Z',
      };

      expect(note.id).toBeDefined();
      expect(note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof note.content).toBe('string');
    });

    it('should support optional deletedAt for soft delete', () => {
      const deletedNote: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'Deleted',
        createdAt: '2025-12-26T10:00:00Z',
        updatedAt: '2025-12-26T10:00:00Z',
        deletedAt: '2025-12-26T11:00:00Z',
      };

      expect(deletedNote.deletedAt).toBeDefined();
    });

    it('should support null title', () => {
      const note: Note = {
        id: '1',
        date: '2025-12-26',
        title: null,
        content: 'No title',
        createdAt: '2025-12-26T10:00:00Z',
        updatedAt: '2025-12-26T10:00:00Z',
      };

      expect(note.title).toBeNull();
    });
  });

  // Spec: Chat Message Object
  describe('ChatMessage type', () => {
    it('should support user role', () => {
      const msg: ChatMessage = {
        role: 'user',
        content: 'Hello',
        timestamp: '2025-12-26T10:00:00Z',
      };
      expect(msg.role).toBe('user');
    });

    it('should support assistant role', () => {
      const msg: ChatMessage = {
        role: 'assistant',
        content: 'Hi there',
        timestamp: '2025-12-26T10:00:00Z',
      };
      expect(msg.role).toBe('assistant');
    });

    it('should support system role', () => {
      const msg: ChatMessage = {
        role: 'system',
        content: 'System prompt',
        timestamp: '2025-12-26T10:00:00Z',
      };
      expect(msg.role).toBe('system');
    });
  });

  // Spec: Chat History
  describe('ChatHistory type', () => {
    it('should contain array of messages', () => {
      const history: ChatHistory = {
        id: '1',
        noteId: 'note-1',
        messages: [
          { role: 'user', content: 'Hi', timestamp: '2025-12-26T10:00:00Z' },
          { role: 'assistant', content: 'Hello', timestamp: '2025-12-26T10:00:01Z' },
        ],
        createdAt: '2025-12-26T10:00:00Z',
      };

      expect(history.messages).toHaveLength(2);
    });

    it('should support optional noteId', () => {
      const history: ChatHistory = {
        id: '1',
        messages: [],
        createdAt: '2025-12-26T10:00:00Z',
      };

      expect(history.noteId).toBeUndefined();
    });
  });

  // Spec: Ollama Status
  describe('OllamaStatus type', () => {
    it('should represent connected state', () => {
      const status: OllamaStatus = {
        connected: true,
        model: 'llama3.2:3b',
        error: null,
      };

      expect(status.connected).toBe(true);
      expect(status.model).toBeDefined();
    });

    it('should represent disconnected state with error', () => {
      const status: OllamaStatus = {
        connected: false,
        model: null,
        error: 'Connection refused',
      };

      expect(status.connected).toBe(false);
      expect(status.error).toBeDefined();
    });
  });

  // Spec: Theme types
  describe('Theme type', () => {
    it('should support light, dark, and system', () => {
      const themes: Theme[] = ['light', 'dark', 'system'];
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
      expect(themes).toContain('system');
    });
  });

  // Spec: Backup frequency options
  describe('BackupFrequency type', () => {
    it('should support hourly, daily, weekly', () => {
      const frequencies: BackupFrequency[] = ['hourly', 'daily', 'weekly'];
      expect(frequencies).toHaveLength(3);
    });
  });

  // Spec: Export format options
  describe('ExportFormat type', () => {
    it('should support markdown, json, txt', () => {
      const formats: ExportFormat[] = ['markdown', 'json', 'txt'];
      expect(formats).toHaveLength(3);
    });
  });

  // Spec: Quick action types
  describe('QuickAction type', () => {
    it('should support all quick action ids', () => {
      const actions: QuickAction[] = ['format', 'expand', 'summarize', 'grammar', 'professional'];
      expect(actions).toHaveLength(5);
    });
  });

  // Spec: Window state
  describe('WindowState type', () => {
    it('should track window dimensions and position', () => {
      const state: WindowState = {
        width: 400,
        height: 600,
        x: 100,
        y: 100,
        maximized: false,
      };

      expect(state.width).toBe(400);
      expect(state.height).toBe(600);
      expect(state.maximized).toBe(false);
    });
  });

  // Spec: Settings structure
  describe('Settings type', () => {
    it('should contain all settings sections', () => {
      const settings: Settings = {
        app: {
          theme: 'system',
          startMinimized: false,
          startOnLogin: false,
          minimizeOnClose: true,
          alwaysOnTop: false,
          showInTaskbar: true,
          dateFormat: 'system',
          timeFormat: '12h',
          spellCheck: true,
          autoSaveDelay: 500,
        },
        ai: {
          ollamaUrl: 'http://localhost:11434',
          model: 'llama3.2:3b',
          temperature: 0.7,
          maxTokens: 500,
          systemPrompt: 'You are HeLpER...',
          includeNoteContext: true,
          saveChatHistory: false,
        },
        data: {
          dataLocation: '',
          backupEnabled: true,
          backupFrequency: 'daily',
          backupRetention: 7,
          exportFormat: 'markdown',
        },
        notifications: {
          dailyReminder: false,
          reminderTime: '20:00',
          sound: true,
        },
      };

      expect(settings.app).toBeDefined();
      expect(settings.ai).toBeDefined();
      expect(settings.data).toBeDefined();
      expect(settings.notifications).toBeDefined();
    });
  });
});

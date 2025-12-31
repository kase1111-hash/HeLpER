import { describe, it, expect } from 'vitest';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_DATA_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  QUICK_ACTIONS,
  WINDOW_MIN_WIDTH,
  WINDOW_MIN_HEIGHT,
  WINDOW_DEFAULT_WIDTH,
  WINDOW_DEFAULT_HEIGHT,
  NOTE_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
  AUTO_SAVE_DEBOUNCE_MS,
  OLLAMA_HEALTH_CHECK_INTERVAL_MS,
  OLLAMA_RETRY_INTERVAL_MS,
} from '../src/lib/constants';

describe('Constants', () => {
  // Spec: Window Properties
  describe('Window Constraints', () => {
    it('should have correct minimum window size', () => {
      // Spec: Minimum Size - 320w x 480h pixels
      expect(WINDOW_MIN_WIDTH).toBe(320);
      expect(WINDOW_MIN_HEIGHT).toBe(480);
    });

    it('should have correct default window size', () => {
      // Spec: Default Size - 400w x 600h pixels
      expect(WINDOW_DEFAULT_WIDTH).toBe(400);
      expect(WINDOW_DEFAULT_HEIGHT).toBe(600);
    });
  });

  // Spec: Note Capacity - Up to 5,000 characters per note
  describe('Note Constraints', () => {
    it('should limit note content to 5000 characters', () => {
      expect(NOTE_MAX_LENGTH).toBe(5000);
    });

    it('should limit note title to 50 characters', () => {
      expect(NOTE_TITLE_MAX_LENGTH).toBe(50);
    });
  });

  // Spec: Auto-save delay - 500ms default
  describe('Auto-save', () => {
    it('should debounce auto-save at 500ms', () => {
      expect(AUTO_SAVE_DEBOUNCE_MS).toBe(500);
    });
  });

  // Spec: Ollama Health Check intervals
  describe('Ollama Intervals', () => {
    it('should check health every 5 minutes when connected', () => {
      expect(OLLAMA_HEALTH_CHECK_INTERVAL_MS).toBe(300000); // 5 minutes
    });

    it('should retry connection every 30 seconds when failed', () => {
      expect(OLLAMA_RETRY_INTERVAL_MS).toBe(30000); // 30 seconds
    });
  });

  // Spec: App Settings Defaults
  describe('DEFAULT_APP_SETTINGS', () => {
    it('should have theme default to system', () => {
      expect(DEFAULT_APP_SETTINGS.theme).toBe('system');
    });

    it('should have startMinimized default to false', () => {
      expect(DEFAULT_APP_SETTINGS.startMinimized).toBe(false);
    });

    it('should have minimizeOnClose default to true', () => {
      expect(DEFAULT_APP_SETTINGS.minimizeOnClose).toBe(true);
    });

    it('should have alwaysOnTop default to false', () => {
      expect(DEFAULT_APP_SETTINGS.alwaysOnTop).toBe(false);
    });

    it('should have spellCheck default to true', () => {
      expect(DEFAULT_APP_SETTINGS.spellCheck).toBe(true);
    });
  });

  // Spec: AI Settings Defaults
  describe('DEFAULT_AI_SETTINGS', () => {
    it('should have Ollama URL default to localhost:11434', () => {
      expect(DEFAULT_AI_SETTINGS.ollamaUrl).toBe('http://localhost:11434');
    });

    it('should have model default to llama3.2:3b', () => {
      expect(DEFAULT_AI_SETTINGS.model).toBe('llama3.2:3b');
    });

    it('should have temperature default to 0.7', () => {
      expect(DEFAULT_AI_SETTINGS.temperature).toBe(0.7);
    });

    it('should have maxTokens default to 500', () => {
      expect(DEFAULT_AI_SETTINGS.maxTokens).toBe(500);
    });

    it('should have includeNoteContext default to true', () => {
      expect(DEFAULT_AI_SETTINGS.includeNoteContext).toBe(true);
    });

    it('should have a system prompt defined', () => {
      expect(DEFAULT_AI_SETTINGS.systemPrompt).toBeDefined();
      expect(DEFAULT_AI_SETTINGS.systemPrompt.length).toBeGreaterThan(0);
    });
  });

  // Spec: Data Settings Defaults
  describe('DEFAULT_DATA_SETTINGS', () => {
    it('should have backupEnabled default to true', () => {
      expect(DEFAULT_DATA_SETTINGS.backupEnabled).toBe(true);
    });

    it('should have backupFrequency default to daily', () => {
      expect(DEFAULT_DATA_SETTINGS.backupFrequency).toBe('daily');
    });

    it('should have backupRetention default to 7 days', () => {
      expect(DEFAULT_DATA_SETTINGS.backupRetention).toBe(7);
    });

    it('should have exportFormat default to markdown', () => {
      expect(DEFAULT_DATA_SETTINGS.exportFormat).toBe('markdown');
    });
  });

  // Spec: Notification Settings Defaults
  describe('DEFAULT_NOTIFICATION_SETTINGS', () => {
    it('should have dailyReminder default to false', () => {
      expect(DEFAULT_NOTIFICATION_SETTINGS.dailyReminder).toBe(false);
    });

    it('should have reminderTime default to 20:00', () => {
      expect(DEFAULT_NOTIFICATION_SETTINGS.reminderTime).toBe('20:00');
    });

    it('should have sound default to true', () => {
      expect(DEFAULT_NOTIFICATION_SETTINGS.sound).toBe(true);
    });
  });

  // Spec: Quick Actions
  describe('QUICK_ACTIONS', () => {
    it('should have 5 quick actions', () => {
      expect(QUICK_ACTIONS).toHaveLength(5);
    });

    it('should have format action', () => {
      const format = QUICK_ACTIONS.find((a) => a.id === 'format');
      expect(format).toBeDefined();
      expect(format?.label).toBe('Format');
      expect(format?.prompt).toContain('{note}');
    });

    it('should have expand action', () => {
      const expand = QUICK_ACTIONS.find((a) => a.id === 'expand');
      expect(expand).toBeDefined();
      expect(expand?.label).toBe('Expand');
      expect(expand?.prompt).toContain('{note}');
    });

    it('should have summarize action', () => {
      const summarize = QUICK_ACTIONS.find((a) => a.id === 'summarize');
      expect(summarize).toBeDefined();
      expect(summarize?.label).toBe('Summarize');
    });

    it('should have grammar action', () => {
      const grammar = QUICK_ACTIONS.find((a) => a.id === 'grammar');
      expect(grammar).toBeDefined();
      expect(grammar?.label).toBe('Fix Grammar');
    });

    it('should have professional action', () => {
      const professional = QUICK_ACTIONS.find((a) => a.id === 'professional');
      expect(professional).toBeDefined();
      expect(professional?.label).toBe('Make Professional');
    });

    it('should all have prompt templates with {note} placeholder', () => {
      QUICK_ACTIONS.forEach((action) => {
        expect(action.prompt).toContain('{note}');
      });
    });
  });
});

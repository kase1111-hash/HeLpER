import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  settings,
  theme,
  ollamaUrl,
  ollamaModel,
  effectiveTheme,
  updateSettings,
  resetSettings,
} from '../../src/lib/stores/settings';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_DATA_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../../src/lib/constants';

describe('Settings Store', () => {
  beforeEach(() => {
    resetSettings();
  });

  // Spec: Theme - "light", "dark", "system"
  describe('theme', () => {
    it('should default to "system"', () => {
      expect(get(theme)).toBe('system');
    });
  });

  // Spec: Default settings values
  describe('settings defaults', () => {
    it('should have default app settings', () => {
      const s = get(settings);
      expect(s.app.theme).toBe('system');
      expect(s.app.startMinimized).toBe(false);
      expect(s.app.startOnLogin).toBe(false);
      expect(s.app.minimizeOnClose).toBe(true);
      expect(s.app.alwaysOnTop).toBe(false);
      expect(s.app.spellCheck).toBe(true);
      expect(s.app.autoSaveDelay).toBe(500);
    });

    it('should have default AI settings', () => {
      const s = get(settings);
      expect(s.ai.ollamaUrl).toBe('http://localhost:11434');
      expect(s.ai.model).toBe('llama3.2:3b');
      expect(s.ai.temperature).toBe(0.7);
      expect(s.ai.maxTokens).toBe(500);
      expect(s.ai.includeNoteContext).toBe(true);
      expect(s.ai.saveChatHistory).toBe(false);
    });

    it('should have default data settings', () => {
      const s = get(settings);
      expect(s.data.backupEnabled).toBe(true);
      expect(s.data.backupFrequency).toBe('daily');
      expect(s.data.backupRetention).toBe(7);
      expect(s.data.exportFormat).toBe('markdown');
    });

    it('should have default notification settings', () => {
      const s = get(settings);
      expect(s.notifications.dailyReminder).toBe(false);
      expect(s.notifications.reminderTime).toBe('20:00');
      expect(s.notifications.sound).toBe(true);
    });
  });

  // Spec: Ollama URL - default "http://localhost:11434"
  describe('ollamaUrl', () => {
    it('should derive from settings', () => {
      expect(get(ollamaUrl)).toBe('http://localhost:11434');
    });
  });

  // Spec: Model - default "llama3.2:3b"
  describe('ollamaModel', () => {
    it('should derive from settings', () => {
      expect(get(ollamaModel)).toBe('llama3.2:3b');
    });
  });

  describe('updateSettings', () => {
    it('should update app settings', () => {
      updateSettings({
        app: { ...DEFAULT_APP_SETTINGS, theme: 'dark' },
      });

      expect(get(theme)).toBe('dark');
    });

    it('should update AI settings', () => {
      updateSettings({
        ai: { ...DEFAULT_AI_SETTINGS, model: 'mistral' },
      });

      expect(get(ollamaModel)).toBe('mistral');
    });

    it('should preserve other settings when updating partial', () => {
      const original = get(settings);
      updateSettings({
        app: { ...original.app, theme: 'light' },
      });

      const updated = get(settings);
      expect(updated.ai.model).toBe(original.ai.model);
      expect(updated.data.backupEnabled).toBe(original.data.backupEnabled);
    });
  });

  describe('resetSettings', () => {
    it('should reset all settings to defaults', () => {
      // Change some settings
      updateSettings({
        app: { ...DEFAULT_APP_SETTINGS, theme: 'dark', alwaysOnTop: true },
        ai: { ...DEFAULT_AI_SETTINGS, model: 'custom-model' },
      });

      // Verify changes
      expect(get(theme)).toBe('dark');
      expect(get(ollamaModel)).toBe('custom-model');

      // Reset
      resetSettings();

      // Verify defaults
      expect(get(theme)).toBe('system');
      expect(get(ollamaModel)).toBe('llama3.2:3b');
    });
  });

  // Spec: Effective theme based on system preference
  describe('effectiveTheme', () => {
    it('should be writable', () => {
      effectiveTheme.set('dark');
      expect(get(effectiveTheme)).toBe('dark');

      effectiveTheme.set('light');
      expect(get(effectiveTheme)).toBe('light');
    });
  });
});

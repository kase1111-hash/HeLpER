import { writable, derived } from 'svelte/store';
import type { Settings, Theme } from '../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_DATA_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../constants';

// Full settings store
export const settings = writable<Settings>({
  app: { ...DEFAULT_APP_SETTINGS },
  ai: { ...DEFAULT_AI_SETTINGS },
  data: { ...DEFAULT_DATA_SETTINGS },
  notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
});

// Derived stores for convenience
export const theme = derived(settings, $settings => $settings.app.theme);
export const ollamaUrl = derived(settings, $settings => $settings.ai.ollamaUrl);
export const ollamaModel = derived(settings, $settings => $settings.ai.model);

// Effective theme (resolves 'system' to actual theme)
export const effectiveTheme = writable<'light' | 'dark'>('light');

// Initialize theme based on system preference
export function initializeTheme(): void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function updateEffectiveTheme(settingsTheme: Theme): void {
    if (settingsTheme === 'system') {
      effectiveTheme.set(mediaQuery.matches ? 'dark' : 'light');
    } else {
      effectiveTheme.set(settingsTheme);
    }
  }

  // Subscribe to settings changes
  settings.subscribe($settings => {
    updateEffectiveTheme($settings.app.theme);
  });

  // Listen for system theme changes
  mediaQuery.addEventListener('change', (e) => {
    settings.subscribe($settings => {
      if ($settings.app.theme === 'system') {
        effectiveTheme.set(e.matches ? 'dark' : 'light');
      }
    })();
  });
}

// Update settings
export function updateSettings(partial: Partial<Settings>): void {
  settings.update(s => ({
    ...s,
    ...partial,
    app: { ...s.app, ...partial.app },
    ai: { ...s.ai, ...partial.ai },
    data: { ...s.data, ...partial.data },
    notifications: { ...s.notifications, ...partial.notifications },
  }));
}

// Reset settings to defaults
export function resetSettings(): void {
  settings.set({
    app: { ...DEFAULT_APP_SETTINGS },
    ai: { ...DEFAULT_AI_SETTINGS },
    data: { ...DEFAULT_DATA_SETTINGS },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
  });
}

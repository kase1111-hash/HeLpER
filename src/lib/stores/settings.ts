import { writable, derived, get } from 'svelte/store';
import { load, Store } from '@tauri-apps/plugin-store';
import type { Settings, Theme } from '../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_DATA_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '../constants';

const SETTINGS_STORE_PATH = 'settings.json';
const SETTINGS_KEY = 'userSettings';

// Persistent store instance
let persistentStore: Store | null = null;

// Whether settings have been loaded from disk
export const settingsLoaded = writable<boolean>(false);

// Full settings store
export const settings = writable<Settings>({
  app: { ...DEFAULT_APP_SETTINGS },
  ai: { ...DEFAULT_AI_SETTINGS },
  data: { ...DEFAULT_DATA_SETTINGS },
  notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
});

// Initialize persistent store and load settings
export async function initializeSettings(): Promise<void> {
  try {
    persistentStore = await load(SETTINGS_STORE_PATH);
    const savedSettings = await persistentStore.get<Settings>(SETTINGS_KEY);

    if (savedSettings) {
      // Merge saved settings with defaults (in case new settings were added)
      settings.set({
        app: { ...DEFAULT_APP_SETTINGS, ...savedSettings.app },
        ai: { ...DEFAULT_AI_SETTINGS, ...savedSettings.ai },
        data: { ...DEFAULT_DATA_SETTINGS, ...savedSettings.data },
        notifications: { ...DEFAULT_NOTIFICATION_SETTINGS, ...savedSettings.notifications },
      });
    }

    settingsLoaded.set(true);
  } catch (error) {
    console.error('Failed to load settings:', error);
    settingsLoaded.set(true); // Still mark as loaded so app can continue with defaults
  }
}

// Save current settings to disk
async function saveSettings(): Promise<void> {
  if (!persistentStore) return;

  try {
    const currentSettings = get(settings);
    await persistentStore.set(SETTINGS_KEY, currentSettings);
    await persistentStore.save();
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

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
    });
  });
}

// Update settings and persist
export function updateSettings(partial: Partial<Settings>): void {
  settings.update(s => ({
    ...s,
    ...partial,
    app: { ...s.app, ...partial.app },
    ai: { ...s.ai, ...partial.ai },
    data: { ...s.data, ...partial.data },
    notifications: { ...s.notifications, ...partial.notifications },
  }));
  // Persist to disk
  saveSettings();
}

// Reset settings to defaults and persist
export function resetSettings(): void {
  settings.set({
    app: { ...DEFAULT_APP_SETTINGS },
    ai: { ...DEFAULT_AI_SETTINGS },
    data: { ...DEFAULT_DATA_SETTINGS },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
  });
  // Persist to disk
  saveSettings();
}

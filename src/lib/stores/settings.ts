import { writable, derived, get } from 'svelte/store';
import { load, Store } from '@tauri-apps/plugin-store';
import type { Settings, Theme } from '../types';
import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_DATA_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_WEATHER_SETTINGS,
  DEFAULT_NATLANGCHAIN_SETTINGS,
} from '../constants';
import {
  storeSecret,
  getSecret,
  computeSettingsHmac,
  verifySettingsHmac,
  logAuditEvent,
} from '../services/tauri';
import { showToast } from './ui';

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
  weather: { ...DEFAULT_WEATHER_SETTINGS },
  natLangChain: { ...DEFAULT_NATLANGCHAIN_SETTINGS },
});

const KEYCHAIN_SERVICE = 'com.helper.app';

// Initialize persistent store and load settings
export async function initializeSettings(): Promise<void> {
  try {
    persistentStore = await load(SETTINGS_STORE_PATH);
    const savedSettings = await persistentStore.get<Settings>(SETTINGS_KEY);

    if (savedSettings) {
      // Verify settings integrity via HMAC
      const storedHmac = await persistentStore.get<string>('settingsHmac');
      if (storedHmac) {
        const settingsJson = JSON.stringify(savedSettings);
        const isValid = await verifySettingsHmac(settingsJson, storedHmac);
        if (!isValid) {
          console.warn('Settings integrity check failed - settings may have been tampered with');
          showToast({ type: 'warning', message: 'Settings integrity check failed — settings may have been tampered with.' });
        }
      }

      // Merge saved settings with defaults (in case new settings were added)
      const mergedSettings: Settings = {
        app: { ...DEFAULT_APP_SETTINGS, ...savedSettings.app },
        ai: { ...DEFAULT_AI_SETTINGS, ...savedSettings.ai },
        data: { ...DEFAULT_DATA_SETTINGS, ...savedSettings.data },
        notifications: { ...DEFAULT_NOTIFICATION_SETTINGS, ...savedSettings.notifications },
        weather: { ...DEFAULT_WEATHER_SETTINGS, ...savedSettings.weather },
        natLangChain: { ...DEFAULT_NATLANGCHAIN_SETTINGS, ...savedSettings.natLangChain },
      };

      // Retrieve secrets from OS keychain instead of plaintext settings
      const weatherApiKey = await getSecret(KEYCHAIN_SERVICE, 'weather_api_key');
      if (weatherApiKey) {
        mergedSettings.weather.apiKey = weatherApiKey;
      }

      settings.set(mergedSettings);
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

    // Extract secrets and store them in OS keychain instead of plaintext JSON
    const settingsToSave = JSON.parse(JSON.stringify(currentSettings)) as Settings;
    if (settingsToSave.weather.apiKey) {
      await storeSecret(KEYCHAIN_SERVICE, 'weather_api_key', settingsToSave.weather.apiKey);
      settingsToSave.weather.apiKey = ''; // Redact from plaintext file
    }

    await persistentStore.set(SETTINGS_KEY, settingsToSave);

    // Compute and store HMAC for integrity verification
    const settingsJson = JSON.stringify(settingsToSave);
    const hmac = await computeSettingsHmac(settingsJson);
    if (hmac) {
      await persistentStore.set('settingsHmac', hmac);
    }

    await persistentStore.save();
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Derived stores for convenience
export const theme = derived(settings, ($settings) => $settings.app.theme);
export const ollamaUrl = derived(settings, ($settings) => $settings.ai.ollamaUrl);
export const ollamaModel = derived(settings, ($settings) => $settings.ai.model);

// Effective theme (resolves 'system' to actual theme)
export const effectiveTheme = writable<'light' | 'dark'>('light');

// Initialize theme based on system preference
export function initializeTheme(): void {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function updateEffectiveTheme(settingsTheme: Theme, prefersDark: boolean): void {
    if (settingsTheme === 'system') {
      effectiveTheme.set(prefersDark ? 'dark' : 'light');
    } else {
      effectiveTheme.set(settingsTheme);
    }
  }

  // Subscribe to settings changes (single subscription)
  settings.subscribe(($settings) => {
    updateEffectiveTheme($settings.app.theme, mediaQuery.matches);
  });

  // Listen for system theme changes - use get() to avoid creating new subscriptions
  mediaQuery.addEventListener('change', (e) => {
    const currentSettings = get(settings);
    if (currentSettings.app.theme === 'system') {
      effectiveTheme.set(e.matches ? 'dark' : 'light');
    }
  });
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Validate settings before persisting. Returns an error message or null if valid.
function validateSettings(partial: Partial<Settings>): string | null {
  if (partial.ai) {
    if (partial.ai.ollamaUrl !== undefined && !isValidUrl(partial.ai.ollamaUrl)) {
      return 'Invalid Ollama URL.';
    }
    if (partial.ai.temperature !== undefined && (partial.ai.temperature < 0 || partial.ai.temperature > 2)) {
      return 'Temperature must be between 0 and 2.';
    }
    if (partial.ai.maxTokens !== undefined && (partial.ai.maxTokens < 1 || partial.ai.maxTokens > 10000)) {
      return 'Max tokens must be between 1 and 10,000.';
    }
  }
  if (partial.app) {
    if (partial.app.autoSaveDelay !== undefined && (partial.app.autoSaveDelay < 100 || partial.app.autoSaveDelay > 10000)) {
      return 'Auto-save delay must be between 100 and 10,000 ms.';
    }
  }
  if (partial.natLangChain) {
    if (partial.natLangChain.apiUrl !== undefined && !isValidUrl(partial.natLangChain.apiUrl)) {
      return 'Invalid NatLangChain API URL.';
    }
    if (partial.natLangChain.defaultPrice !== undefined && partial.natLangChain.defaultPrice < 0) {
      return 'Default price cannot be negative.';
    }
  }
  return null;
}

// Update settings and persist
export function updateSettings(partial: Partial<Settings>): void {
  const error = validateSettings(partial);
  if (error) {
    showToast({ type: 'error', message: error });
    return;
  }

  settings.update((s) => ({
    ...s,
    ...partial,
    app: { ...s.app, ...partial.app },
    ai: { ...s.ai, ...partial.ai },
    data: { ...s.data, ...partial.data },
    notifications: { ...s.notifications, ...partial.notifications },
    weather: { ...s.weather, ...partial.weather },
    natLangChain: { ...s.natLangChain, ...partial.natLangChain },
  }));
  // Persist to disk
  saveSettings();
  // Audit trail
  logAuditEvent('settings_change', { changedKeys: Object.keys(partial) });
}

// Reset settings to defaults and persist
export function resetSettings(): void {
  settings.set({
    app: { ...DEFAULT_APP_SETTINGS },
    ai: { ...DEFAULT_AI_SETTINGS },
    data: { ...DEFAULT_DATA_SETTINGS },
    notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
    weather: { ...DEFAULT_WEATHER_SETTINGS },
    natLangChain: { ...DEFAULT_NATLANGCHAIN_SETTINGS },
  });
  // Persist to disk
  saveSettings();
}

import type {
  AppSettings,
  AISettings,
  DataSettings,
  NotificationSettings,
  QuickActionConfig,
  WeatherSettings,
} from './types';

// Default settings
export const DEFAULT_APP_SETTINGS: AppSettings = {
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
  hasCompletedOnboarding: false,
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  ollamaUrl: 'http://localhost:11434',
  model: 'llama3.2:3b',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: `You are HeLpER, a friendly assistant embedded in a note-taking app.
Your role is to help users:
- Format and structure their notes
- Expand brief notes into detailed content
- Summarize long notes
- Suggest improvements

Keep responses concise and practical. Match the user's tone.
When given a note for context, reference it naturally.`,
  includeNoteContext: true,
  saveChatHistory: false,
};

export const DEFAULT_DATA_SETTINGS: DataSettings = {
  dataLocation: '',
  backupEnabled: true,
  backupFrequency: 'daily',
  backupRetention: 7,
  exportFormat: 'markdown',
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  dailyReminder: false,
  reminderTime: '20:00',
  sound: true,
};

export const DEFAULT_WEATHER_SETTINGS: WeatherSettings = {
  enabled: true,
  location: '',
  autoDetectLocation: true,
  temperatureUnit: 'celsius',
  apiKey: '',
};

// Quick actions for AI
export const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    id: 'format',
    label: 'Format',
    prompt: 'Format this note with clear structure and bullet points:\n\n{note}',
  },
  {
    id: 'expand',
    label: 'Expand',
    prompt: 'Expand this brief note into 2-3 detailed paragraphs:\n\n{note}',
  },
  {
    id: 'summarize',
    label: 'Summarize',
    prompt: 'Summarize this note in 2-3 bullet points:\n\n{note}',
  },
  {
    id: 'grammar',
    label: 'Fix Grammar',
    prompt: 'Fix any grammar or spelling errors in this note:\n\n{note}',
  },
  {
    id: 'professional',
    label: 'Make Professional',
    prompt: 'Rewrite this note in a professional tone:\n\n{note}',
  },
];

// Window constraints
export const WINDOW_MIN_WIDTH = 320;
export const WINDOW_MIN_HEIGHT = 480;
export const WINDOW_DEFAULT_WIDTH = 400;
export const WINDOW_DEFAULT_HEIGHT = 600;

// Note constraints
export const NOTE_MAX_LENGTH = 5000;
export const NOTE_TITLE_MAX_LENGTH = 50;

// Auto-save debounce
export const AUTO_SAVE_DEBOUNCE_MS = 500;

// Ollama health check interval
export const OLLAMA_HEALTH_CHECK_INTERVAL_MS = 300000; // 5 minutes
export const OLLAMA_RETRY_INTERVAL_MS = 30000; // 30 seconds

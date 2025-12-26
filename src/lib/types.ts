// Note types
export interface Note {
  id: string;
  date: string; // YYYY-MM-DD
  title: string | null;
  content: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  deletedAt?: string; // Soft delete
}

// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatHistory {
  id: string;
  noteId?: string;
  messages: ChatMessage[];
  createdAt: string;
}

// Ollama types
export interface OllamaStatus {
  connected: boolean;
  model: string | null;
  error: string | null;
}

export interface OllamaRequest {
  model: string;
  messages: ChatMessage[];
  stream: boolean;
  options: {
    temperature: number;
    num_predict: number;
  };
}

export interface OllamaResponse {
  model: string;
  message: ChatMessage;
  done: boolean;
}

// Settings types
export type Theme = 'light' | 'dark' | 'system';
export type DateFormat = 'system' | 'US' | 'EU' | 'ISO';
export type TimeFormat = '12h' | '24h';
export type BackupFrequency = 'hourly' | 'daily' | 'weekly';
export type ExportFormat = 'markdown' | 'json' | 'txt';

export interface AppSettings {
  theme: Theme;
  startMinimized: boolean;
  startOnLogin: boolean;
  minimizeOnClose: boolean;
  alwaysOnTop: boolean;
  showInTaskbar: boolean;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  spellCheck: boolean;
  autoSaveDelay: number;
}

export interface AISettings {
  ollamaUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  includeNoteContext: boolean;
  saveChatHistory: boolean;
}

export interface DataSettings {
  dataLocation: string;
  backupEnabled: boolean;
  backupFrequency: BackupFrequency;
  backupRetention: number;
  exportFormat: ExportFormat;
}

export interface NotificationSettings {
  dailyReminder: boolean;
  reminderTime: string;
  sound: boolean;
}

export interface Settings {
  app: AppSettings;
  ai: AISettings;
  data: DataSettings;
  notifications: NotificationSettings;
}

// Quick action types
export type QuickAction = 'format' | 'expand' | 'summarize' | 'grammar' | 'professional';

export interface QuickActionConfig {
  id: QuickAction;
  label: string;
  prompt: string;
}

// Window state
export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  maximized: boolean;
}

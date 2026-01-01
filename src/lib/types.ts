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
  hasCompletedOnboarding: boolean;
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
  weather: WeatherSettings;
  natLangChain: NatLangChainSettings;
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

// Weather types
export type WeatherCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'mist'
  | 'rain'
  | 'drizzle'
  | 'snow'
  | 'thunderstorm'
  | 'fog'
  | 'unknown';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface WeatherData {
  location: string;
  tempCelsius: number;
  tempFahrenheit: number;
  feelsLikeCelsius: number;
  feelsLikeFahrenheit: number;
  condition: WeatherCondition;
  conditionText: string;
  humidity: number;
  windKph: number;
  windMph: number;
  windDirection: string;
  pressure: number;
  uvIndex: number;
  visibility: number;
  isDay: boolean;
  timestamp: string;
}

export interface JournalContext {
  weather?: WeatherData;
  dayOfWeek: string;
  timeOfDay: string;
  moonPhase?: string;
}

export interface WeatherSettings {
  enabled: boolean;
  location: string;
  autoDetectLocation: boolean;
  temperatureUnit: TemperatureUnit;
  apiKey: string;
}

// NatLangChain types
export type MonetizationModel = 'free' | 'subscription' | 'per_entry' | 'tip_jar';
export type EntryVisibility = 'public' | 'subscribers_only' | 'private';

export interface NatLangChainEntry {
  id?: string;
  author: string;
  content: string;
  intent: string;
  title?: string;
  tags?: string[];
  monetization: MonetizationModel;
  price?: number;
  visibility: EntryVisibility;
  context?: {
    weather?: string;
    location?: string;
    mood?: string;
    date: string;
    timeOfDay: string;
  };
  createdAt: string;
  hash?: string;
}

export interface NatLangChainValidation {
  valid: boolean;
  clarity_score: number;
  intent_detected: string;
  suggestions?: string[];
  warnings?: string[];
}

export interface NatLangChainPublishResult {
  success: boolean;
  entryId?: string;
  blockHash?: string;
  error?: string;
  transactionUrl?: string;
}

export interface NatLangChainStats {
  totalEntries: number;
  totalEarnings: number;
  subscribers: number;
  views: number;
}

export interface NatLangChainSettings {
  enabled: boolean;
  apiUrl: string;
  authorId: string;
  authorName: string;
  defaultMonetization: MonetizationModel;
  defaultVisibility: EntryVisibility;
  defaultPrice: number;
  includeWeatherContext: boolean;
  includeLocationContext: boolean;
  autoAuditBeforePublish: boolean;
}

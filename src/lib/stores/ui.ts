import { writable } from 'svelte/store';

// Settings panel visibility
export const settingsOpen = writable<boolean>(false);

// Calendar picker visibility
export const calendarOpen = writable<boolean>(false);

// First run wizard
export const showFirstRun = writable<boolean>(false);

// Error toast messages
export interface Toast {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  message: string;
  duration?: number;
}

export const toasts = writable<Toast[]>([]);

// Toast operations
export function showToast(toast: Omit<Toast, 'id'>): void {
  const id = crypto.randomUUID();
  const duration = toast.duration ?? 5000;

  toasts.update((t) => [...t, { ...toast, id }]);

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }
}

export function dismissToast(id: string): void {
  toasts.update((t) => t.filter((toast) => toast.id !== id));
}

// Search query for notes
export const searchQuery = writable<string>('');
export const searchFocused = writable<boolean>(false);

export function focusSearch(): void {
  searchFocused.set(true);
}

export function clearSearch(): void {
  searchQuery.set('');
}

// Toggle functions
export function toggleSettings(): void {
  settingsOpen.update((open) => !open);
}

export function toggleCalendar(): void {
  calendarOpen.update((open) => !open);
}

// Close all panels
export function closeAllPanels(): void {
  settingsOpen.set(false);
  calendarOpen.set(false);
}

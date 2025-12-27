import { writable, derived } from 'svelte/store';
import type { ChatMessage, OllamaStatus } from '../types';

// Chat panel visibility
export const chatPanelOpen = writable<boolean>(false);

// Current chat messages
export const chatMessages = writable<ChatMessage[]>([]);

// Chat input value
export const chatInput = writable<string>('');

// Loading state for AI responses
export const chatLoading = writable<boolean>(false);

// Ollama connection status
export const ollamaStatus = writable<OllamaStatus>({
  connected: false,
  model: null,
  error: null,
});

// Toggle chat panel
export function toggleChatPanel(): void {
  chatPanelOpen.update(open => !open);
}

// Add a message to chat
export function addChatMessage(message: ChatMessage): void {
  chatMessages.update(messages => [...messages, message]);
}

// Clear chat history
export function clearChat(): void {
  chatMessages.set([]);
}

// Update Ollama status
export function setOllamaConnected(model: string): void {
  ollamaStatus.set({
    connected: true,
    model,
    error: null,
  });
}

export function setOllamaDisconnected(error?: string): void {
  ollamaStatus.set({
    connected: false,
    model: null,
    error: error || null,
  });
}

// Derived: is chat available
export const isChatAvailable = derived(
  ollamaStatus,
  $status => $status.connected
);

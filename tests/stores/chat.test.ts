import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  chatPanelOpen,
  chatMessages,
  chatInput,
  chatLoading,
  ollamaStatus,
  toggleChatPanel,
  addChatMessage,
  clearChat,
  setOllamaConnected,
  setOllamaDisconnected,
  isChatAvailable,
} from '../../src/lib/stores/chat';
import type { ChatMessage } from '../../src/lib/types';

describe('Chat Store', () => {
  beforeEach(() => {
    // Reset stores
    chatPanelOpen.set(false);
    chatMessages.set([]);
    chatInput.set('');
    chatLoading.set(false);
    ollamaStatus.set({
      connected: false,
      model: null,
      error: null,
    });
  });

  // Spec: Chat Window - Collapsible panel (default: collapsed)
  describe('chatPanelOpen', () => {
    it('should default to collapsed', () => {
      expect(get(chatPanelOpen)).toBe(false);
    });
  });

  describe('toggleChatPanel', () => {
    it('should toggle chat panel visibility', () => {
      expect(get(chatPanelOpen)).toBe(false);
      toggleChatPanel();
      expect(get(chatPanelOpen)).toBe(true);
      toggleChatPanel();
      expect(get(chatPanelOpen)).toBe(false);
    });
  });

  // Spec: Chat history management
  describe('addChatMessage', () => {
    it('should add a message to chat history', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello',
        timestamp: new Date().toISOString(),
      };

      addChatMessage(message);

      const messages = get(chatMessages);
      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Hello');
    });

    it('should preserve message order', () => {
      addChatMessage({ role: 'user', content: 'First', timestamp: '2025-12-26T10:00:00Z' });
      addChatMessage({ role: 'assistant', content: 'Second', timestamp: '2025-12-26T10:00:01Z' });
      addChatMessage({ role: 'user', content: 'Third', timestamp: '2025-12-26T10:00:02Z' });

      const messages = get(chatMessages);
      expect(messages[0].content).toBe('First');
      expect(messages[1].content).toBe('Second');
      expect(messages[2].content).toBe('Third');
    });
  });

  describe('clearChat', () => {
    it('should clear all chat messages', () => {
      addChatMessage({ role: 'user', content: 'Test', timestamp: new Date().toISOString() });
      expect(get(chatMessages)).toHaveLength(1);

      clearChat();
      expect(get(chatMessages)).toHaveLength(0);
    });
  });

  // Spec: Ollama connection states
  describe('Ollama Status', () => {
    describe('setOllamaConnected', () => {
      it('should set connected status with model', () => {
        setOllamaConnected('llama3.2:3b');

        const status = get(ollamaStatus);
        expect(status.connected).toBe(true);
        expect(status.model).toBe('llama3.2:3b');
        expect(status.error).toBeNull();
      });
    });

    describe('setOllamaDisconnected', () => {
      it('should set disconnected status', () => {
        setOllamaConnected('model');
        setOllamaDisconnected();

        const status = get(ollamaStatus);
        expect(status.connected).toBe(false);
        expect(status.model).toBeNull();
      });

      it('should include error message when provided', () => {
        setOllamaDisconnected('Connection refused');

        const status = get(ollamaStatus);
        expect(status.error).toBe('Connection refused');
      });
    });
  });

  // Spec: Graceful Fallback - Chat disabled when Ollama unavailable
  describe('isChatAvailable', () => {
    it('should return true when Ollama is connected', () => {
      setOllamaConnected('llama3.2:3b');
      expect(get(isChatAvailable)).toBe(true);
    });

    it('should return false when Ollama is disconnected', () => {
      setOllamaDisconnected();
      expect(get(isChatAvailable)).toBe(false);
    });
  });

  describe('chatLoading', () => {
    it('should track loading state', () => {
      expect(get(chatLoading)).toBe(false);

      chatLoading.set(true);
      expect(get(chatLoading)).toBe(true);

      chatLoading.set(false);
      expect(get(chatLoading)).toBe(false);
    });
  });
});

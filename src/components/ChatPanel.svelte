<script lang="ts">
  import {
    chatPanelOpen,
    chatMessages,
    chatInput,
    chatLoading,
    ollamaStatus,
    toggleChatPanel,
    addChatMessage,
    clearChat,
  } from '../lib/stores/chat';
  import { selectedNote } from '../lib/stores/notes';
  import { QUICK_ACTIONS } from '../lib/constants';
  import type { ChatMessage, QuickAction } from '../lib/types';
  import { getTimestamp } from '../lib/utils/date';

  let inputValue = '';

  async function handleSend() {
    if (!inputValue.trim() || $chatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: getTimestamp(),
    };

    addChatMessage(userMessage);
    inputValue = '';
    chatLoading.set(true);

    // TODO: Implement actual Ollama API call
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'AI responses will be implemented with Ollama integration.',
        timestamp: getTimestamp(),
      };
      addChatMessage(assistantMessage);
      chatLoading.set(false);
    }, 1000);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      handleSend();
    }
  }

  function handleQuickAction(actionId: QuickAction) {
    const action = QUICK_ACTIONS.find(a => a.id === actionId);
    if (!action || !$selectedNote) return;

    const prompt = action.prompt.replace('{note}', $selectedNote.content);
    inputValue = prompt;
  }
</script>

<div class="card">
  <!-- Toggle Header -->
  <button
    on:click={toggleChatPanel}
    class="w-full flex items-center justify-between text-earth-100 hover:text-accent transition-colors duration-150 group"
  >
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-accent-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span class="text-note-title font-medium">AI Assistant</span>
    </div>
    <svg
      class="w-4 h-4 text-earth-400 transition-transform duration-200"
      class:rotate-180={$chatPanelOpen}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  <!-- Expandable Content -->
  {#if $chatPanelOpen}
    <div class="mt-4 space-y-3 animate-fade-in">
      <!-- Quick Actions -->
      {#if $selectedNote}
        <div class="flex flex-wrap gap-1.5">
          {#each QUICK_ACTIONS as action}
            <button
              on:click={() => handleQuickAction(action.id)}
              class="px-2.5 py-1 text-xs font-medium rounded-md bg-earth-600 text-earth-200 border border-earth-500/50 hover:bg-accent hover:text-earth-900 hover:border-accent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!$ollamaStatus.connected}
            >
              {action.label}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Chat Messages -->
      <div class="max-h-36 overflow-y-auto space-y-2 pr-1">
        {#each $chatMessages as message}
          <div
            class="text-chat-message rounded-md px-3 py-2 {message.role === 'user' ? 'bg-accent/10 text-accent' : 'bg-earth-600/50 text-earth-200'}"
          >
            <span class="font-semibold text-xs uppercase tracking-wide opacity-70">
              {message.role === 'user' ? 'You' : 'AI'}
            </span>
            <p class="mt-1">{message.content}</p>
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-4 text-earth-400">
            <svg class="w-8 h-8 mb-2 text-earth-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p class="text-sm">Ask me to help with your notes</p>
          </div>
        {/each}

        {#if $chatLoading}
          <div class="flex items-center gap-2 text-chat-message text-earth-300 px-3 py-2">
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-subtle"></span>
              <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-subtle" style="animation-delay: 0.2s"></span>
              <span class="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-subtle" style="animation-delay: 0.4s"></span>
            </div>
            <span>AI is thinking...</span>
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={inputValue}
          on:keydown={handleKeydown}
          class="input flex-1 text-chat-message py-2"
          placeholder={$ollamaStatus.connected ? 'Type a message...' : 'Ollama not connected'}
          disabled={!$ollamaStatus.connected || $chatLoading}
        />
        <button
          on:click={handleSend}
          class="btn btn-primary px-4 text-sm"
          disabled={!$ollamaStatus.connected || $chatLoading || !inputValue.trim()}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>

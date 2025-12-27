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
    // For now, simulate a response
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
    class="w-full flex items-center justify-between text-note-title font-medium"
  >
    <span>AI Assistant</span>
    <svg
      class="w-4 h-4 transition-transform"
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
    <div class="mt-3 space-y-3">
      <!-- Quick Actions -->
      {#if $selectedNote}
        <div class="flex flex-wrap gap-1">
          {#each QUICK_ACTIONS as action}
            <button
              on:click={() => handleQuickAction(action.id)}
              class="px-2 py-1 text-xs rounded bg-light-border dark:bg-dark-border hover:bg-light-primary hover:dark:bg-dark-primary hover:text-white transition-colors"
              disabled={!$ollamaStatus.connected}
            >
              {action.label}
            </button>
          {/each}
        </div>
      {/if}

      <!-- Chat Messages -->
      <div class="max-h-32 overflow-y-auto space-y-2">
        {#each $chatMessages as message}
          <div
            class="text-chat-message"
            class:text-light-primary={message.role === 'user'}
            class:dark:text-dark-primary={message.role === 'user'}
          >
            <span class="font-medium">
              {message.role === 'user' ? 'You' : 'AI'}:
            </span>
            <span class="ml-1">{message.content}</span>
          </div>
        {:else}
          <p class="text-chat-message text-light-text-secondary dark:text-dark-text-secondary text-center">
            Ask me to help with your notes
          </p>
        {/each}

        {#if $chatLoading}
          <div class="text-chat-message text-light-text-secondary dark:text-dark-text-secondary">
            AI is thinking...
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <div class="flex gap-2">
        <input
          type="text"
          bind:value={inputValue}
          on:keydown={handleKeydown}
          class="input flex-1 text-chat-message"
          placeholder={$ollamaStatus.connected ? 'Type a message...' : 'Ollama not connected'}
          disabled={!$ollamaStatus.connected || $chatLoading}
        />
        <button
          on:click={handleSend}
          class="btn btn-primary text-chat-message"
          disabled={!$ollamaStatus.connected || $chatLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  {/if}
</div>

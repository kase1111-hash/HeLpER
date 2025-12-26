<script lang="ts">
  import { ollamaStatus } from '../lib/stores/chat';
  import { toggleSettings } from '../lib/stores/ui';
</script>

<div class="flex items-center justify-between px-3 py-1.5 bg-light-surface dark:bg-dark-surface border-t border-light-border dark:border-dark-border text-status-bar">
  <!-- Ollama Status -->
  <div class="flex items-center gap-2">
    <span
      class="w-2 h-2 rounded-full"
      class:bg-success-light={$ollamaStatus.connected}
      class:dark:bg-success-dark={$ollamaStatus.connected}
      class:bg-light-text-secondary={!$ollamaStatus.connected}
      class:dark:bg-dark-text-secondary={!$ollamaStatus.connected}
    ></span>
    <span class="text-light-text-secondary dark:text-dark-text-secondary">
      Ollama: {$ollamaStatus.connected ? `Connected (${$ollamaStatus.model})` : 'Disconnected'}
    </span>
  </div>

  <!-- Settings Button -->
  <button
    on:click={toggleSettings}
    class="flex items-center gap-1 hover:text-light-primary dark:hover:text-dark-primary transition-colors"
    title="Settings (Ctrl+,)"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span>Settings</span>
  </button>
</div>

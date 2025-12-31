<script lang="ts">
  import { get } from 'svelte/store';
  import { ollamaStatus, ollamaChecking, refreshOllamaStatus } from '../lib/stores/chat';
  import { settings } from '../lib/stores/settings';
  import { toggleSettings } from '../lib/stores/ui';

  async function handleRetry() {
    const currentSettings = get(settings);
    await refreshOllamaStatus(currentSettings.ai.ollamaUrl);
  }

  $: statusText = $ollamaChecking
    ? 'Connecting...'
    : $ollamaStatus.connected
      ? $ollamaStatus.model
      : 'Disconnected';

  $: errorTooltip = $ollamaStatus.error || 'Ollama is not running. Start Ollama and click retry.';
</script>

<div
  class="flex items-center justify-between px-4 py-2 bg-earth-950 border-t border-earth-700/50 text-status-bar"
>
  <!-- Ollama Status -->
  <div class="flex items-center gap-2">
    <span
      class="status-dot"
      class:status-dot-online={$ollamaStatus.connected}
      class:status-dot-offline={!$ollamaStatus.connected && !$ollamaChecking}
      class:status-dot-checking={$ollamaChecking}
    ></span>
    <span
      class="text-earth-300"
      class:text-warning={!$ollamaStatus.connected && !$ollamaChecking}
      title={!$ollamaStatus.connected ? errorTooltip : ''}
    >
      {statusText}
    </span>

    {#if !$ollamaStatus.connected && !$ollamaChecking}
      <button
        on:click={handleRetry}
        class="ml-1 px-2 py-0.5 text-xs rounded bg-earth-700 hover:bg-earth-600 text-earth-200 transition-colors duration-150"
        title="Retry connection"
      >
        Retry
      </button>
    {/if}

    {#if $ollamaChecking}
      <svg class="w-3 h-3 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    {/if}
  </div>

  <!-- Settings Button -->
  <button
    on:click={toggleSettings}
    class="flex items-center gap-1.5 text-earth-400 hover:text-accent transition-colors duration-150 group"
    title="Settings (Ctrl+,)"
  >
    <svg
      class="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    <span>Settings</span>
  </button>
</div>

<style>
  .status-dot-checking {
    @apply bg-accent animate-pulse;
  }
</style>

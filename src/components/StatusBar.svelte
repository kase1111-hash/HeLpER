<script lang="ts">
  import { ollamaStatus } from '../lib/stores/chat';
  import { toggleSettings } from '../lib/stores/ui';
</script>

<div class="flex items-center justify-between px-4 py-2 bg-earth-950 border-t border-earth-700/50 text-status-bar">
  <!-- Ollama Status -->
  <div class="flex items-center gap-2">
    <span
      class="status-dot"
      class:status-dot-online={$ollamaStatus.connected}
      class:status-dot-offline={!$ollamaStatus.connected}
    ></span>
    <span class="text-earth-300">
      {$ollamaStatus.connected ? $ollamaStatus.model : 'Disconnected'}
    </span>
  </div>

  <!-- Settings Button -->
  <button
    on:click={toggleSettings}
    class="flex items-center gap-1.5 text-earth-400 hover:text-accent transition-colors duration-150 group"
    title="Settings (Ctrl+,)"
  >
    <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <span>Settings</span>
  </button>
</div>

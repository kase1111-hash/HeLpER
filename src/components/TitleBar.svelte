<script lang="ts">
  import { appWindow } from '@tauri-apps/api/window';

  async function minimize() {
    await appWindow.minimize();
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize();
  }

  async function close() {
    // TODO: Implement minimize to tray based on settings
    await appWindow.close();
  }
</script>

<div class="drag-region flex items-center justify-between h-10 px-3 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
  <!-- App Title -->
  <div class="flex items-center gap-2">
    <span class="text-lg font-semibold text-light-primary dark:text-dark-primary">HeLpER</span>
  </div>

  <!-- Window Controls -->
  <div class="no-drag flex items-center gap-1">
    <button
      on:click={minimize}
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
      title="Minimize"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>

    <button
      on:click={toggleMaximize}
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
      title="Maximize"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4h4M4 16v4h4M16 4h4v4M16 20h4v-4" />
      </svg>
    </button>

    <button
      on:click={close}
      class="w-8 h-8 flex items-center justify-center rounded hover:bg-error-light dark:hover:bg-error-dark hover:text-white transition-colors"
      title="Close"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</div>

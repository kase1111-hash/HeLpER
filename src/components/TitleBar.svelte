<script lang="ts">
  import { getCurrentWindow } from '@tauri-apps/api/window';

  const appWindow = getCurrentWindow();

  async function minimize() {
    await appWindow.minimize();
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize();
  }

  async function close() {
    await appWindow.close();
  }
</script>

<div
  class="drag-region flex items-center justify-between h-11 px-4 bg-earth-950 border-b border-earth-700/50"
>
  <!-- App Title -->
  <div class="flex items-center gap-2.5">
    <div
      class="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-accent-warm flex items-center justify-center shadow-glow"
    >
      <span class="text-earth-900 text-xs font-bold">H</span>
    </div>
    <span class="text-app-title text-earth-50 tracking-wide">HeLpER</span>
  </div>

  <!-- Window Controls -->
  <div class="no-drag flex items-center gap-0.5">
    <button
      on:click={minimize}
      class="w-9 h-7 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-700 hover:text-earth-100 transition-all duration-150"
      title="Minimize"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
    </button>

    <button
      on:click={toggleMaximize}
      class="w-9 h-7 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-700 hover:text-earth-100 transition-all duration-150"
      title="Maximize"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 8V4h4M4 16v4h4M16 4h4v4M16 20h4v-4"
        />
      </svg>
    </button>

    <button
      on:click={close}
      class="w-9 h-7 flex items-center justify-center rounded-md text-earth-300 hover:bg-error hover:text-earth-50 transition-all duration-150"
      title="Close"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</div>

<script lang="ts">
  import { settings, updateSettings } from '../lib/stores/settings';
  import { settingsOpen, toggleSettings } from '../lib/stores/ui';
  import type { Theme } from '../lib/types';

  function handleThemeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    updateSettings({
      app: { ...$settings.app, theme: target.value as Theme }
    });
  }

  function handleOllamaUrlChange(event: Event) {
    const target = event.target as HTMLInputElement;
    updateSettings({
      ai: { ...$settings.ai, ollamaUrl: target.value }
    });
  }

  function handleModelChange(event: Event) {
    const target = event.target as HTMLInputElement;
    updateSettings({
      ai: { ...$settings.ai, model: target.value }
    });
  }

  function handleClose() {
    toggleSettings();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  on:click={handleBackdropClick}
>
  <div class="bg-light-bg dark:bg-dark-bg rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border">
      <h2 class="text-lg font-semibold">Settings</h2>
      <button
        on:click={handleClose}
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-6 overflow-y-auto max-h-[60vh]">
      <!-- Appearance Section -->
      <section>
        <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
          Appearance
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label for="theme" class="text-sm">Theme</label>
            <select
              id="theme"
              value={$settings.app.theme}
              on:change={handleThemeChange}
              class="input w-32 text-sm"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </section>

      <!-- AI Section -->
      <section>
        <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
          AI Assistant
        </h3>
        <div class="space-y-3">
          <div>
            <label for="ollama-url" class="text-sm block mb-1">Ollama URL</label>
            <input
              id="ollama-url"
              type="text"
              value={$settings.ai.ollamaUrl}
              on:change={handleOllamaUrlChange}
              class="input text-sm"
              placeholder="http://localhost:11434"
            />
          </div>
          <div>
            <label for="model" class="text-sm block mb-1">Model</label>
            <input
              id="model"
              type="text"
              value={$settings.ai.model}
              on:change={handleModelChange}
              class="input text-sm"
              placeholder="llama3.2:3b"
            />
          </div>
        </div>
      </section>

      <!-- Behavior Section -->
      <section>
        <h3 class="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3">
          Behavior
        </h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              type="checkbox"
              checked={$settings.app.minimizeOnClose}
              on:change={(e) => updateSettings({ app: { ...$settings.app, minimizeOnClose: e.currentTarget.checked } })}
              class="w-4 h-4 rounded border-light-border dark:border-dark-border"
            />
            <span class="text-sm">Minimize to tray on close</span>
          </label>
          <label class="flex items-center gap-3">
            <input
              type="checkbox"
              checked={$settings.app.startMinimized}
              on:change={(e) => updateSettings({ app: { ...$settings.app, startMinimized: e.currentTarget.checked } })}
              class="w-4 h-4 rounded border-light-border dark:border-dark-border"
            />
            <span class="text-sm">Start minimized</span>
          </label>
          <label class="flex items-center gap-3">
            <input
              type="checkbox"
              checked={$settings.app.alwaysOnTop}
              on:change={(e) => updateSettings({ app: { ...$settings.app, alwaysOnTop: e.currentTarget.checked } })}
              class="w-4 h-4 rounded border-light-border dark:border-dark-border"
            />
            <span class="text-sm">Always on top</span>
          </label>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-2 px-4 py-3 border-t border-light-border dark:border-dark-border">
      <button on:click={handleClose} class="btn btn-secondary text-sm">
        Close
      </button>
    </div>
  </div>
</div>

<script lang="ts">
  import { settings, updateSettings } from '../lib/stores/settings';
  import { settingsOpen, toggleSettings, showToast } from '../lib/stores/ui';
  import { allNotes } from '../lib/stores/notes';
  import { exportNotes, backupAllData } from '../lib/services/export';
  import type { Theme } from '../lib/types';

  let exporting = false;

  async function handleExport(format: 'markdown' | 'json') {
    if (exporting) return;
    exporting = true;
    try {
      const notes = Array.from($allNotes.values()).flat();
      const success = await exportNotes({ notes, format });
      if (success) {
        showToast({ type: 'success', message: `Notes exported as ${format.toUpperCase()}` });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to export notes' });
    } finally {
      exporting = false;
    }
  }

  async function handleBackup() {
    if (exporting) return;
    exporting = true;
    try {
      const notes = Array.from($allNotes.values()).flat();
      const success = await backupAllData(notes);
      if (success) {
        showToast({ type: 'success', message: 'Backup created successfully' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to create backup' });
    } finally {
      exporting = false;
    }
  }

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
  class="fixed inset-0 bg-earth-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
  on:click={handleBackdropClick}
>
  <div class="bg-earth-800 rounded-sleek shadow-elevated w-full max-w-md mx-4 max-h-[80vh] overflow-hidden border border-earth-600/50 animate-slide-up">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-earth-600/50">
      <h2 class="text-lg font-semibold text-earth-50">Settings</h2>
      <button
        on:click={handleClose}
        class="w-8 h-8 flex items-center justify-center rounded-md text-earth-400 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
      <!-- Appearance Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          Appearance
        </h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label for="theme" class="text-sm text-earth-200">Theme</label>
            <select
              id="theme"
              value={$settings.app.theme}
              on:change={handleThemeChange}
              class="input w-32 text-sm py-1.5"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- AI Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          AI Assistant
        </h3>
        <div class="space-y-4">
          <div>
            <label for="ollama-url" class="text-sm text-earth-200 block mb-1.5">Ollama URL</label>
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
            <label for="model" class="text-sm text-earth-200 block mb-1.5">Model</label>
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

      <div class="divider"></div>

      <!-- Behavior Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          Behavior
        </h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.minimizeOnClose}
                on:change={(e) => updateSettings({ app: { ...$settings.app, minimizeOnClose: e.currentTarget.checked } })}
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"></div>
              <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors">Minimize to tray on close</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.startMinimized}
                on:change={(e) => updateSettings({ app: { ...$settings.app, startMinimized: e.currentTarget.checked } })}
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"></div>
              <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors">Start minimized</span>
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.alwaysOnTop}
                on:change={(e) => updateSettings({ app: { ...$settings.app, alwaysOnTop: e.currentTarget.checked } })}
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"></div>
              <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors">Always on top</span>
          </label>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Data Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          Data
        </h3>
        <div class="space-y-3">
          <div>
            <p class="text-sm text-earth-300 mb-2">Export Notes</p>
            <div class="flex gap-2">
              <button
                on:click={() => handleExport('markdown')}
                disabled={exporting}
                class="btn btn-secondary text-sm flex-1"
              >
                {exporting ? 'Exporting...' : 'Markdown'}
              </button>
              <button
                on:click={() => handleExport('json')}
                disabled={exporting}
                class="btn btn-secondary text-sm flex-1"
              >
                {exporting ? 'Exporting...' : 'JSON'}
              </button>
            </div>
          </div>
          <div>
            <p class="text-sm text-earth-300 mb-2">Backup All Data</p>
            <button
              on:click={handleBackup}
              disabled={exporting}
              class="btn btn-secondary text-sm w-full"
            >
              {exporting ? 'Creating Backup...' : 'Create Backup'}
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <div class="flex justify-end gap-2 px-5 py-4 border-t border-earth-600/50 bg-earth-800/50">
      <button on:click={handleClose} class="btn btn-secondary text-sm">
        Close
      </button>
    </div>
  </div>
</div>

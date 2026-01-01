<script lang="ts">
  import { settings, updateSettings } from '../lib/stores/settings';
  import { settingsOpen, toggleSettings, showToast } from '../lib/stores/ui';
  import { allNotes } from '../lib/stores/notes';
  import { exportNotes, backupAllData } from '../lib/services/export';
  import { detectLocation } from '../lib/services/weather';
  import { forceRefreshWeather, detectedLocation } from '../lib/stores/weather';
  import type { Theme, TemperatureUnit, MonetizationModel } from '../lib/types';
  import { checkConnection } from '../lib/services/natlangchain';

  let exporting = false;
  let detectingLocation = false;
  let checkingNlc = false;
  let nlcConnected = false;

  function handleNlcMonetizationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    updateSettings({
      natLangChain: { ...$settings.natLangChain, defaultMonetization: target.value as MonetizationModel },
    });
  }

  async function handleCheckNlcConnection() {
    if (!$settings.natLangChain.apiUrl) {
      showToast({ type: 'error', message: 'Please enter a NatLangChain API URL' });
      return;
    }
    checkingNlc = true;
    try {
      nlcConnected = await checkConnection($settings.natLangChain.apiUrl);
      if (nlcConnected) {
        showToast({ type: 'success', message: 'Connected to NatLangChain' });
      } else {
        showToast({ type: 'warning', message: 'Could not connect to NatLangChain' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Connection check failed' });
    } finally {
      checkingNlc = false;
    }
  }

  async function handleDetectLocation() {
    detectingLocation = true;
    try {
      const location = await detectLocation();
      if (location) {
        detectedLocation.set(location);
        updateSettings({
          weather: { ...$settings.weather, location },
        });
        showToast({ type: 'success', message: `Location detected: ${location}` });
        await forceRefreshWeather();
      } else {
        showToast({ type: 'error', message: 'Could not detect location' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to detect location' });
    } finally {
      detectingLocation = false;
    }
  }

  function handleWeatherLocationChange(event: Event) {
    const target = event.target as HTMLInputElement;
    updateSettings({
      weather: { ...$settings.weather, location: target.value },
    });
  }

  function handleWeatherApiKeyChange(event: Event) {
    const target = event.target as HTMLInputElement;
    updateSettings({
      weather: { ...$settings.weather, apiKey: target.value },
    });
    // Refresh weather after API key change
    forceRefreshWeather();
  }

  function handleTemperatureUnitChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    updateSettings({
      weather: { ...$settings.weather, temperatureUnit: target.value as TemperatureUnit },
    });
  }

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
      app: { ...$settings.app, theme: target.value as Theme },
    });
  }

  function isValidUrl(urlString: string): boolean {
    if (!urlString.trim()) return true; // Allow empty to reset to default
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  function handleOllamaUrlChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();

    if (!isValidUrl(value)) {
      showToast({ type: 'error', message: 'Please enter a valid URL (http:// or https://)' });
      // Reset to previous value
      target.value = $settings.ai.ollamaUrl;
      return;
    }

    updateSettings({
      ai: { ...$settings.ai, ollamaUrl: value },
    });
  }

  function handleModelChange(event: Event) {
    const target = event.target as HTMLInputElement;
    updateSettings({
      ai: { ...$settings.ai, model: target.value },
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
  <div
    class="bg-earth-800 rounded-sleek shadow-elevated w-full max-w-md mx-4 max-h-[80vh] overflow-hidden border border-earth-600/50 animate-slide-up"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-earth-600/50">
      <h2 class="text-lg font-semibold text-earth-50">Settings</h2>
      <button
        on:click={handleClose}
        class="w-8 h-8 flex items-center justify-center rounded-md text-earth-400 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
      <!-- Appearance Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Appearance</h3>
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

      <!-- Weather Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          Journal Context
        </h3>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.weather.enabled}
                on:change={(e) =>
                  updateSettings({
                    weather: { ...$settings.weather, enabled: e.currentTarget.checked },
                  })}
                class="sr-only peer"
              />
              <div
                class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
              ></div>
              <div
                class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
              ></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
              >Show weather & context in journal</span
            >
          </label>

          {#if $settings.weather.enabled}
            <div>
              <label for="weather-api-key" class="text-sm text-earth-200 block mb-1.5">
                Weather API Key
                <a
                  href="https://www.weatherapi.com/signup.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-accent hover:underline ml-1"
                >(Get free key)</a>
              </label>
              <input
                id="weather-api-key"
                type="password"
                value={$settings.weather.apiKey}
                on:change={handleWeatherApiKeyChange}
                class="input text-sm"
                placeholder="Enter your WeatherAPI.com key"
              />
            </div>

            <div>
              <label for="weather-location" class="text-sm text-earth-200 block mb-1.5">Location</label>
              <div class="flex gap-2">
                <input
                  id="weather-location"
                  type="text"
                  value={$settings.weather.location}
                  on:change={handleWeatherLocationChange}
                  class="input text-sm flex-1"
                  placeholder="City name or coordinates"
                />
                <button
                  on:click={handleDetectLocation}
                  disabled={detectingLocation}
                  class="btn btn-secondary text-sm px-3 whitespace-nowrap"
                  title="Auto-detect location from IP"
                >
                  {#if detectingLocation}
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  {:else}
                    Detect
                  {/if}
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <label for="temp-unit" class="text-sm text-earth-200">Temperature Unit</label>
              <select
                id="temp-unit"
                value={$settings.weather.temperatureUnit}
                on:change={handleTemperatureUnitChange}
                class="input w-32 text-sm py-1.5"
              >
                <option value="celsius">Celsius</option>
                <option value="fahrenheit">Fahrenheit</option>
              </select>
            </div>
          {/if}
        </div>
      </section>

      <div class="divider"></div>

      <!-- Behavior Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Behavior</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.minimizeOnClose}
                on:change={(e) =>
                  updateSettings({
                    app: { ...$settings.app, minimizeOnClose: e.currentTarget.checked },
                  })}
                class="sr-only peer"
              />
              <div
                class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
              ></div>
              <div
                class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
              ></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
              >Minimize to tray on close</span
            >
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.startMinimized}
                on:change={(e) =>
                  updateSettings({
                    app: { ...$settings.app, startMinimized: e.currentTarget.checked },
                  })}
                class="sr-only peer"
              />
              <div
                class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
              ></div>
              <div
                class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
              ></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
              >Start minimized</span
            >
          </label>
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.app.alwaysOnTop}
                on:change={(e) =>
                  updateSettings({
                    app: { ...$settings.app, alwaysOnTop: e.currentTarget.checked },
                  })}
                class="sr-only peer"
              />
              <div
                class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
              ></div>
              <div
                class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
              ></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
              >Always on top</span
            >
          </label>
        </div>
      </section>

      <div class="divider"></div>

      <!-- NatLangChain Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">
          NatLangChain Publishing
        </h3>
        <div class="space-y-4">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative">
              <input
                type="checkbox"
                checked={$settings.natLangChain.enabled}
                on:change={(e) =>
                  updateSettings({
                    natLangChain: { ...$settings.natLangChain, enabled: e.currentTarget.checked },
                  })}
                class="sr-only peer"
              />
              <div
                class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
              ></div>
              <div
                class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
              ></div>
            </div>
            <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
              >Enable blockchain publishing</span
            >
          </label>

          {#if $settings.natLangChain.enabled}
            <div>
              <label for="nlc-api-url" class="text-sm text-earth-200 block mb-1.5">
                API URL
                <a
                  href="https://github.com/kase1111-hash/NatLangChain"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-accent hover:underline ml-1"
                >(Learn more)</a>
              </label>
              <div class="flex gap-2">
                <input
                  id="nlc-api-url"
                  type="text"
                  value={$settings.natLangChain.apiUrl}
                  on:change={(e) =>
                    updateSettings({
                      natLangChain: { ...$settings.natLangChain, apiUrl: e.currentTarget.value },
                    })}
                  class="input text-sm flex-1"
                  placeholder="http://localhost:5000"
                />
                <button
                  on:click={handleCheckNlcConnection}
                  disabled={checkingNlc}
                  class="btn btn-secondary text-sm px-3"
                  title="Test connection"
                >
                  {#if checkingNlc}
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                  {:else}
                    Test
                  {/if}
                </button>
              </div>
            </div>

            <div>
              <label for="nlc-author-name" class="text-sm text-earth-200 block mb-1.5">Author Name</label>
              <input
                id="nlc-author-name"
                type="text"
                value={$settings.natLangChain.authorName}
                on:change={(e) =>
                  updateSettings({
                    natLangChain: { ...$settings.natLangChain, authorName: e.currentTarget.value },
                  })}
                class="input text-sm"
                placeholder="Your display name"
              />
            </div>

            <div>
              <label for="nlc-author-id" class="text-sm text-earth-200 block mb-1.5">Author ID (optional)</label>
              <input
                id="nlc-author-id"
                type="text"
                value={$settings.natLangChain.authorId}
                on:change={(e) =>
                  updateSettings({
                    natLangChain: { ...$settings.natLangChain, authorId: e.currentTarget.value },
                  })}
                class="input text-sm"
                placeholder="Unique identifier for earnings"
              />
            </div>

            <div class="flex items-center justify-between">
              <label for="nlc-monetization" class="text-sm text-earth-200">Default Monetization</label>
              <select
                id="nlc-monetization"
                value={$settings.natLangChain.defaultMonetization}
                on:change={handleNlcMonetizationChange}
                class="input w-40 text-sm py-1.5"
              >
                <option value="free">Free</option>
                <option value="subscription">Subscription</option>
                <option value="per_entry">Pay Per Entry</option>
                <option value="tip_jar">Tip Jar</option>
              </select>
            </div>

            <label class="flex items-center gap-3 cursor-pointer group">
              <div class="relative">
                <input
                  type="checkbox"
                  checked={$settings.natLangChain.autoAuditBeforePublish}
                  on:change={(e) =>
                    updateSettings({
                      natLangChain: { ...$settings.natLangChain, autoAuditBeforePublish: e.currentTarget.checked },
                    })}
                  class="sr-only peer"
                />
                <div
                  class="w-9 h-5 bg-earth-600 rounded-full peer-checked:bg-accent transition-colors duration-200"
                ></div>
                <div
                  class="absolute left-0.5 top-0.5 w-4 h-4 bg-earth-300 rounded-full peer-checked:translate-x-4 peer-checked:bg-earth-900 transition-all duration-200"
                ></div>
              </div>
              <span class="text-sm text-earth-200 group-hover:text-earth-100 transition-colors"
                >Validate before publishing</span
              >
            </label>
          {/if}
        </div>
      </section>

      <div class="divider"></div>

      <!-- Data Section -->
      <section>
        <h3 class="text-xs font-semibold text-accent uppercase tracking-wider mb-3">Data</h3>
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
      <button on:click={handleClose} class="btn btn-secondary text-sm"> Close </button>
    </div>
  </div>
</div>

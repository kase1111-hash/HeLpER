<script lang="ts">
  import { onMount } from 'svelte';
  import { settings, updateSettings } from '../lib/stores/settings';
  import { ollamaStatus, refreshOllamaStatus } from '../lib/stores/chat';
  import { addNote, currentDate } from '../lib/stores/notes';
  import { createNote } from '../lib/utils/note';
  import { get } from 'svelte/store';
  import type { Theme } from '../lib/types';

  export let onComplete: () => void;

  let currentStep = 0;
  let selectedTheme: Theme = 'system';
  let checkingOllama = false;

  const steps = ['Welcome', 'Theme', 'AI Setup', 'Ready'];

  onMount(() => {
    selectedTheme = $settings.app.theme;
  });

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  function selectTheme(theme: Theme) {
    selectedTheme = theme;
    updateSettings({ app: { ...$settings.app, theme } });
  }

  async function checkOllama() {
    checkingOllama = true;
    await refreshOllamaStatus($settings.ai.ollamaUrl);
    checkingOllama = false;
  }

  function completeOnboarding() {
    // Mark onboarding as complete
    updateSettings({ app: { ...$settings.app, hasCompletedOnboarding: true } });

    // Create welcome note
    const welcomeNote = createNote(
      `Welcome to HeLpER!

This is your first note. Here are some tips:

- Each day gets its own notes
- Use the arrows to navigate between days
- Click the AI panel below to get writing help
- Press Ctrl/Cmd + N for a new note
- Press Ctrl/Cmd + F to search notes

Happy writing!`,
      get(currentDate)
    );
    addNote(welcomeNote);

    onComplete();
  }
</script>

<div class="fixed inset-0 bg-earth-950/90 backdrop-blur-sm flex items-center justify-center z-50">
  <div
    class="bg-earth-800 rounded-sleek shadow-elevated w-full max-w-lg mx-4 overflow-hidden border border-earth-600/50"
  >
    <!-- Progress Bar -->
    <div class="flex gap-1 p-3 bg-earth-900/50">
      {#each steps as step, i}
        <div
          class="flex-1 h-1 rounded-full transition-colors duration-300"
          class:bg-accent={i <= currentStep}
          class:bg-earth-600={i > currentStep}
        ></div>
      {/each}
    </div>

    <!-- Content -->
    <div class="p-6">
      {#if currentStep === 0}
        <!-- Welcome -->
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-accent/20 rounded-full flex items-center justify-center"
          >
            <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-earth-50 mb-2">Welcome to HeLpER</h2>
          <p class="text-earth-300 mb-4">Your Helpful Lightweight Personal Everyday Recorder</p>
          <div class="bg-earth-700/50 rounded-lg p-4 text-left text-sm text-earth-300 space-y-2">
            <p>
              <strong class="text-earth-100">Privacy First:</strong> All your notes stay on your device.
            </p>
            <p>
              <strong class="text-earth-100">AI Powered:</strong> Optional local AI assistant via Ollama.
            </p>
            <p>
              <strong class="text-earth-100">Simple:</strong> Just write. Notes auto-save as you type.
            </p>
          </div>
        </div>
      {:else if currentStep === 1}
        <!-- Theme Selection -->
        <div class="text-center">
          <h2 class="text-xl font-semibold text-earth-50 mb-2">Choose Your Theme</h2>
          <p class="text-earth-400 mb-6 text-sm">Select how HeLpER should look</p>

          <div class="grid grid-cols-3 gap-3">
            <button
              on:click={() => selectTheme('light')}
              class="p-4 rounded-lg border-2 transition-all duration-200 {selectedTheme === 'light'
                ? 'border-accent bg-accent/10'
                : 'border-earth-600 hover:border-earth-500'}"
            >
              <div
                class="w-10 h-10 mx-auto mb-2 bg-white rounded-lg border border-gray-200 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <span class="text-sm text-earth-200">Light</span>
            </button>

            <button
              on:click={() => selectTheme('dark')}
              class="p-4 rounded-lg border-2 transition-all duration-200 {selectedTheme === 'dark'
                ? 'border-accent bg-accent/10'
                : 'border-earth-600 hover:border-earth-500'}"
            >
              <div
                class="w-10 h-10 mx-auto mb-2 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div>
              <span class="text-sm text-earth-200">Dark</span>
            </button>

            <button
              on:click={() => selectTheme('system')}
              class="p-4 rounded-lg border-2 transition-all duration-200 {selectedTheme === 'system'
                ? 'border-accent bg-accent/10'
                : 'border-earth-600 hover:border-earth-500'}"
            >
              <div
                class="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-white to-gray-800 rounded-lg border border-gray-400 flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span class="text-sm text-earth-200">System</span>
            </button>
          </div>
        </div>
      {:else if currentStep === 2}
        <!-- Ollama Setup -->
        <div class="text-center">
          <h2 class="text-xl font-semibold text-earth-50 mb-2">AI Assistant Setup</h2>
          <p class="text-earth-400 mb-6 text-sm">Optional: Connect to Ollama for AI features</p>

          <div class="bg-earth-700/50 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-earth-200">Ollama Status</span>
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full"
                  class:bg-green-500={$ollamaStatus.connected}
                  class:bg-red-500={!$ollamaStatus.connected && !checkingOllama}
                  class:bg-yellow-500={checkingOllama}
                ></span>
                <span
                  class="text-sm"
                  class:text-green-400={$ollamaStatus.connected}
                  class:text-red-400={!$ollamaStatus.connected}
                >
                  {checkingOllama
                    ? 'Checking...'
                    : $ollamaStatus.connected
                      ? 'Connected'
                      : 'Not Connected'}
                </span>
              </div>
            </div>

            {#if $ollamaStatus.connected}
              <p class="text-sm text-earth-300">
                Model: <span class="text-accent">{$ollamaStatus.model}</span>
              </p>
            {:else}
              <button
                on:click={checkOllama}
                disabled={checkingOllama}
                class="btn btn-secondary text-sm w-full"
              >
                {checkingOllama ? 'Checking...' : 'Check Connection'}
              </button>
            {/if}
          </div>

          {#if !$ollamaStatus.connected}
            <div class="text-left text-sm text-earth-400 space-y-2">
              <p class="font-medium text-earth-300">To enable AI features:</p>
              <ol class="list-decimal list-inside space-y-1 ml-2">
                <li>
                  Install <a
                    href="https://ollama.ai"
                    target="_blank"
                    class="text-accent hover:underline">Ollama</a
                  >
                </li>
                <li>Run: <code class="bg-earth-700 px-1 rounded">ollama pull llama3.2:3b</code></li>
                <li>Start Ollama and click "Check Connection"</li>
              </ol>
              <p class="text-earth-500 italic mt-3">
                You can skip this and set up AI later in Settings.
              </p>
            </div>
          {/if}
        </div>
      {:else if currentStep === 3}
        <!-- Ready -->
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-earth-50 mb-2">You're All Set!</h2>
          <p class="text-earth-300 mb-6">Here are some keyboard shortcuts to get you started:</p>

          <div class="bg-earth-700/50 rounded-lg p-4 text-left">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="flex justify-between">
                <span class="text-earth-400">New Note</span>
                <kbd class="bg-earth-600 px-2 py-0.5 rounded text-earth-200">Ctrl+N</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-earth-400">Search</span>
                <kbd class="bg-earth-600 px-2 py-0.5 rounded text-earth-200">Ctrl+F</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-earth-400">Settings</span>
                <kbd class="bg-earth-600 px-2 py-0.5 rounded text-earth-200">Ctrl+,</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-earth-400">Close</span>
                <kbd class="bg-earth-600 px-2 py-0.5 rounded text-earth-200">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div
      class="flex justify-between items-center px-6 py-4 border-t border-earth-600/50 bg-earth-800/50"
    >
      <button
        on:click={prevStep}
        class="btn btn-secondary text-sm"
        class:invisible={currentStep === 0}
      >
        Back
      </button>

      <span class="text-xs text-earth-500">
        {currentStep + 1} of {steps.length}
      </span>

      {#if currentStep < steps.length - 1}
        <button on:click={nextStep} class="btn btn-primary text-sm">
          {currentStep === 2 && !$ollamaStatus.connected ? 'Skip' : 'Next'}
        </button>
      {:else}
        <button on:click={completeOnboarding} class="btn btn-primary text-sm">
          Start Writing
        </button>
      {/if}
    </div>
  </div>
</div>

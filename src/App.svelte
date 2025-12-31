<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import TitleBar from './components/TitleBar.svelte';
  import DateNav from './components/DateNav.svelte';
  import NotesList from './components/NotesList.svelte';
  import NoteEditor from './components/NoteEditor.svelte';
  import ChatPanel from './components/ChatPanel.svelte';
  import StatusBar from './components/StatusBar.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import ToastContainer from './components/ToastContainer.svelte';
  import FirstRunWizard from './components/FirstRunWizard.svelte';
  import {
    effectiveTheme,
    initializeTheme,
    initializeSettings,
    settings,
    settingsLoaded,
  } from './lib/stores/settings';
  import { settingsOpen, closeAllPanels, focusSearch } from './lib/stores/ui';
  import { currentDate, loadNotesForDate, addNote } from './lib/stores/notes';
  import { createNote } from './lib/utils/note';
  import { ollamaStatus, refreshOllamaStatus } from './lib/stores/chat';
  import { setupTrayListeners } from './lib/services/tauri';
  import { OLLAMA_HEALTH_CHECK_INTERVAL_MS, OLLAMA_RETRY_INTERVAL_MS } from './lib/constants';

  let cleanupTrayListeners: (() => void) | null = null;
  let unsubscribeDate: (() => void) | null = null;
  let healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  let showOnboarding = false;

  // Check if we need to show onboarding after settings load
  $: if ($settingsLoaded && !$settings.app.hasCompletedOnboarding) {
    showOnboarding = true;
  }

  function handleOnboardingComplete() {
    showOnboarding = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    const isInputFocused =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Escape - close panels (works anywhere)
    if (event.key === 'Escape') {
      if (get(settingsOpen)) {
        closeAllPanels();
        event.preventDefault();
        return;
      }
    }

    // Ctrl/Cmd + , - toggle settings
    if ((event.ctrlKey || event.metaKey) && event.key === ',') {
      settingsOpen.update((open) => !open);
      event.preventDefault();
      return;
    }

    // Ctrl/Cmd + N - new note (unless in input)
    if ((event.ctrlKey || event.metaKey) && event.key === 'n' && !isInputFocused) {
      const note = createNote('', get(currentDate));
      addNote(note);
      event.preventDefault();
      return;
    }

    // Ctrl/Cmd + F - focus search (unless in input other than search)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      focusSearch();
      event.preventDefault();
      return;
    }
  }

  async function checkOllama() {
    const currentSettings = get(settings);
    await refreshOllamaStatus(currentSettings.ai.ollamaUrl);
  }

  function startHealthChecks() {
    // Clear any existing interval
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }

    // Use shorter interval when disconnected, longer when connected
    const updateInterval = () => {
      const status = get(ollamaStatus);
      const interval = status.connected
        ? OLLAMA_HEALTH_CHECK_INTERVAL_MS
        : OLLAMA_RETRY_INTERVAL_MS;

      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }

      healthCheckInterval = setInterval(async () => {
        await checkOllama();
        // Adjust interval based on new connection status
        updateInterval();
      }, interval);
    };

    updateInterval();
  }

  onMount(async () => {
    // Load persisted settings first (before other initialization that uses settings)
    await initializeSettings();

    initializeTheme();
    // Force dark mode for earth tones
    document.documentElement.classList.add('dark');

    // Set up tray event listeners
    cleanupTrayListeners = setupTrayListeners();

    // Load notes for the current date
    loadNotesForDate(get(currentDate));

    // Subscribe to date changes and load notes when date changes
    unsubscribeDate = currentDate.subscribe((date) => {
      loadNotesForDate(date);
    });

    // Check Ollama connection status and start periodic health checks
    await checkOllama();
    startHealthChecks();
  });

  onDestroy(() => {
    if (cleanupTrayListeners) {
      cleanupTrayListeners();
    }
    if (unsubscribeDate) {
      unsubscribeDate();
    }
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="h-screen flex flex-col bg-earth-900 text-earth-100 overflow-hidden">
  <!-- Title Bar -->
  <TitleBar />

  <!-- Date Navigation -->
  <DateNav />

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col overflow-hidden p-3 gap-3">
    <!-- Notes List -->
    <NotesList />

    <!-- Note Editor -->
    <NoteEditor />

    <!-- AI Chat Panel -->
    <ChatPanel />
  </div>

  <!-- Status Bar -->
  <StatusBar />

  <!-- Settings Panel (Overlay) -->
  {#if $settingsOpen}
    <SettingsPanel />
  {/if}

  <!-- Toast Notifications -->
  <ToastContainer />

  <!-- First Run Wizard -->
  {#if showOnboarding}
    <FirstRunWizard onComplete={handleOnboardingComplete} />
  {/if}
</div>

<style>
  :global(html),
  :global(body),
  :global(#app) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>

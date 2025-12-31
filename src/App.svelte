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
  import { effectiveTheme, initializeTheme, settings } from './lib/stores/settings';
  import { settingsOpen } from './lib/stores/ui';
  import { currentDate, loadNotesForDate } from './lib/stores/notes';
  import { setOllamaConnected, setOllamaDisconnected } from './lib/stores/chat';
  import { setupTrayListeners, checkOllamaStatus } from './lib/services/tauri';

  let cleanupTrayListeners: (() => void) | null = null;
  let unsubscribeDate: (() => void) | null = null;

  async function initializeOllama() {
    const currentSettings = get(settings);
    const status = await checkOllamaStatus(currentSettings.ai.ollamaUrl);
    if (status.connected && status.model) {
      setOllamaConnected(status.model);
    } else {
      setOllamaDisconnected(status.error || undefined);
    }
  }

  onMount(() => {
    initializeTheme();
    // Force dark mode for earth tones
    document.documentElement.classList.add('dark');

    // Set up tray event listeners
    cleanupTrayListeners = setupTrayListeners();

    // Load notes for the current date
    loadNotesForDate(get(currentDate));

    // Subscribe to date changes and load notes when date changes
    unsubscribeDate = currentDate.subscribe(date => {
      loadNotesForDate(date);
    });

    // Check Ollama connection status
    initializeOllama();
  });

  onDestroy(() => {
    if (cleanupTrayListeners) {
      cleanupTrayListeners();
    }
    if (unsubscribeDate) {
      unsubscribeDate();
    }
  });
</script>

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
</div>

<style>
  :global(html), :global(body), :global(#app) {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>

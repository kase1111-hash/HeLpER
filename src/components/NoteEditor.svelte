<script lang="ts">
  import { selectedNote, updateNote } from '../lib/stores/notes';
  import { updateNoteContent } from '../lib/utils/note';
  import { NOTE_MAX_LENGTH, AUTO_SAVE_DEBOUNCE_MS } from '../lib/constants';
  import {
    sttAvailable,
    isNoteSTTActive,
    currentTranscript,
    sttError,
    toggleSTT,
    stopSTT,
  } from '../lib/stores/stt';
  import { settings } from '../lib/stores/settings';
  import JournalContext from './JournalContext.svelte';
  import PublishPanel from './PublishPanel.svelte';

  let content = '';
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;
  let publishPanelOpen = false;

  // Sync content when selected note changes
  $: if ($selectedNote) {
    content = $selectedNote.content;
  } else {
    content = '';
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    content = target.value;

    // Debounced auto-save
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      if ($selectedNote) {
        const updated = updateNoteContent($selectedNote, content);
        updateNote(updated);
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
  }

  // Handle STT result - append to content
  function handleSTTResult(transcript: string) {
    content = content + transcript + ' ';
    // Trigger save
    if ($selectedNote) {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const updated = updateNoteContent($selectedNote, content);
        updateNote(updated);
      }, AUTO_SAVE_DEBOUNCE_MS);
    }
  }

  // Toggle voice input
  function handleVoiceInput() {
    if ($isNoteSTTActive) {
      stopSTT();
    } else {
      toggleSTT('note', handleSTTResult);
    }
  }

  $: charCount = content.length;
  $: isOverLimit = charCount > NOTE_MAX_LENGTH;
  $: charPercentage = (charCount / NOTE_MAX_LENGTH) * 100;
</script>

<div class="card flex-1 flex flex-col min-h-0">
  {#if $selectedNote}
    <!-- Journal Context Panel -->
    <div class="mb-3">
      <JournalContext />
    </div>

    <textarea
      bind:value={content}
      on:input={handleInput}
      class="flex-1 w-full resize-none bg-transparent text-note-body text-earth-100 focus:outline-none placeholder-earth-500 leading-relaxed"
      placeholder="Start writing your thoughts..."
      maxlength={NOTE_MAX_LENGTH}
    ></textarea>

    <!-- Footer with STT, Publish, and Character Count -->
    <div class="flex items-center justify-between pt-3 border-t border-earth-600/50 mt-3 gap-3">
      <div class="flex items-center gap-2">
        <!-- Voice Input Button -->
        {#if $sttAvailable}
          <button
            on:click={handleVoiceInput}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
            class:bg-accent={$isNoteSTTActive}
            class:text-earth-900={$isNoteSTTActive}
            class:animate-pulse-subtle={$isNoteSTTActive}
            class:bg-earth-600={!$isNoteSTTActive}
            class:text-earth-200={!$isNoteSTTActive}
            class:hover:bg-earth-500={!$isNoteSTTActive}
            title={$isNoteSTTActive ? 'Stop dictation' : 'Start dictation'}
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            <span>{$isNoteSTTActive ? 'Listening...' : 'Dictate'}</span>
          </button>
        {/if}

        <!-- Publish Button -->
        {#if $settings.natLangChain.enabled && content.trim()}
          <button
            on:click={() => (publishPanelOpen = true)}
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-earth-600 text-earth-200 hover:bg-accent hover:text-earth-900 transition-all duration-150"
            title="Publish to NatLangChain"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>Publish</span>
          </button>
        {/if}
      </div>

      <!-- Progress bar -->
      <div class="flex-1 h-1 bg-earth-600 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          class:bg-accent={!isOverLimit && charPercentage < 80}
          class:bg-warning={charPercentage >= 80 && charPercentage < 100}
          class:bg-error={isOverLimit}
          style="width: {Math.min(charPercentage, 100)}%"
        ></div>
      </div>
      <span
        class="text-status-bar tabular-nums"
        class:text-error={isOverLimit}
        class:text-warning={charPercentage >= 80 && !isOverLimit}
        class:text-earth-400={charPercentage < 80}
      >
        {charCount.toLocaleString()}/{NOTE_MAX_LENGTH.toLocaleString()}
      </span>
    </div>
    {#if $sttError && $isNoteSTTActive}
      <p class="text-xs text-error mt-1">{$sttError}</p>
    {/if}
  {:else}
    <div class="flex-1 flex flex-col items-center justify-center text-earth-400 gap-3">
      <svg class="w-12 h-12 text-earth-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      <p class="text-sm">Select a note or create a new one</p>
    </div>
  {/if}
</div>

<!-- Publish Panel -->
{#if $selectedNote}
  <PublishPanel
    note={$selectedNote}
    bind:open={publishPanelOpen}
    on:close={() => (publishPanelOpen = false)}
  />
{/if}

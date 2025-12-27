<script lang="ts">
  import { selectedNote, updateNote } from '../lib/stores/notes';
  import { updateNoteContent } from '../lib/utils/note';
  import { NOTE_MAX_LENGTH, AUTO_SAVE_DEBOUNCE_MS } from '../lib/constants';

  let content = '';
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

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

  $: charCount = content.length;
  $: isOverLimit = charCount > NOTE_MAX_LENGTH;
  $: charPercentage = (charCount / NOTE_MAX_LENGTH) * 100;
</script>

<div class="card flex-1 flex flex-col min-h-0">
  {#if $selectedNote}
    <textarea
      bind:value={content}
      on:input={handleInput}
      class="flex-1 w-full resize-none bg-transparent text-note-body text-earth-100 focus:outline-none placeholder-earth-500 leading-relaxed"
      placeholder="Start writing your thoughts..."
      maxlength={NOTE_MAX_LENGTH}
    ></textarea>

    <!-- Character Count -->
    <div class="flex items-center justify-between pt-3 border-t border-earth-600/50 mt-3">
      <!-- Progress bar -->
      <div class="flex-1 h-1 bg-earth-600 rounded-full overflow-hidden mr-3">
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
  {:else}
    <div class="flex-1 flex flex-col items-center justify-center text-earth-400 gap-3">
      <svg class="w-12 h-12 text-earth-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <p class="text-sm">Select a note or create a new one</p>
    </div>
  {/if}
</div>

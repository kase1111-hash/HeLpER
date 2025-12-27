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
</script>

<div class="card flex-1 flex flex-col min-h-0">
  {#if $selectedNote}
    <textarea
      bind:value={content}
      on:input={handleInput}
      class="flex-1 w-full resize-none bg-transparent text-note-body focus:outline-none placeholder-light-text-secondary dark:placeholder-dark-text-secondary"
      placeholder="Start writing..."
      maxlength={NOTE_MAX_LENGTH}
    ></textarea>

    <!-- Character Count -->
    <div class="flex justify-end pt-2 border-t border-light-border dark:border-dark-border mt-2">
      <span
        class="text-status-bar"
        class:text-error-light={isOverLimit}
        class:dark:text-error-dark={isOverLimit}
        class:text-light-text-secondary={!isOverLimit}
        class:dark:text-dark-text-secondary={!isOverLimit}
      >
        {charCount}/{NOTE_MAX_LENGTH}
      </span>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary">
      <p>Select a note or create a new one</p>
    </div>
  {/if}
</div>

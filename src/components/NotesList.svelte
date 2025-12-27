<script lang="ts">
  import {
    currentNotes,
    selectedNoteId,
    currentDate,
    addNote,
  } from '../lib/stores/notes';
  import { createNote, getNotePreview } from '../lib/utils/note';
  import type { Note } from '../lib/types';

  function handleNewNote() {
    const note = createNote('', $currentDate);
    addNote(note);
  }

  function handleSelectNote(note: Note) {
    selectedNoteId.set(note.id);
  }

  $: notes = $currentNotes;
</script>

<div class="card max-h-32 overflow-y-auto">
  <div class="space-y-1">
    {#each notes as note (note.id)}
      <button
        on:click={() => handleSelectNote(note)}
        class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors"
        class:bg-light-primary={$selectedNoteId === note.id}
        class:dark:bg-dark-primary={$selectedNoteId === note.id}
        class:text-white={$selectedNoteId === note.id}
        class:hover:bg-light-border={$selectedNoteId !== note.id}
        class:dark:hover:bg-dark-border={$selectedNoteId !== note.id}
      >
        <span class="w-2 h-2 rounded-full flex-shrink-0"
          class:bg-white={$selectedNoteId === note.id}
          class:bg-light-text-secondary={$selectedNoteId !== note.id}
          class:dark:bg-dark-text-secondary={$selectedNoteId !== note.id}
        ></span>
        <span class="text-note-title truncate">
          {getNotePreview(note)}
        </span>
      </button>
    {:else}
      <p class="text-center text-light-text-secondary dark:text-dark-text-secondary py-2">
        No notes for this day
      </p>
    {/each}

    <!-- New Note Button -->
    <button
      on:click={handleNewNote}
      class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-light-primary dark:text-dark-primary hover:bg-light-border dark:hover:bg-dark-border transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span class="text-note-title">New Note</span>
    </button>
  </div>
</div>

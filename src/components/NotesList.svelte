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

<div class="card max-h-36 overflow-y-auto">
  <div class="space-y-1">
    {#each notes as note (note.id)}
      <button
        on:click={() => handleSelectNote(note)}
        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all duration-150 group"
        class:bg-accent={$selectedNoteId === note.id}
        class:text-earth-900={$selectedNoteId === note.id}
        class:shadow-glow={$selectedNoteId === note.id}
        class:hover:bg-earth-600={$selectedNoteId !== note.id}
        class:text-earth-200={$selectedNoteId !== note.id}
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-150"
          class:bg-earth-900={$selectedNoteId === note.id}
          class:bg-earth-400={$selectedNoteId !== note.id}
          class:group-hover:bg-accent={$selectedNoteId !== note.id}
        ></span>
        <span class="text-note-title truncate">
          {getNotePreview(note)}
        </span>
      </button>
    {:else}
      <p class="text-center text-earth-400 py-3 text-sm">
        No notes for this day
      </p>
    {/each}

    <!-- New Note Button -->
    <button
      on:click={handleNewNote}
      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-accent hover:bg-earth-600 transition-all duration-150 group active:scale-[0.98]"
    >
      <svg class="w-4 h-4 transition-transform duration-150 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span class="text-note-title font-medium">New Note</span>
    </button>
  </div>
</div>

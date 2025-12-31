<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    currentNotes,
    selectedNoteId,
    currentDate,
    addNote,
    deleteNote,
  } from '../lib/stores/notes';
  import { searchQuery, searchFocused, clearSearch } from '../lib/stores/ui';
  import { createNote, getNotePreview } from '../lib/utils/note';
  import type { Note } from '../lib/types';

  let searchInput: HTMLInputElement;
  let unsubscribeFocus: (() => void) | null = null;

  onMount(() => {
    unsubscribeFocus = searchFocused.subscribe((focused) => {
      if (focused && searchInput) {
        searchInput.focus();
        searchFocused.set(false);
      }
    });
  });

  onDestroy(() => {
    if (unsubscribeFocus) unsubscribeFocus();
  });

  function handleNewNote() {
    const note = createNote('', $currentDate);
    addNote(note);
  }

  function handleSelectNote(note: Note) {
    selectedNoteId.set(note.id);
  }

  function handleDeleteNote(event: Event, note: Note) {
    event.stopPropagation();
    if (confirm('Delete this note?')) {
      deleteNote(note.id, note.date);
    }
  }

  function handleSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      clearSearch();
      searchInput?.blur();
    }
  }

  $: filteredNotes = $searchQuery
    ? $currentNotes.filter((note) =>
        note.content.toLowerCase().includes($searchQuery.toLowerCase())
      )
    : $currentNotes;
</script>

<div class="card max-h-48 overflow-y-auto">
  <!-- Search Input -->
  <div class="relative mb-2">
    <svg
      class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-earth-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      bind:this={searchInput}
      bind:value={$searchQuery}
      on:keydown={handleSearchKeydown}
      type="text"
      placeholder="Search notes... (Ctrl+F)"
      class="w-full pl-8 pr-8 py-1.5 text-sm bg-earth-800 border border-earth-600 rounded-md text-earth-200 placeholder-earth-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
    />
    {#if $searchQuery}
      <button
        on:click={clearSearch}
        class="absolute right-2 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-200 transition-colors"
        title="Clear search (Esc)"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    {/if}
  </div>

  <div class="space-y-1">
    {#each filteredNotes as note (note.id)}
      <div
        class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left transition-all duration-150 group cursor-pointer"
        class:bg-accent={$selectedNoteId === note.id}
        class:text-earth-900={$selectedNoteId === note.id}
        class:shadow-glow={$selectedNoteId === note.id}
        class:hover:bg-earth-600={$selectedNoteId !== note.id}
        class:text-earth-200={$selectedNoteId !== note.id}
        on:click={() => handleSelectNote(note)}
        on:keydown={(e) => e.key === 'Enter' && handleSelectNote(note)}
        role="button"
        tabindex="0"
      >
        <span
          class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-150"
          class:bg-earth-900={$selectedNoteId === note.id}
          class:bg-earth-400={$selectedNoteId !== note.id}
          class:group-hover:bg-accent={$selectedNoteId !== note.id}
        ></span>
        <span class="text-note-title truncate flex-1">
          {getNotePreview(note)}
        </span>
        <button
          on:click={(e) => handleDeleteNote(e, note)}
          class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error/20 transition-all duration-150"
          class:hover:bg-earth-500={$selectedNoteId === note.id}
          title="Delete note"
        >
          <svg class="w-3.5 h-3.5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    {:else}
      <p class="text-center text-earth-400 py-3 text-sm">
        {$searchQuery ? 'No matching notes' : 'No notes for this day'}
      </p>
    {/each}

    <!-- New Note Button -->
    <button
      on:click={handleNewNote}
      class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-accent hover:bg-earth-600 transition-all duration-150 group active:scale-[0.98]"
    >
      <svg
        class="w-4 h-4 transition-transform duration-150 group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      <span class="text-note-title font-medium">New Note</span>
    </button>
  </div>
</div>

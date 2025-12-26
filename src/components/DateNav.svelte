<script lang="ts">
  import {
    currentDate,
    navigatePreviousDay,
    navigateNextDay,
    navigateToToday,
  } from '../lib/stores/notes';
  import { toggleCalendar, calendarOpen } from '../lib/stores/ui';
  import { formatDateDisplay, isToday } from '../lib/utils/date';

  $: displayDate = formatDateDisplay($currentDate);
  $: isTodayDate = isToday($currentDate);
</script>

<div class="flex items-center justify-between px-3 py-2 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
  <!-- Previous Day Button -->
  <button
    on:click={navigatePreviousDay}
    class="w-8 h-8 flex items-center justify-center rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
    title="Previous day (Ctrl+Left)"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  <!-- Date Display -->
  <div class="flex items-center gap-2">
    <button
      on:click={toggleCalendar}
      class="text-date-header font-medium hover:text-light-primary dark:hover:text-dark-primary transition-colors"
      class:text-light-primary={$calendarOpen}
      class:dark:text-dark-primary={$calendarOpen}
    >
      {displayDate}
    </button>

    {#if !isTodayDate}
      <button
        on:click={navigateToToday}
        class="px-2 py-1 text-xs rounded bg-light-primary dark:bg-dark-primary text-white hover:opacity-90 transition-opacity"
        title="Go to today (Ctrl+T)"
      >
        Today
      </button>
    {/if}
  </div>

  <!-- Next Day Button -->
  <button
    on:click={navigateNextDay}
    class="w-8 h-8 flex items-center justify-center rounded hover:bg-light-border dark:hover:bg-dark-border transition-colors"
    title="Next day (Ctrl+Right)"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>

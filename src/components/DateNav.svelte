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

<div class="flex items-center justify-between px-4 py-2.5 bg-earth-800 border-b border-earth-600/50">
  <!-- Previous Day Button -->
  <button
    on:click={navigatePreviousDay}
    class="w-8 h-8 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150 active:scale-95"
    title="Previous day (Ctrl+Left)"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  <!-- Date Display -->
  <div class="flex items-center gap-3">
    <button
      on:click={toggleCalendar}
      class="text-date-header font-medium text-earth-100 hover:text-accent transition-colors duration-150"
      class:text-accent={$calendarOpen}
    >
      {displayDate}
    </button>

    {#if !isTodayDate}
      <button
        on:click={navigateToToday}
        class="px-2.5 py-1 text-xs font-medium rounded-md bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-all duration-150 active:scale-95"
        title="Go to today (Ctrl+T)"
      >
        Today
      </button>
    {/if}
  </div>

  <!-- Next Day Button -->
  <button
    on:click={navigateNextDay}
    class="w-8 h-8 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150 active:scale-95"
    title="Next day (Ctrl+Right)"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>

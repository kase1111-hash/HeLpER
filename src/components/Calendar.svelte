<script lang="ts">
  import { currentDate, navigateToDate } from '../lib/stores/notes';
  import { calendarOpen, toggleCalendar } from '../lib/stores/ui';
  import { formatDateISO, isToday } from '../lib/utils/date';

  // Current view state (month being displayed)
  let viewDate = new Date($currentDate + 'T00:00:00');

  // Reset view when calendar opens
  $: if ($calendarOpen) {
    viewDate = new Date($currentDate + 'T00:00:00');
  }

  // Month/year display
  $: monthYear = viewDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Day names
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Generate calendar days for current view
  $: calendarDays = generateCalendarDays(viewDate);

  interface CalendarDay {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
  }

  function generateCalendarDays(date: Date): CalendarDay[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Previous month days to show
    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    const days: CalendarDay[] = [];

    // Add previous month's trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const dateStr = formatDateISO(d);
      days.push({
        date: dateStr,
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: isToday(dateStr),
        isSelected: dateStr === $currentDate,
      });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = formatDateISO(d);
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: isToday(dateStr),
        isSelected: dateStr === $currentDate,
      });
    }

    // Add next month's leading days to fill the grid (6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateStr = formatDateISO(d);
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isToday: isToday(dateStr),
        isSelected: dateStr === $currentDate,
      });
    }

    return days;
  }

  function previousMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  }

  function nextMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  }

  function selectDate(dateStr: string) {
    navigateToDate(dateStr);
    toggleCalendar();
  }

  function goToToday() {
    const today = formatDateISO(new Date());
    navigateToDate(today);
    toggleCalendar();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      toggleCalendar();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      toggleCalendar();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $calendarOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="fixed inset-0 bg-earth-950/50 z-40" on:click={handleBackdropClick}>
    <div
      class="absolute left-1/2 top-20 -translate-x-1/2 bg-earth-800 rounded-sleek shadow-elevated border border-earth-600/50 p-4 animate-slide-up w-72"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <button
          on:click={previousMonth}
          class="w-8 h-8 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150"
          title="Previous month"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <span class="text-sm font-medium text-earth-100">{monthYear}</span>

        <button
          on:click={nextMonth}
          class="w-8 h-8 flex items-center justify-center rounded-md text-earth-300 hover:bg-earth-600 hover:text-earth-100 transition-all duration-150"
          title="Next month"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- Day names -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        {#each dayNames as day}
          <div class="text-xs text-center text-earth-400 font-medium py-1">
            {day}
          </div>
        {/each}
      </div>

      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        {#each calendarDays as day}
          <button
            on:click={() => selectDate(day.date)}
            class="w-8 h-8 text-sm rounded-md transition-all duration-150 flex items-center justify-center
              {day.isCurrentMonth ? 'text-earth-100' : 'text-earth-500'}
              {day.isSelected
              ? 'bg-accent text-earth-900 font-semibold'
              : day.isToday
                ? 'bg-accent/20 text-accent font-medium ring-1 ring-accent/50'
                : 'hover:bg-earth-600'}"
            title={day.date}
          >
            {day.day}
          </button>
        {/each}
      </div>

      <!-- Footer -->
      <div class="mt-4 pt-3 border-t border-earth-600/50 flex justify-between">
        <button
          on:click={goToToday}
          class="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          Go to Today
        </button>
        <button
          on:click={toggleCalendar}
          class="text-xs text-earth-400 hover:text-earth-200 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

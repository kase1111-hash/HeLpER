<script lang="ts">
  import { weatherDisplay, weatherLoading, weatherError } from '../lib/stores/weather';
  import { getWeatherIcon } from '../lib/services/weather';

  export let compact = false;
</script>

{#if $weatherLoading}
  <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-earth-700/50 text-earth-400">
    <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      ></path>
    </svg>
    {#if !compact}
      <span class="text-xs">Loading...</span>
    {/if}
  </div>
{:else if $weatherDisplay}
  <div
    class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-earth-700/50 hover:bg-earth-600/50 transition-colors cursor-default"
    title="{$weatherDisplay.conditionText} - Feels like {$weatherDisplay.displayFeelsLike}"
  >
    <span class="text-base leading-none">{getWeatherIcon($weatherDisplay.condition, $weatherDisplay.isDay)}</span>
    <span class="text-sm font-medium text-earth-100">{$weatherDisplay.displayTemp}</span>
    {#if !compact}
      <span class="text-xs text-earth-400">{$weatherDisplay.conditionText}</span>
    {/if}
  </div>
{:else if $weatherError}
  <div
    class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-earth-700/30 text-earth-500"
    title={$weatherError}
  >
    <span class="text-base leading-none">🌡️</span>
    {#if !compact}
      <span class="text-xs">No weather</span>
    {/if}
  </div>
{/if}

<script lang="ts">
  import {
    journalContext,
    weatherDisplay,
    weatherLoading,
    weatherError,
    forceRefreshWeather,
  } from '../lib/stores/weather';
  import { settings } from '../lib/stores/settings';
  import { getWeatherIcon, getTimeOfDayIcon, getMoonPhaseIcon } from '../lib/services/weather';

  export let expanded = false;

  let refreshing = false;

  async function handleRefresh() {
    refreshing = true;
    await forceRefreshWeather();
    refreshing = false;
  }
</script>

{#if $settings.weather.enabled}
  <div class="rounded-lg bg-earth-800/50 border border-earth-600/30 overflow-hidden">
    <!-- Header -->
    <button
      on:click={() => (expanded = !expanded)}
      class="w-full flex items-center justify-between px-3 py-2 hover:bg-earth-700/30 transition-colors"
    >
      <div class="flex items-center gap-2">
        <span class="text-xs font-medium text-accent uppercase tracking-wider">Journal Context</span>
        {#if $weatherLoading || refreshing}
          <svg class="w-3 h-3 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        {/if}
      </div>
      <div class="flex items-center gap-2">
        {#if $weatherDisplay && !expanded}
          <span class="text-sm">{getWeatherIcon($weatherDisplay.condition, $weatherDisplay.isDay)}</span>
          <span class="text-sm text-earth-200">{$weatherDisplay.displayTemp}</span>
        {/if}
        <svg
          class="w-4 h-4 text-earth-400 transition-transform duration-200"
          class:rotate-180={expanded}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded Content -->
    {#if expanded}
      <div class="px-3 pb-3 space-y-3 border-t border-earth-600/30">
        <!-- Time & Day Info -->
        {#if $journalContext}
          <div class="flex items-center justify-between pt-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">{getTimeOfDayIcon($journalContext.timeOfDay)}</span>
              <div>
                <p class="text-sm font-medium text-earth-100 capitalize">{$journalContext.timeOfDay}</p>
                <p class="text-xs text-earth-400">{$journalContext.dayOfWeek}</p>
              </div>
            </div>
            {#if $journalContext.moonPhase}
              <div class="flex items-center gap-1.5" title={$journalContext.moonPhase}>
                <span class="text-lg">{getMoonPhaseIcon($journalContext.moonPhase)}</span>
                <span class="text-xs text-earth-400 hidden sm:inline">{$journalContext.moonPhase}</span>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Weather Details -->
        {#if $weatherDisplay}
          <div class="space-y-2 pt-2 border-t border-earth-600/20">
            <!-- Main Weather -->
            <div class="flex items-center gap-3">
              <span class="text-2xl">{getWeatherIcon($weatherDisplay.condition, $weatherDisplay.isDay)}</span>
              <div>
                <p class="text-lg font-semibold text-earth-50">{$weatherDisplay.displayTemp}</p>
                <p class="text-sm text-earth-300">{$weatherDisplay.conditionText}</p>
              </div>
            </div>

            <!-- Weather Stats Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex items-center gap-1.5 text-earth-400">
                <span>🌡️</span>
                <span>Feels like {$weatherDisplay.displayFeelsLike}</span>
              </div>
              <div class="flex items-center gap-1.5 text-earth-400">
                <span>💧</span>
                <span>Humidity {$weatherDisplay.humidity}%</span>
              </div>
              <div class="flex items-center gap-1.5 text-earth-400">
                <span>💨</span>
                <span>Wind {Math.round($weatherDisplay.windKph)} km/h {$weatherDisplay.windDirection}</span>
              </div>
              <div class="flex items-center gap-1.5 text-earth-400">
                <span>☀️</span>
                <span>UV Index {$weatherDisplay.uvIndex}</span>
              </div>
            </div>

            <!-- Location -->
            <p class="text-xs text-earth-500 pt-1">{$weatherDisplay.location}</p>
          </div>
        {:else if $weatherError}
          <div class="pt-2 text-center">
            <p class="text-xs text-earth-500">{$weatherError}</p>
            <button
              on:click|stopPropagation={handleRefresh}
              class="mt-2 px-3 py-1 text-xs bg-earth-700 hover:bg-earth-600 rounded text-earth-200 transition-colors"
            >
              Retry
            </button>
          </div>
        {:else if !$weatherLoading}
          <div class="pt-2 text-center">
            <p class="text-xs text-earth-500">Configure weather in settings</p>
          </div>
        {/if}

        <!-- Refresh Button -->
        {#if $weatherDisplay}
          <div class="flex justify-end pt-1">
            <button
              on:click|stopPropagation={handleRefresh}
              disabled={refreshing || $weatherLoading}
              class="flex items-center gap-1 px-2 py-1 text-xs text-earth-400 hover:text-earth-200 transition-colors disabled:opacity-50"
              title="Refresh weather"
            >
              <svg
                class="w-3 h-3"
                class:animate-spin={refreshing || $weatherLoading}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

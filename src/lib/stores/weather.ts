import { writable, derived, get } from 'svelte/store';
import type { WeatherData, JournalContext } from '../types';
import { fetchWeather, fetchJournalContext, detectLocation } from '../services/weather';
import { settings } from './settings';

// Weather data store
export const currentWeather = writable<WeatherData | null>(null);
export const journalContext = writable<JournalContext | null>(null);
export const weatherLoading = writable(false);
export const weatherError = writable<string | null>(null);
export const detectedLocation = writable<string | null>(null);

// Cache key to prevent redundant fetches
let lastFetchKey = '';
let lastFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Refresh weather data based on current settings
 */
export async function refreshWeather(): Promise<void> {
  const currentSettings = get(settings);

  if (!currentSettings.weather.enabled) {
    currentWeather.set(null);
    journalContext.set(null);
    return;
  }

  let location = currentSettings.weather.location;

  // Auto-detect location if enabled and no location set
  if (currentSettings.weather.autoDetectLocation && !location) {
    const detected = get(detectedLocation);
    if (detected) {
      location = detected;
    } else {
      weatherLoading.set(true);
      try {
        const newLocation = await detectLocation();
        if (newLocation) {
          detectedLocation.set(newLocation);
          location = newLocation;
        }
      } catch (error) {
        console.error('Location detection failed:', error);
      }
      weatherLoading.set(false);
    }
  }

  if (!location) {
    weatherError.set('No location configured');
    return;
  }

  const apiKey = currentSettings.weather.apiKey;
  if (!apiKey) {
    weatherError.set('Weather API key not configured');
    return;
  }

  // Check cache
  const fetchKey = `${apiKey}:${location}`;
  const now = Date.now();
  if (fetchKey === lastFetchKey && now - lastFetchTime < CACHE_DURATION_MS) {
    return; // Use cached data
  }

  weatherLoading.set(true);
  weatherError.set(null);

  try {
    const context = await fetchJournalContext(apiKey, location);
    if (context) {
      journalContext.set(context);
      currentWeather.set(context.weather || null);
      lastFetchKey = fetchKey;
      lastFetchTime = now;
    } else {
      weatherError.set('Failed to fetch weather data');
    }
  } catch (error) {
    weatherError.set(String(error));
  } finally {
    weatherLoading.set(false);
  }
}

/**
 * Force refresh weather, bypassing cache
 */
export async function forceRefreshWeather(): Promise<void> {
  lastFetchKey = '';
  lastFetchTime = 0;
  await refreshWeather();
}

/**
 * Initialize weather on app start
 */
export async function initializeWeather(): Promise<void> {
  const currentSettings = get(settings);

  if (currentSettings.weather.enabled) {
    // Auto-detect location if needed
    if (currentSettings.weather.autoDetectLocation && !currentSettings.weather.location) {
      try {
        const location = await detectLocation();
        if (location) {
          detectedLocation.set(location);
        }
      } catch (error) {
        console.error('Failed to detect location:', error);
      }
    }

    // Initial weather fetch
    await refreshWeather();
  }
}

// Derived store for display-ready weather
export const weatherDisplay = derived(
  [currentWeather, settings],
  ([$weather, $settings]) => {
    if (!$weather) return null;

    const unit = $settings.weather.temperatureUnit;
    return {
      ...$weather,
      displayTemp:
        unit === 'fahrenheit'
          ? `${Math.round($weather.tempFahrenheit)}°F`
          : `${Math.round($weather.tempCelsius)}°C`,
      displayFeelsLike:
        unit === 'fahrenheit'
          ? `${Math.round($weather.feelsLikeFahrenheit)}°F`
          : `${Math.round($weather.feelsLikeCelsius)}°C`,
    };
  }
);

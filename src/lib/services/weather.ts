import { invoke } from '@tauri-apps/api/core';
import type { WeatherData, JournalContext } from '../types';

/**
 * Fetch current weather data for a location
 */
export async function fetchWeather(apiKey: string, location: string): Promise<WeatherData | null> {
  try {
    return await invoke<WeatherData>('get_weather', { apiKey, location });
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    return null;
  }
}

/**
 * Auto-detect user location from IP address
 */
export async function detectLocation(): Promise<string | null> {
  try {
    return await invoke<string>('detect_location');
  } catch (error) {
    console.error('Failed to detect location:', error);
    return null;
  }
}

/**
 * Get full journal context including weather and time info
 */
export async function fetchJournalContext(
  apiKey: string,
  location: string
): Promise<JournalContext | null> {
  try {
    return await invoke<JournalContext>('get_journal_context', { apiKey, location });
  } catch (error) {
    console.error('Failed to fetch journal context:', error);
    return null;
  }
}

/**
 * Get weather icon based on condition
 */
export function getWeatherIcon(condition: string, isDay: boolean = true): string {
  const icons: Record<string, string> = {
    clear: isDay ? '☀️' : '🌙',
    partly_cloudy: isDay ? '⛅' : '☁️',
    cloudy: '☁️',
    overcast: '☁️',
    mist: '🌫️',
    fog: '🌫️',
    drizzle: '🌧️',
    rain: '🌧️',
    snow: '❄️',
    thunderstorm: '⛈️',
    unknown: '🌡️',
  };
  return icons[condition] || icons.unknown;
}

/**
 * Get time of day icon
 */
export function getTimeOfDayIcon(timeOfDay: string): string {
  const icons: Record<string, string> = {
    morning: '🌅',
    afternoon: '☀️',
    evening: '🌆',
    night: '🌙',
  };
  return icons[timeOfDay] || '🕐';
}

/**
 * Get moon phase icon
 */
export function getMoonPhaseIcon(moonPhase: string): string {
  const icons: Record<string, string> = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };
  return icons[moonPhase] || '🌙';
}

/**
 * Format temperature with unit
 */
export function formatTemperature(
  tempCelsius: number,
  tempFahrenheit: number,
  unit: 'celsius' | 'fahrenheit'
): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(tempFahrenheit)}°F`;
  }
  return `${Math.round(tempCelsius)}°C`;
}

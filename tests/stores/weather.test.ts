import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  currentWeather,
  journalContext,
  weatherLoading,
  weatherError,
  detectedLocation,
  refreshWeather,
  forceRefreshWeather,
} from '../../src/lib/stores/weather';
import { settings } from '../../src/lib/stores/settings';
import type { WeatherData, JournalContext as JournalContextType } from '../../src/lib/types';
import { invoke } from '@tauri-apps/api/core';

// Mock is set up in setup.ts
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('Weather Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset stores to initial state
    currentWeather.set(null);
    journalContext.set(null);
    weatherLoading.set(false);
    weatherError.set(null);
    detectedLocation.set(null);
  });

  describe('currentWeather', () => {
    it('should initialize as null', () => {
      expect(get(currentWeather)).toBeNull();
    });

    it('should be settable', () => {
      const mockWeather: WeatherData = {
        location: 'Test City',
        tempCelsius: 20,
        tempFahrenheit: 68,
        feelsLikeCelsius: 18,
        feelsLikeFahrenheit: 64,
        condition: 'clear',
        conditionText: 'Sunny',
        humidity: 50,
        windKph: 10,
        windMph: 6,
        windDirection: 'N',
        pressure: 1013,
        uvIndex: 5,
        visibility: 10,
        isDay: true,
        timestamp: new Date().toISOString(),
      };

      currentWeather.set(mockWeather);
      expect(get(currentWeather)).toEqual(mockWeather);
    });
  });

  describe('journalContext', () => {
    it('should initialize as null', () => {
      expect(get(journalContext)).toBeNull();
    });

    it('should be settable', () => {
      const mockContext: JournalContextType = {
        dayOfWeek: 'Monday',
        timeOfDay: 'morning',
        moonPhase: 'Full Moon',
      };

      journalContext.set(mockContext);
      expect(get(journalContext)).toEqual(mockContext);
    });
  });

  describe('weatherLoading', () => {
    it('should initialize as false', () => {
      expect(get(weatherLoading)).toBe(false);
    });
  });

  describe('weatherError', () => {
    it('should initialize as null', () => {
      expect(get(weatherError)).toBeNull();
    });
  });

  describe('detectedLocation', () => {
    it('should initialize as null', () => {
      expect(get(detectedLocation)).toBeNull();
    });

    it('should store detected location', () => {
      detectedLocation.set('New York, USA');
      expect(get(detectedLocation)).toBe('New York, USA');
    });
  });
});

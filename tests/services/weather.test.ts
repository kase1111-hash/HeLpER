import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import {
  fetchWeather,
  detectLocation,
  fetchJournalContext,
  getWeatherIcon,
  getTimeOfDayIcon,
  getMoonPhaseIcon,
  formatTemperature,
} from '../../src/lib/services/weather';
import type { WeatherData, JournalContext } from '../../src/lib/types';

// Mock is set up in setup.ts
const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe('Weather Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // API functions
  describe('fetchWeather', () => {
    it('should fetch weather data successfully', async () => {
      const mockWeather: WeatherData = {
        location: 'New York, USA',
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
        timestamp: '2025-01-27T10:00:00Z',
      };

      mockInvoke.mockResolvedValueOnce(mockWeather);

      const result = await fetchWeather('api-key', 'New York');

      expect(mockInvoke).toHaveBeenCalledWith('get_weather', {
        apiKey: 'api-key',
        location: 'New York',
      });
      expect(result).toEqual(mockWeather);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('API error'));

      const result = await fetchWeather('api-key', 'Invalid');
      expect(result).toBeNull();
    });
  });

  describe('detectLocation', () => {
    it('should detect location successfully', async () => {
      mockInvoke.mockResolvedValueOnce('New York, USA');

      const result = await detectLocation();

      expect(mockInvoke).toHaveBeenCalledWith('detect_location');
      expect(result).toBe('New York, USA');
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Detection failed'));

      const result = await detectLocation();
      expect(result).toBeNull();
    });
  });

  describe('fetchJournalContext', () => {
    it('should fetch journal context successfully', async () => {
      const mockContext: JournalContext = {
        weather: {
          location: 'New York, USA',
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
          timestamp: '2025-01-27T10:00:00Z',
        },
        dayOfWeek: 'Monday',
        timeOfDay: 'morning',
        moonPhase: 'Full Moon',
      };

      mockInvoke.mockResolvedValueOnce(mockContext);

      const result = await fetchJournalContext('api-key', 'New York');

      expect(mockInvoke).toHaveBeenCalledWith('get_journal_context', {
        apiKey: 'api-key',
        location: 'New York',
      });
      expect(result).toEqual(mockContext);
    });

    it('should return null on error', async () => {
      mockInvoke.mockRejectedValueOnce(new Error('Context fetch failed'));

      const result = await fetchJournalContext('api-key', 'Invalid');
      expect(result).toBeNull();
    });
  });

  // Utility functions
  describe('getWeatherIcon', () => {
    it('should return correct day icons', () => {
      expect(getWeatherIcon('clear', true)).toBe('☀️');
      expect(getWeatherIcon('partly_cloudy', true)).toBe('⛅');
      expect(getWeatherIcon('cloudy', true)).toBe('☁️');
      expect(getWeatherIcon('rain', true)).toBe('🌧️');
      expect(getWeatherIcon('snow', true)).toBe('❄️');
      expect(getWeatherIcon('thunderstorm', true)).toBe('⛈️');
      expect(getWeatherIcon('fog', true)).toBe('🌫️');
    });

    it('should return correct night icons', () => {
      expect(getWeatherIcon('clear', false)).toBe('🌙');
      expect(getWeatherIcon('partly_cloudy', false)).toBe('☁️');
    });

    it('should return default icon for unknown conditions', () => {
      expect(getWeatherIcon('invalid')).toBe('🌡️');
    });
  });

  describe('getTimeOfDayIcon', () => {
    it('should return correct icons', () => {
      expect(getTimeOfDayIcon('morning')).toBe('🌅');
      expect(getTimeOfDayIcon('afternoon')).toBe('☀️');
      expect(getTimeOfDayIcon('evening')).toBe('🌆');
      expect(getTimeOfDayIcon('night')).toBe('🌙');
    });

    it('should return default icon for unknown time', () => {
      expect(getTimeOfDayIcon('invalid')).toBe('🕐');
    });
  });

  describe('getMoonPhaseIcon', () => {
    it('should return correct icons', () => {
      expect(getMoonPhaseIcon('New Moon')).toBe('🌑');
      expect(getMoonPhaseIcon('Waxing Crescent')).toBe('🌒');
      expect(getMoonPhaseIcon('First Quarter')).toBe('🌓');
      expect(getMoonPhaseIcon('Waxing Gibbous')).toBe('🌔');
      expect(getMoonPhaseIcon('Full Moon')).toBe('🌕');
      expect(getMoonPhaseIcon('Waning Gibbous')).toBe('🌖');
      expect(getMoonPhaseIcon('Last Quarter')).toBe('🌗');
      expect(getMoonPhaseIcon('Waning Crescent')).toBe('🌘');
    });

    it('should return default icon for unknown phase', () => {
      expect(getMoonPhaseIcon('invalid')).toBe('🌙');
    });
  });

  describe('formatTemperature', () => {
    it('should format celsius correctly', () => {
      expect(formatTemperature(20.5, 68.9, 'celsius')).toBe('21°C');
      expect(formatTemperature(-5.2, 22.6, 'celsius')).toBe('-5°C');
    });

    it('should format fahrenheit correctly', () => {
      expect(formatTemperature(20.5, 68.9, 'fahrenheit')).toBe('69°F');
      expect(formatTemperature(-5.2, 22.6, 'fahrenheit')).toBe('23°F');
    });
  });
});

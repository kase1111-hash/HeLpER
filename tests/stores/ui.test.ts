import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
  settingsOpen,
  calendarOpen,
  showFirstRun,
  toasts,
  showToast,
  dismissToast,
  toggleSettings,
  toggleCalendar,
  closeAllPanels,
} from '../../src/lib/stores/ui';

describe('UI Store', () => {
  beforeEach(() => {
    settingsOpen.set(false);
    calendarOpen.set(false);
    showFirstRun.set(false);
    toasts.set([]);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Spec: Settings panel visibility
  describe('settingsOpen', () => {
    it('should default to closed', () => {
      expect(get(settingsOpen)).toBe(false);
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings panel', () => {
      expect(get(settingsOpen)).toBe(false);
      toggleSettings();
      expect(get(settingsOpen)).toBe(true);
      toggleSettings();
      expect(get(settingsOpen)).toBe(false);
    });
  });

  // Spec: Calendar picker visibility
  describe('calendarOpen', () => {
    it('should default to closed', () => {
      expect(get(calendarOpen)).toBe(false);
    });
  });

  describe('toggleCalendar', () => {
    it('should toggle calendar panel', () => {
      expect(get(calendarOpen)).toBe(false);
      toggleCalendar();
      expect(get(calendarOpen)).toBe(true);
      toggleCalendar();
      expect(get(calendarOpen)).toBe(false);
    });
  });

  describe('closeAllPanels', () => {
    it('should close all panels', () => {
      settingsOpen.set(true);
      calendarOpen.set(true);

      closeAllPanels();

      expect(get(settingsOpen)).toBe(false);
      expect(get(calendarOpen)).toBe(false);
    });
  });

  // Spec: First run experience
  describe('showFirstRun', () => {
    it('should default to false', () => {
      expect(get(showFirstRun)).toBe(false);
    });

    it('should be settable', () => {
      showFirstRun.set(true);
      expect(get(showFirstRun)).toBe(true);
    });
  });

  // Spec: Toast notifications for errors
  describe('Toast Notifications', () => {
    describe('showToast', () => {
      it('should add a toast notification', () => {
        showToast({ type: 'info', message: 'Test message' });

        const t = get(toasts);
        expect(t).toHaveLength(1);
        expect(t[0].message).toBe('Test message');
        expect(t[0].type).toBe('info');
      });

      it('should generate unique IDs', () => {
        showToast({ type: 'info', message: 'First' });
        showToast({ type: 'info', message: 'Second' });

        const t = get(toasts);
        expect(t[0].id).not.toBe(t[1].id);
      });

      it('should support different toast types', () => {
        showToast({ type: 'error', message: 'Error' });
        showToast({ type: 'warning', message: 'Warning' });
        showToast({ type: 'success', message: 'Success' });
        showToast({ type: 'info', message: 'Info' });

        const t = get(toasts);
        expect(t.map((toast) => toast.type)).toEqual(['error', 'warning', 'success', 'info']);
      });

      it('should auto-dismiss after duration', () => {
        showToast({ type: 'info', message: 'Auto dismiss', duration: 3000 });

        expect(get(toasts)).toHaveLength(1);

        vi.advanceTimersByTime(3000);

        expect(get(toasts)).toHaveLength(0);
      });

      it('should not auto-dismiss with duration 0', () => {
        showToast({ type: 'info', message: 'Persistent', duration: 0 });

        vi.advanceTimersByTime(10000);

        expect(get(toasts)).toHaveLength(1);
      });
    });

    describe('dismissToast', () => {
      it('should remove a specific toast', () => {
        showToast({ type: 'info', message: 'First', duration: 0 });
        showToast({ type: 'info', message: 'Second', duration: 0 });

        const t = get(toasts);
        const firstId = t[0].id;

        dismissToast(firstId);

        const remaining = get(toasts);
        expect(remaining).toHaveLength(1);
        expect(remaining[0].message).toBe('Second');
      });
    });
  });
});

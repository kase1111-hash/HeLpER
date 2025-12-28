import { writable, derived } from 'svelte/store';
import { sttService, isSTTAvailable, type STTResult } from '../services/stt';

// STT availability
export const sttAvailable = writable<boolean>(isSTTAvailable());

// Current listening state
export const isListening = writable<boolean>(false);

// Current transcript (interim + final)
export const currentTranscript = writable<string>('');

// Final transcript only
export const finalTranscript = writable<string>('');

// STT error message
export const sttError = writable<string | null>(null);

// Target for STT input: 'chat' or 'note'
export const sttTarget = writable<'chat' | 'note' | null>(null);

// Derived: is STT active for chat
export const isChatSTTActive = derived(
  [isListening, sttTarget],
  ([$isListening, $sttTarget]) => $isListening && $sttTarget === 'chat'
);

// Derived: is STT active for note
export const isNoteSTTActive = derived(
  [isListening, sttTarget],
  ([$isListening, $sttTarget]) => $isListening && $sttTarget === 'note'
);

/**
 * Start speech-to-text recognition
 */
export function startSTT(
  target: 'chat' | 'note',
  onFinalResult?: (transcript: string) => void
): void {
  sttError.set(null);
  currentTranscript.set('');
  finalTranscript.set('');
  sttTarget.set(target);

  const success = sttService.start({
    continuous: true,
    interimResults: true,
    language: 'en-US',
    onStart: () => {
      isListening.set(true);
    },
    onResult: (result: STTResult) => {
      currentTranscript.set(result.transcript);
      if (result.isFinal) {
        finalTranscript.update((prev) => prev + result.transcript + ' ');
        onFinalResult?.(result.transcript);
      }
    },
    onError: (error: string) => {
      sttError.set(error);
      isListening.set(false);
      sttTarget.set(null);
    },
    onEnd: () => {
      isListening.set(false);
      sttTarget.set(null);
    },
  });

  if (!success) {
    isListening.set(false);
    sttTarget.set(null);
  }
}

/**
 * Stop speech-to-text recognition
 */
export function stopSTT(): void {
  sttService.stop();
  isListening.set(false);
  sttTarget.set(null);
}

/**
 * Toggle speech-to-text for a target
 */
export function toggleSTT(
  target: 'chat' | 'note',
  onFinalResult?: (transcript: string) => void
): void {
  if (sttService.getIsListening()) {
    stopSTT();
  } else {
    startSTT(target, onFinalResult);
  }
}

/**
 * Clear STT state
 */
export function clearSTT(): void {
  currentTranscript.set('');
  finalTranscript.set('');
  sttError.set(null);
}

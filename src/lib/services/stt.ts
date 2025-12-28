/**
 * Speech-to-Text Service using Web Speech API
 */

export interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (result: STTResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

// Check if Speech Recognition is available
export function isSTTAvailable(): boolean {
  return !!(
    window.SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private options: STTOptions = {};

  constructor() {
    this.initRecognition();
  }

  private initRecognition(): void {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not available');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const lastResult = event.results[event.results.length - 1];
      const result: STTResult = {
        transcript: lastResult[0].transcript,
        isFinal: lastResult.isFinal,
        confidence: lastResult[0].confidence,
      };
      this.options.onResult?.(result);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'network':
          errorMessage = 'Network error occurred';
          break;
        case 'aborted':
          errorMessage = 'Recording aborted';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      this.options.onError?.(errorMessage);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.options.onEnd?.();
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.options.onStart?.();
    };
  }

  start(options: STTOptions = {}): boolean {
    if (!this.recognition) {
      options.onError?.('Speech recognition not available');
      return false;
    }

    if (this.isListening) {
      return true;
    }

    this.options = options;

    if (options.language) {
      this.recognition.lang = options.language;
    }
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      options.onError?.('Failed to start speech recognition');
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Singleton instance
export const sttService = new SpeechToTextService();

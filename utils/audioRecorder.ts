/**
 * Audio Recorder Utility for Akshara Speech Recognition
 * Uses Web Audio API to capture audio at 16kHz for the CNN-CTC model
 */

export interface AudioRecorderOptions {
  sampleRate?: number;
  onDataAvailable?: (audioData: Float32Array) => void;
  onSilenceDetected?: () => void;
  silenceThreshold?: number;
  silenceDuration?: number;
}

export interface RecognitionResult {
  success: boolean;
  letter: string;
  phonemes: string[];
  confidence: number;
  debug?: Record<string, unknown>;
}

const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_SILENCE_THRESHOLD = 0.02;
const DEFAULT_SILENCE_DURATION = 1500; // 1.5 seconds of silence

export class AudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioChunks: Float32Array[] = [];
  private isRecording = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastSoundTime = 0;
  private options: AudioRecorderOptions;

  constructor(options: AudioRecorderOptions = {}) {
    this.options = {
      sampleRate: options.sampleRate || DEFAULT_SAMPLE_RATE,
      silenceThreshold: options.silenceThreshold || DEFAULT_SILENCE_THRESHOLD,
      silenceDuration: options.silenceDuration || DEFAULT_SILENCE_DURATION,
      onDataAvailable: options.onDataAvailable,
      onSilenceDetected: options.onSilenceDetected,
    };
  }

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.options.sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: this.options.sampleRate,
      });

      // Create source from media stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Create processor node for capturing audio data
      const bufferSize = 4096;
      this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      // Reset state
      this.audioChunks = [];
      this.isRecording = true;
      this.lastSoundTime = Date.now();

      // Process audio data
      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputData = event.inputBuffer.getChannelData(0);
        const audioData = new Float32Array(inputData);

        // Store chunk
        this.audioChunks.push(audioData);

        // Check for sound level
        const maxLevel = this.getMaxLevel(audioData);

        if (maxLevel > this.options.silenceThreshold!) {
          this.lastSoundTime = Date.now();

          // Clear any existing silence timer
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else {
          // Check for silence duration
          const silenceDuration = Date.now() - this.lastSoundTime;

          if (silenceDuration >= this.options.silenceDuration! && !this.silenceTimer) {
            this.silenceTimer = setTimeout(() => {
              if (this.options.onSilenceDetected) {
                this.options.onSilenceDetected();
              }
            }, 100);
          }
        }

        // Callback with data
        if (this.options.onDataAvailable) {
          this.options.onDataAvailable(audioData);
        }
      };

      // Connect nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      console.log('Audio recording started at', this.audioContext.sampleRate, 'Hz');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  stop(): Float32Array {
    this.isRecording = false;

    // Clear silence timer
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // Disconnect and cleanup
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Combine all audio chunks into a single array
    const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = new Float32Array(totalLength);

    let offset = 0;
    for (const chunk of this.audioChunks) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }

    console.log('Audio recording stopped. Total samples:', totalLength);

    return combinedAudio;
  }

  private getMaxLevel(audioData: Float32Array): number {
    let max = 0;
    for (let i = 0; i < audioData.length; i++) {
      const absValue = Math.abs(audioData[i]);
      if (absValue > max) {
        max = absValue;
      }
    }
    return max;
  }

  isActive(): boolean {
    return this.isRecording;
  }
}

/**
 * Send audio to the recognition backend via Next.js API route
 * (This avoids CORS issues and works in local + Vercel)
 */
export async function recognizeLetter(audioData: Float32Array): Promise<RecognitionResult> {
  try {
    const response = await fetch('/api/recognize-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio: Array.from(audioData),
        sampleRate: DEFAULT_SAMPLE_RATE,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Recognition failed: ${error}`);
    }

    const result = await response.json();
    return result as RecognitionResult;
  } catch (error) {
    console.error('Error calling recognition API:', error);
    return {
      success: false,
      letter: '?',
      phonemes: [],
      confidence: 0,
      debug: { error: String(error) },
    };
  }
}

/**
 * Simple hook-like function to record audio and get recognition result
 */
export async function recordAndRecognize(
  durationMs: number = 3000,
  onProgress?: (elapsed: number, total: number) => void
): Promise<RecognitionResult> {
  const recorder = new AudioRecorder();

  await recorder.start();

  // Wait for the specified duration with progress updates
  const startTime = Date.now();
  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (onProgress) {
        onProgress(elapsed, durationMs);
      }
      if (elapsed >= durationMs) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });

  const audioData = recorder.stop();

  // Send to recognition API
  return recognizeLetter(audioData);
}

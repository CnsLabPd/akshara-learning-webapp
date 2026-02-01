'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { AudioRecorder, recognizeLetter, RecognitionResult } from '@/utils/audioRecorder';

const ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function ReadingPracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [recognizedLetter, setRecognizedLetter] = useState<string>('');
  const [phonemes, setPhonemes] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [recordingProgress, setRecordingProgress] = useState(0);

  const recorderRef = useRef<AudioRecorder | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentLetter = ALPHABETS[currentIndex];

  // ✅ Check if Speech backend is reachable via Next.js API proxy (works local + Vercel)
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/recognize-letter', { cache: 'no-store' }); // GET = health proxy
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    // Check every 5 seconds
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current?.isActive()) {
        recorderRef.current.stop();
      }
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || hasRecorded) return;

    setFeedback('');
    setRecognizedLetter('');
    setPhonemes([]);
    setConfidence(0);
    setRecordingProgress(0);

    try {
      recorderRef.current = new AudioRecorder({
        sampleRate: 16000,
        silenceThreshold: 0.02,
        silenceDuration: 1500,
      });

      await recorderRef.current.start();
      setIsRecording(true);

      // Progress animation
      const startTime = Date.now();
      const duration = 3000; // 3 seconds recording
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setRecordingProgress(progress);

        if (elapsed >= duration) {
          clearInterval(progressInterval);
        }
      }, 50);

      // Auto-stop after 3 seconds
      recordingTimeoutRef.current = setTimeout(async () => {
        clearInterval(progressInterval);
        await stopAndRecognize();
      }, duration);

    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback('Error accessing microphone. Please allow microphone access.');
      setIsRecording(false);
    }
  }, [isRecording, hasRecorded]);

  const stopAndRecognize = useCallback(async () => {
    if (!recorderRef.current) return;

    setIsRecording(false);
    setIsProcessing(true);
    setRecordingProgress(100);

    try {
      const audioData = recorderRef.current.stop();

      // Check if we have enough audio
      if (audioData.length < 1600) {
        setFeedback('Recording too short. Please try again and speak clearly.');
        setIsProcessing(false);
        return;
      }

      // Send to backend for recognition
      const result: RecognitionResult = await recognizeLetter(audioData);

      if (result.success && result.letter !== '?') {
        setRecognizedLetter(result.letter);
        setPhonemes(result.phonemes);
        setConfidence(result.confidence);
        setHasRecorded(true);

        console.log('Recognition result:', result);
      } else {
        setFeedback('Could not recognize speech. Please speak more clearly and try again.');
      }
    } catch (error) {
      console.error('Recognition error:', error);
      setFeedback('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSubmit = () => {
    if (!hasRecorded || !recognizedLetter) return;

    const isCorrect = recognizedLetter === currentLetter;

    if (isCorrect) {
      setScore(score + 1);
      setFeedback('Perfect! You said it correctly!');
      setShowCelebration(true);

      setTimeout(() => {
        setShowCelebration(false);
        if (currentIndex < ALPHABETS.length - 1) {
          setCurrentIndex(currentIndex + 1);
          resetState();
        }
      }, 2500);
    } else {
      setFeedback(`Try again! You said "${recognizedLetter}" but the letter is "${currentLetter}"`);
    }
  };

  const resetState = () => {
    setFeedback('');
    setHasRecorded(false);
    setRecognizedLetter('');
    setPhonemes([]);
    setConfidence(0);
    setRecordingProgress(0);
  };

  const playLetterSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentLetter);
      utterance.rate = 0.6;
      utterance.pitch = 1.2;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getPhoneticHint = (letter: string): string => {
    const hints: { [key: string]: string } = {
      'A': 'Ay', 'B': 'Bee', 'C': 'See', 'D': 'Dee', 'E': 'Ee',
      'F': 'Eff', 'G': 'Jee', 'H': 'Aitch', 'I': 'Eye', 'J': 'Jay',
      'K': 'Kay', 'L': 'Ell', 'M': 'Em', 'N': 'En', 'O': 'Oh',
      'P': 'Pee', 'Q': 'Cue', 'R': 'Ar', 'S': 'Ess', 'T': 'Tee',
      'U': 'You', 'V': 'Vee', 'W': 'Double-you', 'X': 'Ex', 'Y': 'Why', 'Z': 'Zee',
    };
    return hints[letter] || letter;
  };

  const nextLetter = () => {
    if (currentIndex < ALPHABETS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetState();
    }
  };

  const previousLetter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetState();
    }
  };

  // Backend offline message
  if (backendStatus === 'offline') {
    return (
      <main className="min-h-screen bg-warm-gradient p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link href="/choose-language?section=reading">
              <button className="px-6 py-3 bg-white text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                ← Back
              </button>
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Speech Recognition Server Offline
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              The AI model server is not running. Please start it first.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 text-left">
              <p className="font-mono text-sm text-gray-700 mb-2">To start the server:</p>
              <code className="block bg-gray-800 text-green-400 p-3 rounded text-sm">
                cd python_backend<br />
                pip install -r requirements.txt<br />
                python server.py
              </code>
            </div>
            <button
              onClick={() => setBackendStatus('checking')}
              className="mt-6 px-6 py-3 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (backendStatus === 'checking') {
    return (
      <main className="min-h-screen bg-warm-gradient p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-violet-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-slate-800">
            Connecting to AI Model...
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-gradient p-8 relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <div className="bg-white rounded-full p-8 shadow-2xl mb-6 inline-block">
              <svg className="w-32 h-32 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-2">Excellent!</h2>
            <p className="text-2xl text-emerald-300 font-semibold">Perfect Pronunciation!</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-violet-600 rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
          <button onClick={() => window.location.href = '/choose-language?section=reading&subsection=alphabets'} className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">← Back</button>
          <h1 className="text-3xl font-bold text-white">Reading Practice</h1>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-semibold">AI Active</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Progress:</span>
            <span className="text-lg font-bold text-slate-600">
              {currentIndex + 1} / {ALPHABETS.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Score:</span>
            <span className="text-2xl font-bold text-green-600">{score}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6">
          {/* Visual Letter Display */}
          <div className="text-center mb-6">
            <div className="bg-violet-50 rounded-2xl p-8 mb-4 border-2 border-violet-200">
              <div className="text-[12rem] font-bold text-violet-600 leading-none">{currentLetter}</div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-lg text-blue-700 font-semibold mb-2">
                🎯 Say the letter <strong>&quot;{currentLetter}&quot;</strong> clearly
              </p>
              <p className="text-sm text-blue-600">
                💡 Tip: Say it like <strong>&quot;{getPhoneticHint(currentLetter)}&quot;</strong> for better recognition
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            {/* Listen Button */}
            <button
              onClick={playLetterSound}
              disabled={isRecording || isProcessing}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">🔊</span>
              <span>Listen</span>
            </button>

            {/* Record Button */}
            <button
              onClick={startRecording}
              disabled={isRecording || isProcessing || hasRecorded}
              className={`px-6 py-3 ${
                isRecording
                  ? 'bg-red-500 animate-pulse'
                  : isProcessing
                  ? 'bg-yellow-500'
                  : hasRecorded
                  ? 'bg-green-500'
                  : 'bg-violet-600 hover:bg-violet-700'
              } text-white rounded-lg font-bold text-lg transition-colors shadow-md flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-75`}
            >
              <span className="text-2xl">🎤</span>
              <span>
                {isRecording ? 'Recording...' : isProcessing ? 'Processing...' : hasRecorded ? 'Recorded!' : 'Record'}
              </span>
            </button>
          </div>

          {/* Recording Progress Bar */}
          {(isRecording || isProcessing) && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${isProcessing ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${recordingProgress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 mt-1">
                {isRecording ? 'Speak now...' : 'Analyzing with AI...'}
              </p>
            </div>
          )}

          {/* Submit and Retry Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={handleSubmit}
              disabled={!hasRecorded || isRecording || isProcessing}
              className="px-8 py-3 bg-violet-600 text-white rounded-lg font-bold text-lg hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              Submit
            </button>
            <button
              onClick={resetState}
              disabled={isRecording || isProcessing}
              className="px-8 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold text-lg hover:bg-slate-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md"
            >
              🔄 Retry
            </button>
          </div>

          {feedback && (
            <div className={`text-center p-3 rounded-lg mb-3 ${
              feedback.includes('Perfect') || feedback.includes('correctly')
                ? 'bg-green-100 text-green-800'
                : feedback.includes('Try again') || feedback.includes('but the letter')
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              <p className="text-lg font-semibold">{feedback}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={previousLetter}
              disabled={currentIndex === 0 || isRecording || isProcessing}
              className="px-5 py-2 bg-gray-500 text-white rounded-lg font-semibold text-base hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={nextLetter}
              disabled={currentIndex === ALPHABETS.length - 1 || isRecording || isProcessing}
              className="px-5 py-2 bg-violet-600 text-white rounded-lg font-semibold text-base hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

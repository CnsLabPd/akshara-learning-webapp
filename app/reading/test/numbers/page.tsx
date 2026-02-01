'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';


const NUMBERS = '0123456789'.split('');

export default function SpeakingTestNumbersPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        console.log('Recognized speech:', transcript);
        setCurrentTranscript(transcript);
        setHasRecorded(true);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again!');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access.');
        } else {
          alert('Error occurred. Please try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const currentNumber = NUMBERS[currentIndex];

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const playNumberSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(getNumberWord(currentNumber));
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getNumberWord = (number: string): string => {
    const numberWords: { [key: string]: string } = {
      '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
      '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
    };
    return numberWords[number] || number;
  };

  const handleSubmit = () => {
    if (!hasRecorded || isProcessing) return;

    setIsProcessing(true);

    const cleanTranscript = currentTranscript.toLowerCase().trim();
    const numberWord = getNumberWord(currentNumber).toLowerCase();
    const isCorrect = cleanTranscript === currentNumber || cleanTranscript === numberWord || cleanTranscript.includes(numberWord);

    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers([...wrongAnswers, currentNumber]);
    }

    setTimeout(() => {
      if (currentIndex < NUMBERS.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setHasRecorded(false);
        setCurrentTranscript('');
        setIsProcessing(false);
      } else {
        const results = {
          score: isCorrect ? score + 1 : score,
          total: NUMBERS.length,
          wrongAnswers: isCorrect ? wrongAnswers : [...wrongAnswers, currentNumber],
        };
        localStorage.setItem('testResults', JSON.stringify(results));
        router.push('/results');
      }
    }, 1000);
  };

  if (!isSupported) {
    return (
      <main className="min-h-screen bg-warm-gradient p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-violet-600 rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
            <button onClick={() => window.location.href = '/choose-language?section=reading&subsection=numbers'} className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                ← Back
              </button>
            <h1 className="text-3xl font-bold text-white">Test Mode - Numbers</h1>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-semibold">AI Active</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Speech Recognition Not Supported
            </h2>
            <p className="text-lg text-slate-600">
              Your browser doesn&apos;t support speech recognition. Please try using Google Chrome or Microsoft Edge.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-gradient p-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-violet-600 rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
          <button onClick={() => window.location.href = '/choose-language?section=reading&subsection=numbers'} className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
              ← Back
            </button>
          <h1 className="text-3xl font-bold text-white">Test Mode - Numbers</h1>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-semibold">AI Active</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-slate-600 text-lg mb-1">Current Number</p>
              <p className="text-8xl font-bold text-amber-600">{currentNumber}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-slate-600 text-lg mb-1">Progress</p>
              <p className="text-4xl font-bold text-slate-600">
                {currentIndex + 1} / {NUMBERS.length}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-slate-600 text-lg mb-1">Score</p>
              <p className="text-6xl font-bold text-green-600">{score}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Say the number: <span className="text-amber-600">{currentNumber}</span>
            </h2>
            <p className="text-slate-600">Single attempt only! Listen, then record</p>
            <p className="text-sm text-amber-600 font-semibold mt-2">Say: &quot;{getNumberWord(currentNumber)}&quot;</p>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <button
              onClick={playNumberSound}
              disabled={isListening || hasRecorded}
              className="px-8 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-2xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-4xl">🔊</span>
              <span>Listen</span>
            </button>

            <button
              onClick={startListening}
              disabled={isListening || hasRecorded}
              className={`px-8 py-6 ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : hasRecorded
                  ? 'bg-green-500'
                  : 'bg-violet-600 hover:bg-violet-700'
              } text-white rounded-xl font-bold text-2xl transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 disabled:cursor-not-allowed disabled:opacity-75`}
            >
              <span className="text-4xl">🎤</span>
              <span>
                {isListening ? 'Listening...' : hasRecorded ? 'Recorded!' : 'Start Recording'}
              </span>
            </button>
          </div>

          {currentTranscript && (
            <div className="text-center mb-6 p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
              <p className="text-slate-600 text-sm mb-2 font-semibold">You said:</p>
              <p className="text-4xl font-bold text-violet-600">{currentTranscript}</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!hasRecorded || isProcessing}
              className="px-12 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-2xl disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isProcessing ? 'Processing...' : 'Submit Answer'}
            </button>
          </div>

          {isProcessing && (
            <div className="text-center mt-6">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600"></div>
              <p className="text-slate-600 mt-2">Checking your answer...</p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Test Rules:</h3>
          <ul className="list-disc list-inside space-y-2 text-slate-700 text-lg">
            <li>Say each number clearly</li>
            <li>Only ONE attempt per number</li>
            <li>Click Submit to move to the next</li>
            <li>Your score will be shown at the end</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

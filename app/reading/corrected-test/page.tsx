'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SpeakingCorrectedTestPage() {
  const router = useRouter();
  const [testLetters, setTestLetters] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef<boolean>(false);
  const isAutoSubmittingRef = useRef<boolean>(false);
  const restartTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Load the letters that need correction
    const storedLetters = localStorage.getItem('correctedTestLetters');
    if (storedLetters) {
      setTestLetters(JSON.parse(storedLetters));
    } else {
      router.push('/');
      return;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 5;

      recognition.onresult = (event: any) => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        let detectedTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];

          for (let j = 0; j < Math.min(result.length, 5); j++) {
            const transcript = result[j].transcript.toUpperCase().trim();

            if (transcript) {
              if (result.isFinal || result[j].confidence > 0.3) {
                detectedTranscript = transcript;
                setCurrentTranscript(transcript);

                silenceTimerRef.current = setTimeout(() => {
                  if (recognitionRef.current) {
                    try {
                      recognitionRef.current.stop();
                    } catch (e) {
                      // Already stopped
                    }
                    handleAutoSubmit(detectedTranscript);
                  }
                }, 2000);

                break;
              }
            }
          }
        }
      };

      recognition.onstart = () => {
        isRecognitionActiveRef.current = true;
        setIsListening(true);
        console.log('Speech recognition started');
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition event:', event.error);
        isRecognitionActiveRef.current = false;
        setIsListening(false);

        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Unexpected speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        isRecognitionActiveRef.current = false;
        setIsListening(false);
        console.log('Speech recognition ended');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [router]);

  const currentLetter = testLetters[currentIndex];

  const startListening = () => {
    console.log('startListening called - isActive:', isRecognitionActiveRef.current, 'isProcessing:', isProcessing);

    if (!recognitionRef.current || isProcessing || isAutoSubmittingRef.current) {
      console.log('Cannot start - processing or auto-submitting');
      return;
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (isRecognitionActiveRef.current) {
      console.log('Recognition already active - stopping first');
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.log('Stop error (safe):', e);
      }
      isRecognitionActiveRef.current = false;

      restartTimeoutRef.current = setTimeout(() => {
        console.log('Retrying start after stop');
        startListening();
      }, 300);
      return;
    }

    console.log('Starting new recognition session');
    setCurrentTranscript('');
    setShowFeedback(false);

    try {
      recognitionRef.current.start();

      silenceTimerRef.current = setTimeout(() => {
        console.log('Safety timeout triggered - no speech detected after 6s');
        if (recognitionRef.current && !isAutoSubmittingRef.current) {
          handleAutoSubmit('');
        }
      }, 6000);
    } catch (error: any) {
      console.error('Error starting recognition:', error.message);
      isRecognitionActiveRef.current = false;
      setIsListening(false);

      if (error.message && error.message.includes('already started')) {
        console.log('Already started error - will retry in 300ms');
        isRecognitionActiveRef.current = false;
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 300);
      }
    }
  };

  const playLetterSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentLetter);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAutoSubmit = (transcript: string) => {
    if (isAutoSubmittingRef.current) {
      console.log('Already auto-submitting - ignoring duplicate call');
      return;
    }

    isAutoSubmittingRef.current = true;
    setIsProcessing(true);

    if (recognitionRef.current) {
      try {
        if (isRecognitionActiveRef.current) {
          recognitionRef.current.stop();
        }
        isRecognitionActiveRef.current = false;
      } catch (e) {
        console.log('Stop error in handleAutoSubmit:', e);
      }
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    console.log('Auto-submit called with transcript:', transcript);
    console.log('Current letter:', currentLetter);

    const correct = checkLetterMatch(transcript, currentLetter);
    console.log('Answer is correct:', correct);

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(prevScore => prevScore + 1);
    } else {
      setWrongAnswers(prevWrong => [...prevWrong, currentLetter]);
    }

    setTimeout(() => {
      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        console.log('Moving from index', prevIndex, 'to', newIndex);

        if (newIndex < testLetters.length) {
          setCurrentTranscript('');
          setShowFeedback(false);
          setIsProcessing(false);
          isAutoSubmittingRef.current = false;

          return newIndex;
        } else {
          // Corrected test complete
          setScore(finalScore => {
            setWrongAnswers(finalWrongAnswers => {
              if (finalWrongAnswers.length > 0) {
                // Still have wrong answers - need another corrected test
                const results = {
                  score: finalScore,
                  total: testLetters.length,
                  wrongAnswers: finalWrongAnswers,
                  isCorrectedTest: true,
                  type: 'reading',
                };
                localStorage.setItem('testResults', JSON.stringify(results));
                localStorage.setItem('correctedTestLetters', JSON.stringify(finalWrongAnswers));
              } else {
                // All mastered!
                const results = {
                  score: finalScore,
                  total: testLetters.length,
                  wrongAnswers: [],
                  allMastered: true,
                  type: 'reading',
                };
                localStorage.setItem('testResults', JSON.stringify(results));
              }
              router.push('/results');
              return finalWrongAnswers;
            });
            return finalScore;
          });

          return prevIndex;
        }
      });
    }, 1500);
  };

  const checkLetterMatch = (transcript: string, expectedLetter: string): boolean => {
    const cleanTranscript = transcript.toUpperCase().trim();

    console.log('Checking match - Transcript:', cleanTranscript, 'Expected:', expectedLetter);

    // Direct letter match
    if (cleanTranscript === expectedLetter) {
      console.log('Direct letter match found!');
      return true;
    }

    // Get the associated word for this letter (e.g., 'A' → 'APPLE', 'B' → 'BALL')
    const association = getLetterAssociation(expectedLetter);
    const associatedWord = association.word.toUpperCase();

    // Check for "[LETTER] FOR [WORD]" pattern (e.g., "A FOR APPLE", "B FOR BALL")
    const forPatterns = [
      `${expectedLetter} FOR ${associatedWord}`,
      `${expectedLetter} 4 ${associatedWord}`, // Speech might recognize "for" as "4"
      `${expectedLetter}FOR${associatedWord}`, // Without spaces
    ];

    for (const pattern of forPatterns) {
      if (cleanTranscript.includes(pattern)) {
        console.log('Pattern match found:', pattern);
        return true;
      }
    }

    // Pronunciation variants (only multi-character pronunciations to avoid false positives)
    const pronunciationVariants: { [key: string]: string[] } = {
      'A': ['AY'], 'B': ['BEE'], 'C': ['SEE', 'CEE'],
      'D': ['DEE'], 'E': ['EE'], 'F': ['EFF', 'EF'],
      'G': ['GEE', 'JEE'], 'H': ['AITCH', 'EICH'], 'I': ['EYE', 'AI'],
      'J': ['JAY', 'JEY'], 'K': ['KAY', 'KEY'], 'L': ['ELL', 'EL'],
      'M': ['EM'], 'N': ['EN'], 'O': ['OH', 'OW'],
      'P': ['PEE', 'PE'], 'Q': ['CUE', 'KYU', 'KYOU'], 'R': ['ARE', 'AR'],
      'S': ['ESS', 'ES'], 'T': ['TEE', 'TE'], 'U': ['YOU', 'YU', 'YOO'],
      'V': ['VEE', 'VE'], 'W': ['DOUBLE YOU', 'DOUBLEYOU', 'DOUBLE U'],
      'X': ['EX', 'EKS'], 'Y': ['WHY', 'WYE'], 'Z': ['ZEE', 'ZED'],
    };

    const validPronunciations = pronunciationVariants[expectedLetter] || [];
    console.log('Valid pronunciations for', expectedLetter, ':', validPronunciations);

    // Check if any valid pronunciation appears as a complete word (not just a prefix)
    const found = validPronunciations.some(pronunciation => {
      // Exact match
      if (cleanTranscript === pronunciation) {
        console.log('Exact pronunciation match:', pronunciation);
        return true;
      }

      // Check if pronunciation appears as a complete word with word boundaries
      const words = cleanTranscript.split(/\s+/);
      if (words.includes(pronunciation)) {
        console.log('Word boundary match:', pronunciation);
        return true;
      }

      // Check with spaces around to ensure it's a separate word
      if (cleanTranscript.includes(' ' + pronunciation + ' ')) {
        console.log('Contained word match:', pronunciation);
        return true;
      }

      // Check if it starts or ends the transcript (with space)
      if (cleanTranscript.startsWith(pronunciation + ' ')) {
        console.log('Starts with match:', pronunciation);
        return true;
      }

      if (cleanTranscript.endsWith(' ' + pronunciation)) {
        console.log('Ends with match:', pronunciation);
        return true;
      }

      return false;
    });

    console.log('Match result:', found);
    return found;
  };

  const getLetterPronunciation = (letter: string): string => {
    const pronunciationMap: { [key: string]: string } = {
      'A': 'ay', 'B': 'bee', 'C': 'see', 'D': 'dee', 'E': 'ee',
      'F': 'ef', 'G': 'gee', 'H': 'aitch', 'I': 'eye', 'J': 'jay',
      'K': 'kay', 'L': 'el', 'M': 'em', 'N': 'en', 'O': 'oh',
      'P': 'pee', 'Q': 'cue', 'R': 'are', 'S': 'ess', 'T': 'tee',
      'U': 'you', 'V': 'vee', 'W': 'double-u', 'X': 'ex', 'Y': 'why', 'Z': 'zee'
    };
    return pronunciationMap[letter] || letter.toLowerCase();
  };

  const getLetterAssociation = (letter: string): { word: string; emoji: string } => {
    const associations: { [key: string]: { word: string; emoji: string } } = {
      'A': { word: 'Apple', emoji: '🍎' }, 'B': { word: 'Ball', emoji: '⚽' },
      'C': { word: 'Cat', emoji: '🐱' }, 'D': { word: 'Dog', emoji: '🐶' },
      'E': { word: 'Elephant', emoji: '🐘' }, 'F': { word: 'Fish', emoji: '🐠' },
      'G': { word: 'Grapes', emoji: '🍇' }, 'H': { word: 'House', emoji: '🏠' },
      'I': { word: 'Ice cream', emoji: '🍦' }, 'J': { word: 'Juice', emoji: '🧃' },
      'K': { word: 'Kite', emoji: '🪁' }, 'L': { word: 'Lion', emoji: '🦁' },
      'M': { word: 'Monkey', emoji: '🐵' }, 'N': { word: 'Nest', emoji: '🪹' },
      'O': { word: 'Orange', emoji: '🍊' }, 'P': { word: 'Penguin', emoji: '🐧' },
      'Q': { word: 'Queen', emoji: '👸' }, 'R': { word: 'Rabbit', emoji: '🐰' },
      'S': { word: 'Sun', emoji: '☀️' }, 'T': { word: 'Tiger', emoji: '🐯' },
      'U': { word: 'Umbrella', emoji: '☂️' }, 'V': { word: 'Van', emoji: '🚐' },
      'W': { word: 'Watch', emoji: '⌚' }, 'X': { word: 'Xylophone', emoji: '🎹' },
      'Y': { word: 'Yo-yo', emoji: '🪀' }, 'Z': { word: 'Zebra', emoji: '🦓' }
    };
    return associations[letter] || { word: letter, emoji: '📝' };
  };

  if (!isSupported) {
    return (
      <main className="min-h-screen bg-warm-gradient p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-500 rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
            <Link href="/results"><button className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">← Results</button></Link>
            <h1 className="text-3xl font-bold text-white">Corrected Speaking Test</h1>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-white text-sm font-semibold">AI Active</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
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

  if (testLetters.length === 0) {
    return (
      <main className="min-h-screen bg-warm-gradient p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          <div className="text-slate-600 text-2xl">Loading corrected test...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-warm-gradient p-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-500 rounded-2xl shadow-lg p-4 mb-4 flex justify-between items-center">
          <Link href="/results"><button className="px-5 py-2.5 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">← Results</button></Link>
          <h1 className="text-3xl font-bold text-white">Corrected Speaking Test</h1>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-white text-sm font-semibold">AI Active</span>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#FFB343' }}>Progress:</span>
            <span className="text-lg font-bold text-violet-600">
              {currentIndex + 1} / {testLetters.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: '#FFB343' }}>Score:</span>
            <span className="text-2xl font-bold text-green-600">{score}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-6">
          {/* Visual Letter Display with Association */}
          <div className="text-center mb-6">
            <div className="bg-slate-50 rounded-xl p-6 mb-4 border-2 border-slate-200">
              <div className="flex items-center justify-center gap-6">
                {/* Large Letter */}
                <div className="text-9xl font-bold text-violet-600">{currentLetter}</div>

                {/* Visual Association */}
                <div className="text-center">
                  <div className="text-7xl mb-2">{getLetterAssociation(currentLetter).emoji}</div>
                  <p className="text-2xl font-bold text-gray-700">
                    {currentLetter} for {getLetterAssociation(currentLetter).word}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-violet-50 rounded-lg p-3 border-2 border-violet-200">
              <p className="text-sm text-violet-700 font-semibold">
                🎯 Say <strong>&quot;{getLetterPronunciation(currentLetter)}&quot;</strong> or <strong>&quot;{currentLetter} for {getLetterAssociation(currentLetter).word}&quot;</strong>, then pause. Auto-submits after 2 seconds!
              </p>
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={playLetterSound}
              disabled={isListening || isProcessing}
              className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold text-lg hover:bg-slate-300 transition-all transform hover:scale-105 shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-2xl">🔊</span>
              <span>Listen</span>
            </button>

            <button
              onClick={startListening}
              disabled={isListening || isProcessing}
              className={`px-6 py-3 ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-violet-600 hover:bg-violet-700'
              } text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-md flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-75`}
            >
              <span className="text-2xl">🎤</span>
              <span>
                {isListening ? 'Listening...' : 'Start Recording'}
              </span>
            </button>
          </div>

          {/* Show what user said */}
          {currentTranscript && (
            <div className="text-center mb-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <p className="text-slate-600 text-xs mb-1 font-semibold">You said:</p>
              <p className="text-2xl font-bold text-violet-600">{currentTranscript}</p>
            </div>
          )}

          {/* Auto-Processing Indicator */}
          {isProcessing && (
            <div className="text-center mb-4">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
              <p className="text-slate-600 mt-2 text-sm">Auto-checking your answer...</p>
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <div className={`text-center p-3 rounded-lg mb-3 ${
              isCorrect
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="text-lg font-semibold">
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </p>
            </div>
          )}
        </div>

        
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas';
import KeyboardDrawingTutorial from '@/components/KeyboardDrawingTutorial';
import { characterRecognizer } from '@/utils/tensorflowModel';
import { isDesktopDevice } from '@/utils/deviceDetection';
import { useKeyboardDrawing } from '@/hooks/useKeyboardDrawing';

const NUMBERS = '0123456789'.split('');

export default function TestNumbersPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<string[]>([]);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showIncorrect, setShowIncorrect] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string>('');
  const canvasRef = useRef<DrawingCanvasRef>(null);

  // Keyboard drawing mode states
  const [isDesktop, setIsDesktop] = useState(false);
  const [keyboardDrawingEnabled, setKeyboardDrawingEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { isWKeyPressed } = useKeyboardDrawing();

  useEffect(() => {
    const initModel = async () => {
      try {
        await characterRecognizer.loadModel();
        setModelReady(true);
        console.log('TensorFlow.js model loaded for numbers test');
      } catch (error) {
        console.error('Error loading TensorFlow.js model:', error);
        setModelError('Failed to load AI model. Please refresh the page.');
      }
    };

    initModel();

    return () => {
      characterRecognizer.dispose();
    };
  }, []);

  // Detect device type and load settings
  useEffect(() => {
    setIsDesktop(isDesktopDevice());

    // Load keyboard drawing setting from localStorage
    const savedSetting = localStorage.getItem('keyboardDrawingEnabled');
    if (savedSetting === 'true') {
      setKeyboardDrawingEnabled(true);
    }
  }, []);

  // Handle keyboard drawing toggle
  const handleKeyboardDrawingToggle = (enabled: boolean) => {
    setKeyboardDrawingEnabled(enabled);
    localStorage.setItem('keyboardDrawingEnabled', enabled.toString());

    // Show tutorial on first enable
    if (enabled) {
      const tutorialSeen = localStorage.getItem('keyboardDrawingTutorialSeen');
      if (!tutorialSeen) {
        setShowTutorial(true);
      }
    }
  };

  const currentNumber = NUMBERS[currentIndex];

  const handleDrawingComplete = (canvas: HTMLCanvasElement) => {
    setCurrentDrawing(canvas.toDataURL('image/png'));
    setHasDrawn(true);
  };

  const handleSubmit = async () => {
    if (!hasDrawn || !modelReady || isProcessing) return;

    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }

    setIsProcessing(true);

    try {
      // Use TensorFlow.js for character recognition
      const result = await characterRecognizer.recognizeCharacter(canvas);

      console.log('TensorFlow.js Results:');
      console.log('- Recognized character:', result.letter);
      console.log('- Confidence:', result.confidence);
      console.log('- Expected number:', currentNumber);

      // Custom number matching logic with specific confidence thresholds (same as practice)
      const customNumberMatch = (recognized: string, expected: string, confidence: number): boolean => {
        // Direct number match - always accept with standard confidence
        if (recognized === expected && confidence >= characterRecognizer.getConfidenceThreshold(result.letter)) {
          return true;
        }

        // Custom mappings with specific confidence requirements
        const customMappings: { [key: string]: { numbers: string[], minConfidence: number } } = {
          'B': { numbers: ['3', '8'], minConfidence: 0.5 }, // Standard confidence for B→3, B→8
          'A': { numbers: ['4'], minConfidence: 0.3 },      // 30% confidence for A→4
          't': { numbers: ['4', '7'], minConfidence: 0.3 }, // 30% confidence for t→4, t→7
          'T': { numbers: ['7'], minConfidence: 0.7 },      // 70% confidence for T→7
          'b': { numbers: ['6'], minConfidence: 0.5 },      // Standard confidence for b→6
          // Keep existing mappings
          'O': { numbers: ['0'], minConfidence: 0.5 }, 'o': { numbers: ['0'], minConfidence: 0.5 },
          'I': { numbers: ['1'], minConfidence: 0.5 }, 'i': { numbers: ['1'], minConfidence: 0.5 }, 'l': { numbers: ['1'], minConfidence: 0.5 },
          'Z': { numbers: ['2'], minConfidence: 0.5 }, 'z': { numbers: ['2'], minConfidence: 0.5 },
          'S': { numbers: ['5'], minConfidence: 0.5 }, 's': { numbers: ['5'], minConfidence: 0.5 },
          'G': { numbers: ['6'], minConfidence: 0.5 }, 'g': { numbers: ['6'], minConfidence: 0.5 },
          'q': { numbers: ['9'], minConfidence: 0.5 }
        };

        const mapping = customMappings[recognized];
        return mapping && mapping.numbers.includes(expected) && confidence >= mapping.minConfidence;
      };

      const isCorrect = customNumberMatch(result.letter, currentNumber, result.confidence);

      if (isCorrect) {
        setScore(score + 1);
        setShowCelebration(true);

        // Show celebration for 2 seconds before moving to next
        setTimeout(() => {
          setShowCelebration(false);

          if (currentIndex < NUMBERS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setHasDrawn(false);
            setCurrentDrawing('');
            canvasRef.current?.clear();
            setIsProcessing(false);
          } else {
            // Test complete - navigate to results
            const results = {
              score: score + 1,
              total: NUMBERS.length,
              wrongAnswers: wrongAnswers,
              type: 'writing' as const,
              subtype: 'numbers' as const,
            };
            localStorage.setItem('testResults', JSON.stringify(results));
            router.push('/results');
          }
        }, 2500);
      } else {
        setWrongAnswers([...wrongAnswers, currentNumber]);
        setShowIncorrect(true);

        // Move to next number or finish test
        if (currentIndex < NUMBERS.length - 1) {
          setTimeout(() => {
            setShowIncorrect(false);
            setCurrentIndex(currentIndex + 1);
            setHasDrawn(false);
            setCurrentDrawing('');
            canvasRef.current?.clear();
            setIsProcessing(false);
          }, 2000);
        } else {
          // Test complete - show incorrect feedback then navigate to results
          setTimeout(() => {
            setShowIncorrect(false);
            const results = {
              score: score,
              total: NUMBERS.length,
              wrongAnswers: [...wrongAnswers, currentNumber],
              type: 'writing' as const,
              subtype: 'numbers' as const,
            };
            localStorage.setItem('testResults', JSON.stringify(results));
            router.push('/results');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('TensorFlow.js Recognition Error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <main className="h-screen bg-warm-gradient flex flex-col overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <div className="bg-white rounded-full p-8 shadow-2xl mb-6 inline-block">
              <svg className="w-32 h-32 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw 0.5s ease-in-out forwards' }} />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-2">Excellent!</h2>
            <p className="text-2xl text-emerald-300 font-semibold">Perfect Writing!</p>
          </div>
        </div>
      )}

      {/* Incorrect Answer Overlay */}
      {showIncorrect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="text-center">
            <div className="bg-white rounded-full p-8 shadow-2xl mb-6 inline-block">
              <svg className="w-32 h-32 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'draw 0.5s ease-in-out forwards' }} />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-2">Oops!</h2>
            <p className="text-2xl text-rose-300 font-semibold">Try the next one!</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full px-4 pt-3 flex-1 flex flex-col overflow-hidden">
        <div className="bg-amber-500 rounded-2xl shadow-lg p-3 mb-2 flex justify-between items-center flex-shrink-0">
          <button onClick={() => router.push('/choose-language?section=writing&subsection=numbers')} className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-white">Test Mode - Numbers</h1>
          <div className="w-20"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 flex-shrink-0">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / NUMBERS.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-3 mb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-sm mb-0.5" style={{ color: '#FFB343' }}>Current Number</p>
              <p className="text-5xl font-bold text-slate-600">{currentNumber}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm mb-0.5" style={{ color: '#FFB343' }}>Progress</p>
              <p className="text-2xl font-bold text-pink-600">
                {currentIndex + 1} / {NUMBERS.length}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-sm mb-0.5" style={{ color: '#FFB343' }}>Score</p>
              <p className="text-3xl font-bold text-green-600">
                {score}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-4 flex-1 flex flex-col overflow-hidden">
          {/* Settings Toggle - Desktop Only */}
          {isDesktop && (
            <div className="mb-2 pb-2 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">⌨️ Keyboard Drawing Mode</span>
                  <span className="text-xs" style={{ color: '#FFB343' }}>(Hold W to draw)</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keyboardDrawingEnabled}
                    onChange={(e) => handleKeyboardDrawingToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          <div className="text-center mb-2 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Write the number: <span className="text-slate-600">{currentNumber}</span>
            </h2>
            {modelError ? (
              <p className="text-red-600 text-sm">{modelError}</p>
            ) : modelReady ? (
              <p className="text-sm" style={{ color: '#FFB343' }}>Draw carefully - single attempt only!</p>
            ) : (
              <p className="text-amber-600 text-sm">Loading AI model...</p>
            )}
          </div>

          {/* Visual Indicator - Desktop Only */}
          {isDesktop && keyboardDrawingEnabled && (
            <div className="flex justify-center mb-2 flex-shrink-0">
              <div
                className={`px-4 py-1.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-200 ${
                  isWKeyPressed
                    ? 'bg-green-500 text-white animate-pulse'
                    : 'bg-yellow-400 text-gray-800'
                }`}
              >
                {isWKeyPressed ? '✏️ Drawing Enabled' : '🔓 Hold W to Draw'}
              </div>
            </div>
          )}

          <div className="flex justify-center mb-2 flex-shrink-0">
            <DrawingCanvas
              ref={canvasRef}
              onDrawingComplete={handleDrawingComplete}
              isEnabled={!isProcessing && modelReady && !modelError}
              keyboardDrawingEnabled={keyboardDrawingEnabled}
              isWKeyPressed={isWKeyPressed}
              width={550}
              height={420}
            />
          </div>

          <div className="text-center flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={!hasDrawn || isProcessing || !modelReady || !!modelError}
              className="px-8 py-2.5 bg-amber-500 text-white rounded-lg font-bold text-lg hover:bg-amber-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isProcessing ? 'AI Processing...' : 'Submit Answer'}
            </button>
          </div>

          {isProcessing && (
            <div className="text-center mt-2 flex-shrink-0">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-amber-600"></div>
              <p className="text-sm mt-1" style={{ color: '#FFB343' }}>Checking your answer...</p>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Drawing Tutorial Modal */}
      <KeyboardDrawingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </main>
  );
}

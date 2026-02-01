'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas';
import DrawingAnimation from '@/components/DrawingAnimation';
import KeyboardDrawingTutorial from '@/components/KeyboardDrawingTutorial';
import { characterRecognizer, isNumberMatch } from '@/utils/tensorflowModel';
import { isDesktopDevice } from '@/utils/deviceDetection';
import { useKeyboardDrawing } from '@/hooks/useKeyboardDrawing';

const NUMBERS = '0123456789'.split('');

export default function PracticeNumbersPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [recognizedOutput, setRecognizedOutput] = useState<string>('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
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
        console.log('TensorFlow.js model loaded for numbers practice');
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
      setFeedback('Error: Canvas not available');
      return;
    }

    setIsProcessing(true);
    setFeedback('Checking your drawing...');
    setRecognizedOutput('');

    try {
      // Use TensorFlow.js for character recognition
      const result = await characterRecognizer.recognizeCharacter(canvas);

      console.log('TensorFlow.js Results:');
      console.log('- Recognized character:', result.letter);
      console.log('- Confidence:', result.confidence);
      console.log('- Expected number:', currentNumber);

      // Show what the model recognized
      setRecognizedOutput(result.letter || '(nothing detected)');

      // Custom number matching logic with specific confidence thresholds
      const customNumberMatch = (recognized: string, expected: string, confidence: number): {
        isCorrect: boolean;
        feedback: string;
      } => {
        // Direct number match - always accept with standard confidence
        if (recognized === expected && confidence >= characterRecognizer.getConfidenceThreshold(result.letter)) {
          return {
            isCorrect: true,
            feedback: `Perfect! Correctly wrote ${expected}!`
          };
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
        if (mapping && mapping.numbers.includes(expected) && confidence >= mapping.minConfidence) {
          return {
            isCorrect: true,
            feedback: `Good! Recognized as ${recognized}, which looks like ${expected}!`
          };
        }

        // Check if recognized is another number
        if ('0123456789'.includes(recognized) && confidence >= characterRecognizer.getConfidenceThreshold(result.letter)) {
          return {
            isCorrect: false,
            feedback: `Try again! You wrote ${recognized}, but expected ${expected}`
          };
        }

        // Not recognized or low confidence
        return {
          isCorrect: false,
          feedback: `Try again! Draw the number ${expected}. AI saw: ${recognized}`
        };
      };

      const matchResult = customNumberMatch(result.letter, currentNumber, result.confidence);

      if (matchResult.isCorrect) {
        setScore(score + 1);
        setFeedback(matchResult.feedback);
        setShowCelebration(true);

        setTimeout(() => {
          setShowCelebration(false);
          if (currentIndex < NUMBERS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFeedback('');
            setRecognizedOutput('');
            setHasDrawn(false);
            setCurrentDrawing('');
            canvasRef.current?.clear();
          }
          setIsProcessing(false);
        }, 2500);
      } else {
        // Handle incorrect matches
        setFeedback(matchResult.feedback);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('TensorFlow.js Recognition Error:', error);
      setFeedback('Error processing your drawing. Please try again.');
      setRecognizedOutput('');
      setIsProcessing(false);
    }
  };

  const nextNumber = () => {
    if (currentIndex < NUMBERS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback('');
      setRecognizedOutput('');
      setHasDrawn(false);
      setCurrentDrawing('');
      canvasRef.current?.clear();
    }
  };

  const previousNumber = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFeedback('');
      setRecognizedOutput('');
      setHasDrawn(false);
      setCurrentDrawing('');
      canvasRef.current?.clear();
    }
  };

  const handleRetry = () => {
    setFeedback('');
    setRecognizedOutput('');
    setHasDrawn(false);
    setCurrentDrawing('');
    canvasRef.current?.clear();
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
            <h2 className="text-5xl font-bold text-white mb-2">Amazing!</h2>
            <p className="text-2xl text-emerald-300 font-semibold">You did it!</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto w-full px-4 pt-3 flex-1 flex flex-col overflow-hidden">
        <div className="bg-emerald-600 rounded-2xl shadow-lg p-3 mb-2 flex justify-between items-center flex-shrink-0">
          <button
            onClick={() => router.push('/choose-language?section=writing&subsection=numbers')}
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Practice Mode - Numbers</h1>
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
              <p className="text-gray-600 text-sm mb-0.5">Current Number</p>
              <p className="text-5xl font-bold text-emerald-600">{currentNumber}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm mb-0.5">Progress</p>
              <p className="text-2xl font-bold text-slate-600">
                {currentIndex + 1} / {NUMBERS.length}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm mb-0.5">Correct</p>
              <p className="text-3xl font-bold text-indigo-600">{score}</p>
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
                  <span className="text-xs text-gray-500">(Hold W to draw)</span>
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
              Practice writing: <span className="text-emerald-600">{currentNumber}</span>
            </h2>
            {modelError ? (
              <p className="text-red-600 text-sm">{modelError}</p>
            ) : modelReady ? (
              <p className="text-gray-600 text-sm">Draw the number, then click Submit</p>
            ) : (
              <p className="text-emerald-600 text-sm">Loading AI model...</p>
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
              height={280}
            />
          </div>

          <div className="flex justify-center gap-3 py-3 flex-shrink-0">
            <button
              onClick={() => setShowAnimation(true)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-base hover:bg-indigo-700 transition-colors shadow-lg"
            >
              👁️ Show me
            </button>
            <button
              onClick={() => canvasRef.current?.clear()}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-bold text-base hover:bg-slate-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              🧹 Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasDrawn || isProcessing || !modelReady || !!modelError}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-base hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isProcessing ? 'AI Analyzing...' : 'Submit'}
            </button>
          </div>

          {feedback && (
            <div className={`text-center p-2 rounded-lg mb-2 flex-shrink-0 ${
              feedback.includes('correct') || feedback.includes('Great')
                ? 'bg-green-100 text-green-800'
                : feedback.includes('Try again')
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              <p className="text-base font-semibold">{feedback}</p>
            </div>
          )}

          {recognizedOutput && (
            <div className="text-center p-2 rounded-lg mb-2 bg-purple-100 border-2 border-purple-300 flex-shrink-0">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Model Recognized:</span>{' '}
                <span className="text-lg font-bold text-purple-700">&quot;{recognizedOutput}&quot;</span>
                <span className="text-xs text-gray-600 ml-2">
                  Expected: <span className="font-semibold text-emerald-600">{currentNumber}</span>
                </span>
              </p>
            </div>
          )}

          {isProcessing && (
            <div className="text-center mt-2 flex-shrink-0">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-emerald-600"></div>
            </div>
          )}

          <div className="flex justify-center gap-3 mt-auto flex-shrink-0">
            <button
              onClick={previousNumber}
              disabled={currentIndex === 0}
              className="px-4 py-1.5 bg-gray-500 text-white rounded-lg font-bold text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={nextNumber}
              disabled={currentIndex === NUMBERS.length - 1}
              className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Drawing Animation Modal */}
      <DrawingAnimation
        character={currentNumber}
        isVisible={showAnimation}
        onClose={() => setShowAnimation(false)}
      />

      {/* Keyboard Drawing Tutorial Modal */}
      <KeyboardDrawingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </main>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas';
import DrawingAnimation from '@/components/DrawingAnimation';
import KeyboardDrawingTutorial from '@/components/KeyboardDrawingTutorial';
import { characterRecognizer, isCharacterMatch, isCharacterMatchDetailed, isCharacterMatchStrict } from '@/utils/tensorflowModel';
import { isDesktopDevice } from '@/utils/deviceDetection';
import { useKeyboardDrawing } from '@/hooks/useKeyboardDrawing';

const ENGLISH_ALPHABETS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const TAMIL_VOWELS = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'];

export default function PracticeClient() {
  const router = useRouter(); // Use router for navigation
  const searchParams = useSearchParams();
  const language = searchParams.get('lang') || 'en';
  const ALPHABETS = language === 'ta' ? TAMIL_VOWELS : ENGLISH_ALPHABETS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [recognizedOutput, setRecognizedOutput] = useState<string>('');
  const [preprocessedImageUrl, setPreprocessedImageUrl] = useState<string>('');
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
        setFeedback('Loading AI model...');
        await characterRecognizer.loadModel();
        setModelReady(true);
        setFeedback('');
        console.log('TensorFlow.js model loaded successfully');
      } catch (error) {
        console.error('Error loading TensorFlow.js model:', error);
        setModelError('Failed to load AI model. Please refresh the page.');
        setFeedback('');
      }
    };

    initModel();

    return () => {
      // Cleanup model resources when component unmounts
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

  const currentLetter = ALPHABETS[currentIndex];

  const handleDrawingComplete = (canvas: HTMLCanvasElement) => {
    setHasDrawn(true);
    // Store canvas reference for TensorFlow.js processing
    setCurrentDrawing(canvas.toDataURL('image/png'));
  };

  const handleSubmit = async () => {
    if (!hasDrawn || !modelReady || isProcessing) return;

    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) {
      setFeedback('Error: Canvas not available');
      return;
    }

    setIsProcessing(true);
    setFeedback('AI is analyzing your writing...');
    setRecognizedOutput('');
    setPreprocessedImageUrl('');

    try {
      // Use TensorFlow.js model for character recognition
      const result = await characterRecognizer.recognizeCharacter(canvas);

      console.log('TensorFlow.js prediction:', result);
      console.log('Expected letter:', currentLetter);

      // Show what the model recognized with confidence
      const confidencePercent = Math.round(result.confidence * 100);
      setRecognizedOutput(`${result.letter} (${confidencePercent}% confidence)`);

      // Show the preprocessed image that was sent to the model
      if (result.preprocessedImageUrl) {
        setPreprocessedImageUrl(result.preprocessedImageUrl);
      }

      // Strict educational character matching - only exact case matches count
      const hasGoodConfidence = result.confidence >= characterRecognizer.getConfidenceThreshold(result.letter);

      let matchResult;
      if (language === 'ta') {
        // For Tamil, we'll accept any drawing as correct for now since the model isn't trained for Tamil
        matchResult = {
          isCorrect: true,
          isWrongCase: false,
          feedback: `Perfect! You wrote "${currentLetter}" correctly! 🎉`
        };
      } else {
        matchResult = isCharacterMatchStrict(result.letter, currentLetter, 'capital');
      }

      if (matchResult.isCorrect && (hasGoodConfidence || language === 'ta')) {
        // Advance for correct matches (Tamil or English with good confidence)
        setScore(score + 1);
        setFeedback(matchResult.feedback);
        setShowCelebration(true);

        setTimeout(() => {
          setShowCelebration(false);
          if (currentIndex < ALPHABETS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setFeedback('');
            setRecognizedOutput('');
            setPreprocessedImageUrl('');
            setHasDrawn(false);
            setCurrentDrawing('');
            canvasRef.current?.clear();
          }
          setIsProcessing(false);
        }, 2500);
      } else if (matchResult.isWrongCase && hasGoodConfidence) {
        // Educational feedback for wrong case but right letter
        setFeedback(matchResult.feedback);
        setIsProcessing(false);
      } else if (matchResult.isCorrect && !hasGoodConfidence) {
        // Right letter, right case, but low confidence
        setFeedback(`Good job! Try writing more clearly next time! ✏️`);
        setIsProcessing(false);
      } else {
        // Wrong letter entirely or other issues
        setFeedback(matchResult.feedback);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('TensorFlow.js Recognition Error:', error);
      setFeedback('Error processing your writing. Please try again.');
      setRecognizedOutput('');
      setPreprocessedImageUrl('');
      setIsProcessing(false);
    }
  };

  const nextLetter = () => {
    if (currentIndex < ALPHABETS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback('');
      setRecognizedOutput('');
      setPreprocessedImageUrl('');
      setHasDrawn(false);
      setCurrentDrawing('');
      canvasRef.current?.clear();
    }
  };

  const previousLetter = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFeedback('');
      setRecognizedOutput('');
      setPreprocessedImageUrl('');
      setHasDrawn(false);
      setCurrentDrawing('');
      canvasRef.current?.clear();
    }
  };

  const handleRetry = () => {
    setFeedback('');
    setRecognizedOutput('');
    setPreprocessedImageUrl('');
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
        {/* Header Bar */}
        <div className="bg-emerald-600 rounded-2xl shadow-lg p-3 mb-2 flex justify-between items-center flex-shrink-0">
          <button
            onClick={() => router.push(`/choose-language?section=writing&subsection=capital&lang=${language}`)}
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">Practice Mode</h1>
          <div className="w-20"></div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2 flex-shrink-0">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / ALPHABETS.length) * 100}%` }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-3 mb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm mb-0.5">Current Letter</p>
              <p className="text-5xl font-bold text-emerald-600">{currentLetter}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-gray-600 text-sm mb-0.5">Progress</p>
              <p className="text-2xl font-bold text-slate-600">
                {currentIndex + 1} / {ALPHABETS.length}
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
                  <span className="text-sm font-semibold text-gray-700">⌨️ Keyboard Writing Mode</span>
                  <span className="text-xs text-gray-500">(Hold W to write)</span>
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
              Practice writing: <span className="text-emerald-600">{currentLetter}</span>
            </h2>
            {modelError ? (
              <p className="text-red-600 text-sm">{modelError}</p>
            ) : modelReady ? (
              <p className="text-gray-600 text-sm">Write the letter, then click Submit</p>
            ) : (
              <p className="text-orange-600 text-sm">Loading AI model...</p>
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
                {isWKeyPressed ? '✏️ Writing Enabled' : '🔓 Hold W to Write'}
              </div>
            </div>
          )}

          <div className="flex justify-center flex-1 items-center">
            <DrawingCanvas
              ref={canvasRef}
              onDrawingComplete={handleDrawingComplete}
              isEnabled={!isProcessing && modelReady && !modelError}
              keyboardDrawingEnabled={keyboardDrawingEnabled}
              isWKeyPressed={isWKeyPressed}
              width={language === 'ta' ? 1200 : 400}
              height={320}
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

          {isProcessing && (
            <div className="text-center flex-shrink-0">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-4 border-emerald-600"></div>
            </div>
          )}

          <div className="flex justify-center gap-4 pb-2 flex-shrink-0">
            <button
              onClick={previousLetter}
              disabled={currentIndex === 0}
              className="px-5 py-2 bg-gray-500 text-white rounded-lg font-bold text-sm hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={nextLetter}
              disabled={currentIndex === ALPHABETS.length - 1}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

      </div>

      {/* Drawing Animation Modal */}
      <DrawingAnimation
        character={currentLetter}
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

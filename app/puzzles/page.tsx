'use client';

import { useState } from 'react';
import Link from 'next/link';
import MazeGame from '@/components/MazeGame';

type PuzzleType = 'maze' | 'pattern' | 'sequence' | null;

export default function PuzzlesPage() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType>(null);
  const [mazeDifficulty, setMazeDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [mazeSize, setMazeSize] = useState(8);
  const [completedCount, setCompletedCount] = useState(0);

  const handleMazeComplete = () => {
    setCompletedCount(completedCount + 1);
  };

  const handleDifficultyChange = (difficulty: 'easy' | 'medium' | 'hard') => {
    setMazeDifficulty(difficulty);
    switch (difficulty) {
      case 'easy':
        setMazeSize(8);
        break;
      case 'medium':
        setMazeSize(12);
        break;
      case 'hard':
        setMazeSize(15);
        break;
    }
  };

  if (selectedPuzzle === 'maze') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9]">
        {/* Header */}
        <div className="bg-[#1976D2] px-6 py-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setSelectedPuzzle(null)}
              className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              ← Back to Puzzles
            </button>
            <h1 className="text-2xl font-bold text-white">Maze Runner</h1>
            <div className="text-white font-bold">
              Solved: {completedCount}
            </div>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-4">
              <span className="font-bold text-[#5D4037]">Difficulty:</span>
              <button
                onClick={() => handleDifficultyChange('easy')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  mazeDifficulty === 'easy'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Easy (8x8)
              </button>
              <button
                onClick={() => handleDifficultyChange('medium')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  mazeDifficulty === 'medium'
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Medium (12x12)
              </button>
              <button
                onClick={() => handleDifficultyChange('hard')}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  mazeDifficulty === 'hard'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Hard (15x15)
              </button>
            </div>
          </div>

          {/* Maze Game */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <MazeGame
              key={`${mazeSize}-${completedCount}`}
              size={mazeSize}
              difficulty={mazeDifficulty}
              onComplete={handleMazeComplete}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E3F2FD] via-[#BBDEFB] to-[#90CAF9]">
      {/* Header */}
      <div className="bg-[#1976D2] px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/students"
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">Brain Puzzles</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Puzzle Selection */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0D47A1] mb-2">Choose a Puzzle</h2>
          <p className="text-lg text-[#1565C0]">Challenge your brain with fun puzzles!</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Maze Puzzle */}
          <div
            onClick={() => setSelectedPuzzle('maze')}
            className="bg-white rounded-2xl shadow-lg p-6 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer border-4 border-[#BBDEFB]"
          >
            <div className="text-6xl mb-4 text-center">🌀</div>
            <h3 className="text-2xl font-bold text-[#1976D2] mb-2 text-center">Maze Runner</h3>
            <p className="text-[#5D4037] text-center">
              Find your way from start to end without lifting your finger!
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                Available Now
              </span>
            </div>
          </div>

          {/* Pattern Puzzle - Coming Soon */}
          <div className="bg-white/50 rounded-2xl shadow-lg p-6 border-4 border-[#BBDEFB] opacity-75">
            <div className="text-6xl mb-4 text-center grayscale">🔷</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2 text-center">Pattern Match</h3>
            <p className="text-gray-400 text-center">
              Complete the pattern sequence
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Sequence Puzzle - Coming Soon */}
          <div className="bg-white/50 rounded-2xl shadow-lg p-6 border-4 border-[#BBDEFB] opacity-75">
            <div className="text-6xl mb-4 text-center grayscale">🔢</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2 text-center">Number Sequence</h3>
            <p className="text-gray-400 text-center">
              Find the next number in the sequence
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Memory Game - Coming Soon */}
          <div className="bg-white/50 rounded-2xl shadow-lg p-6 border-4 border-[#BBDEFB] opacity-75">
            <div className="text-6xl mb-4 text-center grayscale">🎴</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2 text-center">Memory Cards</h3>
            <p className="text-gray-400 text-center">
              Match pairs and test your memory
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Logic Puzzle - Coming Soon */}
          <div className="bg-white/50 rounded-2xl shadow-lg p-6 border-4 border-[#BBDEFB] opacity-75">
            <div className="text-6xl mb-4 text-center grayscale">🧠</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2 text-center">Logic Grid</h3>
            <p className="text-gray-400 text-center">
              Solve logic puzzles using clues
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Tangram - Coming Soon */}
          <div className="bg-white/50 rounded-2xl shadow-lg p-6 border-4 border-[#BBDEFB] opacity-75">
            <div className="text-6xl mb-4 text-center grayscale">🔺</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2 text-center">Tangram</h3>
            <p className="text-gray-400 text-center">
              Create shapes using geometric pieces
            </p>
            <div className="mt-4 text-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
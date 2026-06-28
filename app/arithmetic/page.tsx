'use client';

import Link from 'next/link';

export default function ArithmeticPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FFF3E0] via-[#FFE0B2] to-[#FFCC80]">
      {/* Header */}
      <div className="bg-[#F57C00] px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/students"
            className="px-4 py-2 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white">Arithmetic Fun</h1>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="text-8xl mb-6">🔢</div>
          <h2 className="text-4xl font-bold text-[#F57C00] mb-4">Coming Soon!</h2>
          <p className="text-xl text-[#5D4037] mb-8">
            We're working on exciting arithmetic games and exercises!
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {/* Addition */}
            <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-6 border-4 border-green-300">
              <div className="text-5xl mb-3">➕</div>
              <h3 className="text-xl font-bold text-green-700 mb-2">Addition</h3>
              <p className="text-green-600 text-sm">Learn to add numbers with fun games</p>
            </div>

            {/* Subtraction */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 border-4 border-blue-300">
              <div className="text-5xl mb-3">➖</div>
              <h3 className="text-xl font-bold text-blue-700 mb-2">Subtraction</h3>
              <p className="text-blue-600 text-sm">Master subtraction step by step</p>
            </div>

            {/* Multiplication */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6 border-4 border-purple-300">
              <div className="text-5xl mb-3">✖️</div>
              <h3 className="text-xl font-bold text-purple-700 mb-2">Multiplication</h3>
              <p className="text-purple-600 text-sm">Times tables made easy</p>
            </div>

            {/* Division */}
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-2xl p-6 border-4 border-red-300">
              <div className="text-5xl mb-3">➗</div>
              <h3 className="text-xl font-bold text-red-700 mb-2">Division</h3>
              <p className="text-red-600 text-sm">Divide and conquer math problems</p>
            </div>

            {/* Word Problems */}
            <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-6 border-4 border-amber-300">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-xl font-bold text-amber-700 mb-2">Word Problems</h3>
              <p className="text-amber-600 text-sm">Real-world math challenges</p>
            </div>

            {/* Speed Math */}
            <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl p-6 border-4 border-teal-300">
              <div className="text-5xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-teal-700 mb-2">Speed Math</h3>
              <p className="text-teal-600 text-sm">Quick calculation challenges</p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-lg text-[#8D6E63] font-semibold">
              Check back soon for exciting math adventures! 🚀
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
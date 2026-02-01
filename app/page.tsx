'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="h-screen bg-warm-gradient flex flex-col overflow-hidden">
      {/* Top Banner */}
      <div className="bg-indigo-600 rounded-b-3xl px-6 pt-5 pb-10 flex-shrink-0">
        {/* Neurogati Logo */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/neurogati.png"
            alt="Neurogati"
            className="w-12 h-12 md:w-14 md:h-14"
          />
          <span className="text-white font-bold text-lg md:text-xl">
            Neurogati
          </span>
        </div>

        {/* Hero Section */}
        <div className={`max-w-6xl mx-auto text-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
            AksharA
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-indigo-100 mb-3">
            AI-Powered Language Learning
          </h2>

          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-2 mb-3">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm md:text-base">Assistive Technology Platform</span>
          </div>

          <p className="text-sm md:text-base text-indigo-200">
            Interactive handwriting recognition &middot; Real-time feedback &middot; Personalized learning paths
          </p>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-6xl mx-auto px-6 -mt-6 flex-1 flex flex-col justify-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl mb-2">🧠</div>
            <h3 className="text-slate-800 font-bold text-sm md:text-base mb-1">AI Recognition</h3>
            <p className="text-slate-600 text-xs md:text-sm">Neural networks analyze handwriting in real-time</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl mb-2">⚡</div>
            <h3 className="text-slate-800 font-bold text-sm md:text-base mb-1">Instant Feedback</h3>
            <p className="text-slate-600 text-xs md:text-sm">Get immediate corrections and guidance</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl mb-2">🎯</div>
            <h3 className="text-slate-800 font-bold text-sm md:text-base mb-1">Adaptive Learning</h3>
            <p className="text-slate-600 text-xs md:text-sm">Personalized curriculum for each child</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-6">
          <Link href="/signup">
            <button className="bg-indigo-600 hover:bg-indigo-700 hover:scale-105 text-white font-bold py-4 px-10 rounded-xl text-xl md:text-2xl transition-all duration-300 shadow-lg hover:shadow-xl">
              Let&apos;s Learn!
            </button>
          </Link>
        </div>

        {/* Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-5 max-w-3xl mx-auto w-full">
          <h3 className="text-slate-800 font-bold text-lg mb-4 text-center">Experience the Magic</h3>
          <div className="grid grid-cols-4 gap-4">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <Link href="/choose-language" key={letter}>
                <div
                  className="bg-indigo-50 rounded-2xl p-4 text-center hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-1">
                    {letter}
                  </div>
                  <div className="w-full h-1 bg-indigo-200 rounded-full"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { Suspense } from 'react';
import ChooseLanguageClient from './ChooseLanguageClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-[#B4AEE8] via-[#F4D9F0] to-[#A8D5BA] flex items-center justify-center p-4 relative overflow-hidden">
          {/* Decorative Leaves */}
          <div className="absolute top-0 left-0 text-9xl select-none opacity-80 -translate-x-10 -translate-y-10 rotate-45">🌿</div>
          <div className="absolute top-0 right-0 text-9xl select-none opacity-80 translate-x-10 -translate-y-10 -rotate-45">🌿</div>
          <div className="absolute bottom-0 left-0 text-9xl select-none opacity-80 -translate-x-10 translate-y-10 -rotate-45">🌿</div>
          <div className="absolute bottom-0 right-0 text-9xl select-none opacity-80 translate-x-10 translate-y-10 rotate-45">🌿</div>

          <div className="relative">
            <div className="bg-[#FFF9F0] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_0_8px_rgba(255,255,255,0.4)] border-4 border-[#EADDCA]">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 border-4 border-[#9C27B0] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[#8D6E63] font-bold text-xl">Loading...</p>
              </div>
            </div>
          </div>
        </main>
      }
    >
      <ChooseLanguageClient />
    </Suspense>
  );
}

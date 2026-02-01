'use client';

import { Suspense } from 'react';
import ConfirmEmailClient from './ConfirmEmailClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
      }
    >
      <ConfirmEmailClient />
    </Suspense>
  );
}

'use client';

import { Suspense } from 'react';
import TestClient from './TestClient';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-gradient flex items-center justify-center">
          <div className="text-lg font-semibold">Loading test…</div>
        </div>
      }
    >
      <TestClient />
    </Suspense>
  );
}

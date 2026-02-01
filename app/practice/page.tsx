'use client';

import { Suspense } from 'react';
import PracticeClient from './PracticeClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-gradient p-6 text-center">Loading...</div>}>
      <PracticeClient />
    </Suspense>
  );
}

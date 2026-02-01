'use client';

import { Suspense } from 'react';
import ChooseLanguageClient from './ChooseLanguageClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-warm-gradient p-6 text-center">Loading...</div>}>
      <ChooseLanguageClient />
    </Suspense>
  );
}

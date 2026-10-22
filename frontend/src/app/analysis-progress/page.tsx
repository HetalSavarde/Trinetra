'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/common/Navbar';
import { AnalysisProgress } from '@/components/analyze/AnalysisProgress';

function ProgressContent() {
  const searchParams = useSearchParams();
  const repoUrl = searchParams.get('repo') || '';
  const jobId = searchParams.get('jobId') || '';

  if (!jobId) return <div className="mx-auto max-w-3xl rounded-xl border border-rose-500/30 bg-rose-950/20 p-8 text-center text-rose-300">Missing analysis job. Start a new analysis.</div>;
  return <AnalysisProgress repoUrl={repoUrl} jobId={jobId} />;
}

export default function AnalysisProgressPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center text-slate-400 font-mono text-sm animate-pulse">
              Initializing analysis pipeline...
            </div>
          }
        >
          <ProgressContent />
        </Suspense>
      </main>
    </div>
  );
}

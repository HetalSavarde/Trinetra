import React from 'react';
import { Navbar } from '@/components/common/Navbar';
import { RepositoryInput } from '@/components/analyze/RepositoryInput';

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <RepositoryInput />
      </main>
    </div>
  );
}

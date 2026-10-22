'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchCode, ArrowRight, Info, Sparkles } from 'lucide-react';
import { GithubIcon } from '@/components/common/Icons';
import { Button } from '@/components/common/Button';
import { sampleRepositories } from '@/lib/mockData';
import { startAnalysis } from '@/lib/api';

export function RepositoryInput() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!repoUrl.includes('github.com/')) {
      setError('Please provide a valid GitHub repository URL (e.g., https://github.com/user/repo)');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await startAnalysis(repoUrl.trim());
      router.push(`/analysis-progress?jobId=${encodeURIComponent(result.jobId)}&repo=${encodeURIComponent(repoUrl.trim())}`);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Could not start repository analysis');
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setRepoUrl(sampleUrl);
    setError('');
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 text-indigo-400 mb-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <SearchCode className="h-6 w-6" />
          </div>
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">
            Repository Analyzer
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Analyze Repository
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed">
          Enter a public GitHub repository and let Trinetra analyze its development history and code risk.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <GithubIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder="https://github.com/user/project"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-3.5 pl-12 pr-4 text-sm md:text-base font-mono text-white placeholder:text-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
              <span>●</span> {error}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Format: https://github.com/:owner/:repo
            </span>
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              icon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Start Analysis
            </Button>
          </div>
        </form>

        {/* Supported Samples */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Or inspect a benchmark sample:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sampleRepositories.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleSelectSample(sample.url)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 transition-colors text-left"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-200 font-medium truncate">
                    {sample.name}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Public Python benchmark repository
                  </span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  Sample
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Small info card */}
        <div className="mt-6 rounded-lg border border-slate-800/80 bg-slate-950/40 p-4 flex items-start gap-3 text-xs text-slate-400">
          <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-300">Public Repositories Supported:</strong> Semester 5 scope: public GitHub repositories only. The repository is cloned temporarily for analysis; no account connection is required.
          </div>
        </div>
      </div>
    </div>
  );
}

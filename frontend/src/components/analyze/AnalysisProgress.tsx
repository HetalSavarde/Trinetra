'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisJob } from '@/types';
import { getAnalysisJob } from '@/lib/api';
import { Check, Loader2, Terminal, AlertTriangle } from 'lucide-react';
import { GithubIcon } from '@/components/common/Icons';
import { Button } from '@/components/common/Button';

interface AnalysisProgressProps {
  repoUrl: string;
  jobId: string;
}

export function AnalysisProgress({ repoUrl, jobId }: AnalysisProgressProps) {
  const router = useRouter();
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const next = await getAnalysisJob(jobId, repoUrl);
        if (cancelled) return;
        setJob(next);
        if (next.status === 'completed') {
          router.replace(`/dashboard?jobId=${encodeURIComponent(jobId)}&repo=${encodeURIComponent(repoUrl)}`);
          return;
        }
        if (next.status === 'failed') {
          setError(next.error || 'The backend could not complete this analysis. Please retry with another public Python repository.');
          return;
        }
        timer = setTimeout(poll, 900);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to read analysis progress');
          timer = setTimeout(poll, 1500);
        }
      }
    };

    poll();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [jobId, repoUrl, router]);

  const progressPercent = job?.progressPercent ?? 0;
  const steps = job?.steps || [];
  const currentStep = steps.find((step) => step.status === 'in_progress') || steps[steps.length - 1];
  const repoName = job?.repoName || repoUrl.replace('https://github.com/', '').replace(/\/$/, '');

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500" />
              </span>
              <span className="text-xs font-mono uppercase tracking-wider font-semibold">Live Processing Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Analyzing Repository...</h1>
            <div className="mt-1.5 flex items-center gap-2 text-xs font-mono text-slate-400">
              <GithubIcon className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-200 font-semibold">{repoName}</span>
              <span className="text-slate-600">•</span>
              <span className="truncate max-w-[280px] text-slate-400">{repoUrl}</span>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => router.push('/analyze')} className="text-xs font-mono self-start sm:self-auto">Cancel</Button>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-300 flex items-center gap-2"><span className="text-indigo-400 font-semibold">Current step:</span><span className="text-white font-medium">{currentStep?.label || 'Starting analysis'}</span></span>
            <span className="text-xl font-bold text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-300 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <div className="mt-8 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-3">Pipeline Execution Checklist:</div>
          {steps.map((step) => (
            <div key={step.id} className={`flex items-center justify-between p-3 rounded-lg border ${step.status === 'in_progress' ? 'border-indigo-500/50 bg-indigo-950/20' : step.status === 'completed' ? 'border-slate-800/80 bg-slate-950/40' : step.status === 'error' ? 'border-rose-500/40 bg-rose-950/20' : 'border-transparent bg-slate-950/20'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center shrink-0">
                  {step.status === 'completed' ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"><Check className="h-3 w-3 stroke-[3]" /></span> : step.status === 'in_progress' ? <Loader2 className="h-4 w-4 text-indigo-400 animate-spin" /> : step.status === 'error' ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : <span className="h-2 w-2 rounded-full bg-slate-700" />}
                </div>
                <div className="flex flex-col"><span className="text-xs font-mono font-medium text-slate-200">{step.label}</span><span className="text-[10px] text-slate-500 font-sans">{step.description}</span></div>
              </div>
              <div className="text-[11px] font-mono">{step.status === 'completed' && <span className="text-emerald-400">Done</span>}{step.status === 'in_progress' && <span className="text-indigo-400 animate-pulse">Running...</span>}{step.status === 'pending' && <span className="text-slate-600">Pending</span>}{step.status === 'error' && <span className="text-rose-400">Failed</span>}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2"><Terminal className="h-4 w-4 text-slate-500" /><span className="text-slate-300">{job?.status === 'completed' ? 'Analysis complete.' : error ? 'Analysis stopped.' : `[Backend] ${currentStep?.label || 'Starting'}...`}</span></div>
          <span className="text-slate-500 text-[10px]">TRINETRA API</span>
        </div>
      </div>
    </div>
  );
}

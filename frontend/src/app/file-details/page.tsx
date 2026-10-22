'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileCode,
  ArrowLeft,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import { RiskBadge } from '@/components/common/RiskBadge';
import { FileRiskFactors } from '@/components/file-details/FileRiskFactors';
import { HistoricalStats } from '@/components/file-details/HistoricalStats';
import { CommitActivityChart } from '@/components/file-details/CommitActivityChart';
import { RiskExplanation } from '@/components/file-details/RiskExplanation';
import { getFileDetails, getAnalyzedFiles } from '@/lib/api';
import { AnalyzedFile } from '@/types';

function FileDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filePathParam = searchParams.get('file') || '';
  const jobId = searchParams.get('jobId') || '';
  const repoUrlParam = searchParams.get('repo') || '';
  const branchParam = searchParams.get('branch') || 'HEAD';

  const [file, setFile] = useState<AnalyzedFile | null>(null);
  const [allFiles, setAllFiles] = useState<AnalyzedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [repositoryUrl, setRepositoryUrl] = useState(repoUrlParam);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [fileData, fileList] = await Promise.all([
        jobId && filePathParam ? getFileDetails(jobId, filePathParam) : Promise.resolve(null),
        jobId ? getAnalyzedFiles(jobId) : Promise.resolve([]),
      ]);
      setFile(fileData?.file || null);
      setRepositoryUrl(fileData?.repositoryUrl || repoUrlParam);
      setAllFiles(fileList);
      setLoading(false);
    }
    loadData();
  }, [filePathParam, jobId, repoUrlParam]);

  if (loading || !file) {
    return (
      <div className="flex-1 p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-800 rounded" />
        <div className="h-32 bg-slate-900 rounded-xl border border-slate-800" />
        <div className="h-64 bg-slate-900 rounded-xl border border-slate-800" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <Link
              href={`/dashboard?jobId=${encodeURIComponent(jobId)}&repo=${encodeURIComponent(repositoryUrl)}`}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-slate-400">{file.directory}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-white font-bold">{file.name}</span>
          </div>

          {/* Quick file switcher & actions */}
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-mono hidden sm:inline">
              Switch file:
            </label>
            <select
              value={file.path}
              onChange={(e) => router.push(`/file-details?jobId=${encodeURIComponent(jobId)}&repo=${encodeURIComponent(repositoryUrl)}&branch=${encodeURIComponent(branchParam)}&file=${encodeURIComponent(e.target.value)}`)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              {allFiles.map((f) => (
                <option key={f.id} value={f.path}>
                  {f.path} ({f.riskScore})
                </option>
              ))}
            </select>

            <a
              href={`${repositoryUrl.replace(/\/$/, '')}/blob/${encodeURIComponent(branchParam)}/${file.path}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* MAIN FILE RISK HERO CARD */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <FileCode className="h-5 w-5" />
                <span className="text-xs font-mono uppercase tracking-wider font-semibold">
                  File Risk Diagnostic
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-mono">
                {file.path}
              </h1>
              <p className="mt-1 text-xs md:text-sm text-slate-400 font-sans">
                Predictive bug-proneness index computed from Git history churn, complexity heuristics, and contributor density.
              </p>
            </div>

            {/* Prominent Risk Score Indicator */}
            <div className="flex items-center gap-5 rounded-xl border border-slate-800 bg-slate-950/80 p-5 shrink-0">
              <div className="flex flex-col text-right">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Predicted Risk Score
                </span>
                <div className="flex items-baseline gap-1 justify-end font-mono">
                  <span
                    className={`text-4xl md:text-5xl font-extrabold ${
                      file.riskScore >= 90
                        ? 'text-rose-400'
                        : file.riskScore >= 70
                        ? 'text-orange-400'
                        : file.riskScore >= 40
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {file.riskScore}
                  </span>
                  <span className="text-slate-500 font-bold text-lg">/ 100</span>
                </div>
              </div>

              <div className="h-12 w-px bg-slate-800" />

              <div className="flex flex-col items-start gap-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Classification
                </span>
                <RiskBadge level={file.riskLevel} size="lg" />
              </div>
            </div>
          </div>
        </section>

        {/* HISTORICAL STATS CARDS */}
        <section>
          <HistoricalStats file={file} />
        </section>

        {/* RISK FACTORS BREAKDOWN */}
        <section>
          <FileRiskFactors factors={file.riskFactors} />
        </section>

        {/* COMMIT ACTIVITY GRAPH */}
        <section>
          <CommitActivityChart data={file.commitActivity} />
        </section>

        {/* WHY IS THIS FILE RISKY? EXPLANATION */}
        <section>
          <RiskExplanation
            reasons={file.whyRiskyReasons}
            recommendations={file.recommendations}
          />
        </section>
      </div>
    </div>
  );
}

export default function FileDetailsPage() {
  return (
    <div className="flex min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30">
      <Sidebar />
      <Suspense
        fallback={
          <div className="flex-1 p-8 text-center text-slate-400 font-mono text-sm">
            Loading file risk diagnostics...
          </div>
        }
      >
        <FileDetailsContent />
      </Suspense>
    </div>
  );
}

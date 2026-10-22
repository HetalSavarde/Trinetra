'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ExternalLink,
  RefreshCw,
  FolderGit2,
  FileCode2,
  Flame,
  Activity,
  Bug,
} from 'lucide-react';
import { Sidebar } from '@/components/common/Sidebar';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { RiskHeatmap } from '@/components/dashboard/RiskHeatmap';
import { RiskDistribution } from '@/components/dashboard/RiskDistribution';
import { RiskTable } from '@/components/dashboard/RiskTable';
import { RiskLegend } from '@/components/dashboard/RiskLegend';
import { getRepositorySummary, getAnalyzedFiles } from '@/lib/api';
import { RepositorySummary, AnalyzedFile } from '@/types';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('jobId');

  const [repoSummary, setRepoSummary] = useState<RepositorySummary | null>(null);
  const [files, setFiles] = useState<AnalyzedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');
      if (!jobId) {
        setError('No completed analysis was selected. Start a repository analysis first.');
        setIsLoading(false);
        return;
      }
      try {
        const [summary, fileList] = await Promise.all([
          getRepositorySummary(jobId),
          getAnalyzedFiles(jobId),
        ]);
        setRepoSummary(summary);
        setFiles(fileList);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load analysis results');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [jobId]);

  const handleReanalyze = () => router.push('/analyze');

  if (isLoading || !repoSummary) {
    return (
      <div className="flex-1 p-6 md:p-8">
        {error ? (
          <div className="mx-auto max-w-2xl rounded-xl border border-rose-500/30 bg-rose-950/20 p-8 text-center text-rose-300">
            <p className="font-semibold">Unable to load repository analysis</p>
            <p className="mt-2 text-sm text-rose-200/80">{error}</p>
            <Button className="mt-5" onClick={() => router.push('/analyze')}>Start New Analysis</Button>
          </div>
        ) : (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 bg-slate-800/80 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-900 rounded-xl border border-slate-800" />
              ))}
            </div>
            <div className="h-96 bg-slate-900 rounded-xl border border-slate-800" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Top dashboard header bar */}
      <div className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-5 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Repo title */}
          <div>
            <div className="flex items-center gap-2.5">
              <FolderGit2 className="h-5 w-5 text-indigo-400" />
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-mono">
                Repository: {repoSummary.name}
              </h1>
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-medium text-indigo-400 border border-indigo-500/20">
                branch: {repoSummary.branch}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-400">
              <a
                href={repoSummary.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <span>{repoSummary.url}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-600">•</span>
              <span>Last analyzed: {repoSummary.lastAnalyzed}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="h-3.5 w-3.5" />}
              onClick={handleReanalyze}
            >
              Analyze Another Repository
            </Button>
            <a
              href={repoSummary.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-slate-600 hover:bg-slate-700 transition-colors"
            >
              <span>View on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
        {/* SUMMARY STATISTIC CARDS */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Files Analyzed"
              value={repoSummary.totalFiles}
              icon={<FileCode2 className="h-5 w-5" />}
              context="Eligible Python files"
              contextType="neutral"
            />
            <StatCard
              label="High-Risk Files"
              value={repoSummary.highRiskFilesCount}
              icon={<Flame className="h-5 w-5 text-rose-400" />}
              context="Requires priority code review"
              contextType="danger"
            />
            <StatCard
              label="Average Risk Score"
              value={repoSummary.averageRiskScore}
              icon={<Activity className="h-5 w-5 text-amber-400" />}
              context="Moderate overall risk baseline"
              contextType="warning"
            />
            <StatCard
              label="Bug-Fix Commits"
              value={repoSummary.totalBugFixCommits}
              icon={<Bug className="h-5 w-5 text-rose-400" />}
              context="Identified in git history"
              contextType="neutral"
            />
          </div>
        </section>

        {/* RISK LEGEND */}
        <RiskLegend />

        {/* VISUAL CENTERPIECE: RISK HEATMAP + RISK DISTRIBUTION */}
        <section id="hotspots" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <RiskHeatmap files={files} jobId={jobId || ''} repoUrl={repoSummary.url} branch={repoSummary.branch} />
          </div>
          <div className="lg:col-span-4">
            <RiskDistribution
              highRiskCount={repoSummary.highRiskFilesCount}
              mediumRiskCount={repoSummary.mediumRiskFilesCount}
              lowRiskCount={repoSummary.lowRiskFilesCount}
              criticalRiskCount={repoSummary.criticalRiskFilesCount}
              totalFiles={repoSummary.totalFiles}
            />
          </div>
        </section>

        {/* HIGH-RISK FILES TABLE */}
        <section>
          <RiskTable files={files} jobId={jobId || ''} repoUrl={repoSummary.url} branch={repoSummary.branch} />
        </section>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#090D16] text-slate-100 selection:bg-indigo-500/30">
      <Sidebar />
      <Suspense
        fallback={
          <div className="flex-1 p-8 text-center text-slate-400 font-mono text-sm">
            Loading repository dashboard...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}

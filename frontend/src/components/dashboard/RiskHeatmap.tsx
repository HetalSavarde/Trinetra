'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyzedFile } from '@/types';
import { RiskBadge } from '@/components/common/RiskBadge';
import { FileCode, Layers, ArrowUpRight, Info } from 'lucide-react';

interface RiskHeatmapProps {
  files: AnalyzedFile[];
  jobId?: string;
  repoUrl?: string;
  branch?: string;
  className?: string;
}

export function RiskHeatmap({ files, jobId = '', repoUrl = '', branch = 'main', className = '' }: RiskHeatmapProps) {
  const router = useRouter();
  const [hoveredFile, setHoveredFile] = useState<AnalyzedFile | null>(null);
  const [filterDir, setFilterDir] = useState<string>('all');

  // Compute color gradients based on exact score
  const getCellColor = (score: number) => {
    if (score >= 90) {
      return {
        bg: 'bg-rose-950/80 hover:bg-rose-900/90',
        border: 'border-rose-500/70',
        text: 'text-rose-200',
        glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]',
        badge: 'bg-rose-500 text-white',
      };
    }
    if (score >= 70) {
      return {
        bg: 'bg-orange-950/70 hover:bg-orange-900/80',
        border: 'border-orange-500/60',
        text: 'text-orange-200',
        glow: 'hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]',
        badge: 'bg-orange-500 text-white',
      };
    }
    if (score >= 40) {
      return {
        bg: 'bg-amber-950/60 hover:bg-amber-900/70',
        border: 'border-amber-500/50',
        text: 'text-amber-200',
        glow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-500 text-white',
      };
    }
    return {
      bg: 'bg-emerald-950/50 hover:bg-emerald-900/65',
      border: 'border-emerald-500/40',
      text: 'text-emerald-200',
      glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      badge: 'bg-emerald-500 text-white',
    };
  };

  // Directories list for filter
  const directories = ['all', ...Array.from(new Set(files.map((f) => f.directory)))];

  const filteredFiles =
    filterDir === 'all' ? files : files.filter((f) => f.directory === filterDir);

  // Determine span classes based on lines of code
  const getTileSpan = (loc: number) => {
    if (loc >= 450) return 'col-span-12 md:col-span-6 lg:col-span-4 row-span-2 min-h-[170px]';
    if (loc >= 300) return 'col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-4 min-h-[150px]';
    if (loc >= 200) return 'col-span-6 sm:col-span-6 md:col-span-3 lg:col-span-3 min-h-[135px]';
    return 'col-span-6 sm:col-span-6 md:col-span-3 lg:col-span-2 min-h-[120px]';
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Repository Risk Heatmap
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            File size represents code volume. Color represents predicted risk. Click any tile for deep analysis.
          </p>
        </div>

        {/* Directory filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">
            Filter:
          </span>
          {directories.map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDir(dir)}
              className={`rounded px-2.5 py-1 text-xs font-mono transition-colors whitespace-nowrap ${
                filterDir === dir
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80'
              }`}
            >
              {dir === 'all' ? 'All Modules' : dir}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="mt-5 grid grid-cols-12 gap-3 auto-rows-fr">
        {filteredFiles.map((file) => {
          const colors = getCellColor(file.riskScore);
          const spanClass = getTileSpan(file.linesOfCode);

          return (
            <div
              key={file.id}
              onClick={() => router.push(`/file-details?jobId=${encodeURIComponent(jobId)}&repo=${encodeURIComponent(repoUrl)}&branch=${encodeURIComponent(branch)}&file=${encodeURIComponent(file.path)}`)}
              onMouseEnter={() => setHoveredFile(file)}
              onMouseLeave={() => setHoveredFile(null)}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border p-3.5 transition-all duration-200 flex flex-col justify-between ${colors.bg} ${colors.border} ${colors.glow} ${spanClass}`}
            >
              {/* Top metadata */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[130px]">
                    {file.directory}/
                  </span>
                  <span
                    className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${colors.badge}`}
                  >
                    {file.riskScore}
                  </span>
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-white group-hover:text-indigo-200 truncate flex items-center gap-1">
                  <span>{file.name}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 ml-auto shrink-0" />
                </div>
              </div>

              {/* Bottom stats inside tile */}
              <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{file.linesOfCode} LOC</span>
                <span>{file.commits} commits</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active hover info tray / inspector */}
      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {hoveredFile ? (
          <>
            <div className="flex items-center gap-2.5">
              <FileCode className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-white font-medium">
                {hoveredFile.path}
              </span>
              <RiskBadge level={hoveredFile.riskLevel} score={hoveredFile.riskScore} size="sm" />
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>Volume: <strong className="text-white">{hoveredFile.linesOfCode} LOC</strong></span>
              <span>Commits: <strong className="text-white">{hoveredFile.commits}</strong></span>
              <span>Complexity: <strong className="text-white">{hoveredFile.complexity}</strong></span>
              <span>Bug Fixes: <strong className="text-rose-400">{hoveredFile.bugFixCommits}</strong></span>
              <span className="text-indigo-400 font-sans font-medium flex items-center gap-1">
                Click to inspect →
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Hover over any file tile above to inspect metrics or click to open full risk breakdown.</span>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyzedFile } from '@/types';
import { RiskBadge } from '@/components/common/RiskBadge';
import {
  Search,
  ArrowUpDown,
  FileCode,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface RiskTableProps {
  files: AnalyzedFile[];
  jobId?: string;
  repoUrl?: string;
  branch?: string;
  className?: string;
}

export function RiskTable({ files, jobId = '', repoUrl = '', branch = 'main', className = '' }: RiskTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'HIGH_PLUS' | 'MEDIUM' | 'LOW'>('ALL');
  const [sortField, setSortField] = useState<'riskScore' | 'commits' | 'complexity' | 'linesOfCode'>('riskScore');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = files
    .filter((file) => {
      const matchesSearch =
        file.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.name.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (tierFilter === 'HIGH_PLUS') {
        return file.riskLevel === 'HIGH' || file.riskLevel === 'CRITICAL';
      }
      if (tierFilter === 'MEDIUM') {
        return file.riskLevel === 'MEDIUM';
      }
      if (tierFilter === 'LOW') {
        return file.riskLevel === 'LOW';
      }
      return true;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });

  const handleSort = (field: 'riskScore' | 'commits' | 'complexity' | 'linesOfCode') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-md overflow-hidden ${className}`}
    >
      {/* Header & Controls */}
      <div className="p-5 md:p-6 border-b border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                High-Risk Files & Hotspots
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Ranked by predicted bug-proneness and code churn index. Click any row for comprehensive breakdown.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search file path..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">
            Filter View:
          </span>
          <button
            onClick={() => setTierFilter('ALL')}
            className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
              tierFilter === 'ALL'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            onClick={() => setTierFilter('HIGH_PLUS')}
            className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
              tierFilter === 'HIGH_PLUS'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-slate-800/80 text-rose-400 hover:bg-slate-800'
            }`}
          >
            Critical & High ({files.filter((f) => f.riskScore >= 70).length})
          </button>
          <button
            onClick={() => setTierFilter('MEDIUM')}
            className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
              tierFilter === 'MEDIUM'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
            }`}
          >
            Medium ({files.filter((f) => f.riskScore >= 40 && f.riskScore < 70).length})
          </button>
          <button
            onClick={() => setTierFilter('LOW')}
            className={`rounded-md px-2.5 py-1 font-mono transition-colors ${
              tierFilter === 'LOW'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
            }`}
          >
            Low ({files.filter((f) => f.riskScore < 40).length})
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 sm:px-6">File</th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3">Risk Level</th>
              <th
                onClick={() => handleSort('commits')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Commits</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3">Contributors</th>
              <th
                onClick={() => handleSort('complexity')}
                className="py-3 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center gap-1">
                  <span>Complexity</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No files matching your search query or filter.
                </td>
              </tr>
            ) : (
              filtered.map((file) => (
                <tr
                  key={file.id}
                  onClick={() => router.push(`/file-details?jobId=${encodeURIComponent(jobId)}&repo=${encodeURIComponent(repoUrl)}&branch=${encodeURIComponent(branch)}&file=${encodeURIComponent(file.path)}`)}
                  className="group cursor-pointer hover:bg-slate-800/50 transition-colors"
                >
                  {/* File column */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 shrink-0 transition-colors" />
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {file.path}
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans">
                          {file.linesOfCode} lines • last modified {file.lastModified}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Risk score */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block font-bold text-sm ${
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
                  </td>

                  {/* Risk level */}
                  <td className="py-3.5 px-3">
                    <RiskBadge level={file.riskLevel} size="sm" />
                  </td>

                  {/* Commits */}
                  <td className="py-3.5 px-3 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span>{file.commits}</span>
                      {file.bugFixCommits > 0 && (
                        <span className="text-[10px] text-rose-400">
                          ({file.bugFixCommits} fixes)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Contributors */}
                  <td className="py-3.5 px-3 text-slate-300">
                    <span>{file.contributors} authors</span>
                  </td>

                  {/* Complexity */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-semibold ${
                        file.complexity >= 18
                          ? 'text-rose-400'
                          : file.complexity >= 12
                          ? 'text-amber-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {file.complexity}
                    </span>
                  </td>

                  {/* Action arrow */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 font-sans font-medium">
                      Inspect
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

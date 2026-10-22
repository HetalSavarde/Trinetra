'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Flame, FileCode } from 'lucide-react';
import { RiskBadge } from '@/components/common/RiskBadge';
import { RiskLevel } from '@/types';

export function HeroPreview() {
  const [activeFile, setActiveFile] = useState({
    name: 'src/auth/login.py',
    score: 89,
    tier: 'HIGH',
    churn: '47 commits',
    complexity: 18,
    fixes: 12,
  });

  const previewTiles = [
    {
      dir: 'src/auth/',
      file: 'login.py',
      path: 'src/auth/login.py',
      score: 89,
      tier: 'HIGH',
      bg: 'bg-rose-950/70 border-rose-500/70 text-rose-200',
      badge: 'bg-rose-500 text-white',
      span: 'col-span-2 row-span-2',
      churn: '47 commits',
      complexity: 18,
      fixes: 12,
    },
    {
      dir: 'src/auth/',
      file: 'session.py',
      path: 'src/auth/session.py',
      score: 82,
      tier: 'HIGH',
      bg: 'bg-orange-950/60 border-orange-500/60 text-orange-200',
      badge: 'bg-orange-500 text-white',
      span: 'col-span-1',
      churn: '41 commits',
      complexity: 15,
      fixes: 9,
    },
    {
      dir: 'src/database/',
      file: 'connection.py',
      path: 'src/database/connection.py',
      score: 81,
      tier: 'HIGH',
      bg: 'bg-orange-950/60 border-orange-500/60 text-orange-200',
      badge: 'bg-orange-500 text-white',
      span: 'col-span-1',
      churn: '39 commits',
      complexity: 16,
      fixes: 8,
    },
    {
      dir: 'src/api/',
      file: 'payment.py',
      path: 'src/api/payment.py',
      score: 78,
      tier: 'HIGH',
      bg: 'bg-orange-950/60 border-orange-500/60 text-orange-200',
      badge: 'bg-orange-500 text-white',
      span: 'col-span-1',
      churn: '31 commits',
      complexity: 14,
      fixes: 7,
    },
    {
      dir: 'src/models/',
      file: 'user.py',
      path: 'src/models/user.py',
      score: 61,
      tier: 'MEDIUM',
      bg: 'bg-amber-950/50 border-amber-500/50 text-amber-200',
      badge: 'bg-amber-500 text-white',
      span: 'col-span-1',
      churn: '27 commits',
      complexity: 11,
      fixes: 4,
    },
    {
      dir: 'src/utils/',
      file: 'helpers.py',
      path: 'src/utils/helpers.py',
      score: 24,
      tier: 'LOW',
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
      badge: 'bg-emerald-500 text-white',
      span: 'col-span-2',
      churn: '12 commits',
      complexity: 4,
      fixes: 1,
    },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      {/* Mock window top bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
          </div>
          <span className="ml-2 text-xs font-mono text-slate-400">
            trinetra-dashboard-preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[11px] font-mono text-rose-400 border border-rose-500/20">
            <Flame className="h-3 w-3" /> 17 Hotspots
          </span>
        </div>
      </div>

      {/* Target Repo Mini-banner */}
      <div className="mt-3.5 flex items-center justify-between text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-white font-medium">awesome-project</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">248 files scanned</span>
        </div>
        <span className="text-[11px] text-emerald-400 font-semibold shrink-0">
          ML Score: 43.2 avg
        </span>
      </div>

      {/* Miniature Heatmap Preview */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Repository Risk Heatmap Preview
          </span>
          <span className="text-[10px] text-slate-500">Interactive</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {previewTiles.map((tile) => (
            <div
              key={tile.path}
              onMouseEnter={() =>
                setActiveFile({
                  name: tile.path,
                  score: tile.score,
                  tier: tile.tier,
                  churn: tile.churn,
                  complexity: tile.complexity,
                  fixes: tile.fixes,
                })
              }
              className={`rounded-lg border p-2.5 transition-all duration-150 cursor-pointer select-none hover:scale-[1.02] flex flex-col justify-between ${tile.bg} ${tile.span}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {tile.dir}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${tile.badge}`}
                  >
                    {tile.score}
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs font-bold text-white truncate">
                  {tile.file}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-slate-400 font-mono">
                {tile.churn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Inspector pill */}
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-white">
              {activeFile.name}
            </span>
          </div>
          <RiskBadge
            level={activeFile.tier as RiskLevel}
            score={activeFile.score}
            size="sm"
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
          <div>
            Churn: <span className="text-white font-bold">{activeFile.churn}</span>
          </div>
          <div>
            Complexity: <span className="text-white font-bold">{activeFile.complexity}</span>
          </div>
          <div>
            Bug Fixes: <span className="text-rose-400 font-bold">{activeFile.fixes}</span>
          </div>
        </div>
      </div>

      {/* CTA to live dashboard */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Full interactive risk breakdown ready:
        </span>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
        >
          Explore Dashboard <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { MonthlyCommitActivity } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { GitCommit } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';

interface CommitActivityChartProps {
  data: MonthlyCommitActivity[];
  className?: string;
}

export function CommitActivityChart({
  data,
  className = '',
}: CommitActivityChartProps) {
  const isMounted = useIsMounted();

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <GitCommit className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Commit Activity & Churn History
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Total Commits
          </span>
          <span className="flex items-center gap-1 ml-2">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" /> Bug Fix Commits
          </span>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Monthly commit volume correlated with identified defect repair activity.
      </p>

      <div className="mt-6 h-64 w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 shadow-2xl font-mono text-xs">
                        <div className="font-bold text-white pb-1.5 border-b border-slate-800">
                          Month: {label}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between gap-4 text-indigo-300">
                            <span>Total Commits:</span>
                            <span className="font-bold text-white">
                              {payload[0]?.value}
                            </span>
                          </div>
                          {payload[1] && (
                            <div className="flex items-center justify-between gap-4 text-rose-400">
                              <span>Bug Fix Commits:</span>
                              <span className="font-bold text-rose-300">
                                {payload[1]?.value}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="commits" name="Total Commits" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bugFixes" name="Bug Fix Commits" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-950/40 rounded-lg flex items-center justify-center animate-pulse text-xs font-mono text-slate-500">
            Rendering activity graph...
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  context?: string;
  contextType?: 'neutral' | 'warning' | 'danger' | 'success';
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  context,
  contextType = 'neutral',
  className = '',
}: StatCardProps) {
  const contextStyles = {
    neutral: 'text-slate-400 bg-slate-800/60 border-slate-700/50',
    warning: 'text-amber-300 bg-amber-950/40 border-amber-600/30',
    danger: 'text-rose-300 bg-rose-950/40 border-rose-600/30',
    success: 'text-emerald-300 bg-emerald-950/40 border-emerald-600/30',
  }[contextType];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md transition-all hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="mt-2 text-3xl font-bold tracking-tight text-white font-mono">
            {value}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/80 p-2.5 text-indigo-400">
          {icon}
        </div>
      </div>

      {context && (
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center text-xs px-2 py-0.5 rounded border font-mono ${contextStyles}`}
          >
            {context}
          </span>
        </div>
      )}
    </div>
  );
}

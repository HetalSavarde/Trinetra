import React from 'react';
import { AnalyzedFile } from '@/types';
import {
  GitCommit,
  Users,
  Bug,
  Cpu,
  FileText,
  Calendar,
  Clock,
  History,
} from 'lucide-react';

interface HistoricalStatsProps {
  file: AnalyzedFile;
  className?: string;
}

export function HistoricalStats({ file, className = '' }: HistoricalStatsProps) {
  const stats = [
    {
      label: 'Total Commits',
      value: file.commits,
      sub: 'Repository revisions',
      icon: <GitCommit className="h-4 w-4 text-indigo-400" />,
      color: 'text-white',
    },
    {
      label: 'Contributors',
      value: file.contributors,
      sub: 'Distinct authors',
      icon: <Users className="h-4 w-4 text-indigo-400" />,
      color: 'text-white',
    },
    {
      label: 'Bug-Fix Commits',
      value: file.bugFixCommits,
      sub: 'Fix/patch messages',
      icon: <Bug className="h-4 w-4 text-rose-400" />,
      color: file.bugFixCommits > 5 ? 'text-rose-400' : 'text-amber-400',
    },
    {
      label: 'Cyclomatic Complexity',
      value: file.complexity,
      sub: 'Control path density',
      icon: <Cpu className="h-4 w-4 text-amber-400" />,
      color: file.complexity >= 15 ? 'text-rose-400' : 'text-slate-100',
    },
    {
      label: 'Lines of Code',
      value: file.linesOfCode,
      sub: 'Physical code lines',
      icon: <FileText className="h-4 w-4 text-indigo-400" />,
      color: 'text-white',
    },
    {
      label: 'Last Modified',
      value: file.lastModified,
      sub: 'Most recent commit',
      icon: <Calendar className="h-4 w-4 text-slate-400" />,
      color: 'text-slate-200',
      isText: true,
    },
    {
      label: 'File Age',
      value: file.fileAge,
      sub: 'Since file creation',
      icon: <Clock className="h-4 w-4 text-slate-400" />,
      color: 'text-slate-200',
      isText: true,
    },
  ];

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
        <History className="h-5 w-5 text-indigo-400" />
        <h3 className="text-base font-bold text-white tracking-tight">
          Historical Code & Git Metrics
        </h3>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-mono uppercase tracking-wider">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div className="mt-2.5">
              <span
                className={`font-mono font-bold ${
                  stat.isText ? 'text-sm' : 'text-2xl'
                } ${stat.color}`}
              >
                {stat.value}
              </span>
              <p className="mt-0.5 text-[10px] text-slate-500 font-sans truncate">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

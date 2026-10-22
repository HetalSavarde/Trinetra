import React from 'react';
import { RiskFactor } from '@/types';
import { RiskBadge } from '@/components/common/RiskBadge';
import { Sliders, GitCommit, Users, Cpu, Clock, Bug, Activity } from 'lucide-react';

interface FileRiskFactorsProps {
  factors: RiskFactor[];
  className?: string;
}

export function FileRiskFactors({ factors, className = '' }: FileRiskFactorsProps) {
  const getFactorIcon = (id: string) => {
    switch (id) {
      case 'churn':
        return <GitCommit className="h-4 w-4" />;
      case 'authors':
        return <Users className="h-4 w-4" />;
      case 'complexity':
        return <Cpu className="h-4 w-4" />;
      case 'age':
        return <Clock className="h-4 w-4" />;
      case 'bug_history':
        return <Bug className="h-4 w-4" />;
      case 'recent_changes':
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Risk Factor Breakdown
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {factors.length} Model Features Evaluated
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factors.map((factor) => {
          const borderHighlight =
            factor.level === 'CRITICAL' || factor.level === 'HIGH'
              ? 'border-rose-500/30 bg-rose-950/20'
              : factor.level === 'MEDIUM'
              ? 'border-amber-500/30 bg-amber-950/20'
              : 'border-emerald-500/30 bg-emerald-950/20';

          return (
            <div
              key={factor.id}
              className={`rounded-lg border p-4 transition-all duration-150 flex flex-col justify-between ${borderHighlight}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="p-1 rounded bg-slate-800/80 text-indigo-400">
                      {getFactorIcon(factor.id)}
                    </span>
                    <span className="text-xs font-bold text-white tracking-wide">
                      {factor.name}
                    </span>
                  </div>
                  <RiskBadge level={factor.level} size="sm" />
                </div>

                <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                  {factor.explanation}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Relative Contribution</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.level === 'CRITICAL' || factor.level === 'HIGH'
                          ? 'bg-rose-500'
                          : factor.level === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${factor.impactScore}%` }}
                    />
                  </div>
                  <span className="font-semibold text-slate-200">
                    {factor.impactScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

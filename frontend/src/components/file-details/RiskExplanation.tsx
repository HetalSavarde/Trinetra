import React from 'react';
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';

interface RiskExplanationProps {
  reasons: string[];
  recommendations?: string[];
  className?: string;
}

export function RiskExplanation({
  reasons,
  recommendations = [],
  className = '',
}: RiskExplanationProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Why is this file risky? */}
      <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-5 md:p-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 pb-4 border-b border-rose-500/20 text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Why is this file risky?
          </h3>
        </div>

        <p className="mt-3 text-xs text-slate-300">
          Trinetra&apos;s machine learning model correlated the following historical signals and code metrics:
        </p>

        <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span className="leading-relaxed font-sans">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Action / Mitigations */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/10 p-5 md:p-6 backdrop-blur-md">
        <div className="flex items-center gap-2.5 pb-4 border-b border-indigo-500/20 text-indigo-400">
          <Lightbulb className="h-5 w-5" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Recommended Mitigations
          </h3>
        </div>

        <p className="mt-3 text-xs text-slate-300">
          Recommended engineering safeguards to stabilize this hotspot before future releases:
        </p>

        <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
          {recommendations.length > 0 ? (
            recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="leading-relaxed font-sans">{rec}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-400">
              No immediate structural interventions required. Maintain current testing patterns.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

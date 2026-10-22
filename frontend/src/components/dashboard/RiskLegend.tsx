import React from 'react';

export function RiskLegend({ className = '' }: { className?: string }) {
  const tiers = [
    {
      dot: 'bg-emerald-500 shadow-emerald-500/50',
      label: 'Low Risk',
      range: '0 – 39',
      desc: 'Stable history, low churn & complexity',
    },
    {
      dot: 'bg-amber-500 shadow-amber-500/50',
      label: 'Medium Risk',
      range: '40 – 69',
      desc: 'Moderate modification frequency',
    },
    {
      dot: 'bg-orange-500 shadow-orange-500/50',
      label: 'High Risk',
      range: '70 – 89',
      desc: 'High churn, multiple authors, past bug fixes',
    },
    {
      dot: 'bg-rose-500 shadow-rose-500/50',
      label: 'Critical Risk',
      range: '90 – 100',
      desc: 'Urgent hotspot requiring architectural attention',
    },
  ];

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
            Risk Tier Classification
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div key={tier.label} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${tier.dot} shadow-sm shrink-0`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-200">
                    {tier.label}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({tier.range})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

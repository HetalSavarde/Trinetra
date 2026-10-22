'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { useIsMounted } from '@/lib/useIsMounted';

interface RiskDistributionProps {
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  criticalRiskCount?: number;
  totalFiles?: number;
  className?: string;
}

export function RiskDistribution({
  highRiskCount = 17,
  mediumRiskCount = 96,
  lowRiskCount = 135,
  criticalRiskCount = 4,
  totalFiles = 248,
  className = '',
}: RiskDistributionProps) {
  const isMounted = useIsMounted();

  const data = [
    { name: 'Critical Risk (90-100)', value: criticalRiskCount, color: '#ef4444' },
    { name: 'High Risk (70-89)', value: highRiskCount, color: '#f97316' },
    { name: 'Medium Risk (40-69)', value: mediumRiskCount, color: '#f59e0b' },
    { name: 'Low Risk (0-39)', value: lowRiskCount, color: '#10b981' },
  ];

  const calculatedTotal = totalFiles || data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/90 p-5 md:p-6 backdrop-blur-md flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Risk Distribution
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {calculatedTotal} files total
        </span>
      </div>

      {/* Donut Chart with centered label */}
      <div className="relative my-4 flex h-60 w-full items-center justify-center">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="#0f172a"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    const percent = Math.round(
                      ((item.value as number) / calculatedTotal) * 100
                    );
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-950 p-2.5 shadow-xl font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.payload.color }}
                          />
                          <span className="font-semibold text-white">
                            {item.name}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 text-slate-300">
                          <span>Count:</span>
                          <span className="font-bold text-white">
                            {item.value} files ({percent}%)
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-44 w-44 rounded-full border-4 border-slate-800 flex items-center justify-center animate-pulse" />
        )}

        {/* Center overlay label */}
        <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {calculatedTotal}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Total Files
          </span>
        </div>
      </div>

      {/* Legend list with counts and percentages */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        {data.map((item) => {
          const percent = Math.round((item.value / calculatedTotal) * 100);
          return (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-300">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">{item.value}</span>
                <span className="text-slate-500 w-10 text-right">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

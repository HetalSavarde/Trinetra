import React from 'react';
import { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  score,
  size = 'md',
  showDot = true,
  className = '',
}: RiskBadgeProps) {
  const levelConfig: Record<
    RiskLevel,
    { label: string; bg: string; text: string; border: string; dot: string }
  > = {
    CRITICAL: {
      label: 'CRITICAL',
      bg: 'bg-rose-950/60',
      text: 'text-rose-400',
      border: 'border-rose-500/40',
      dot: 'bg-rose-500',
    },
    HIGH: {
      label: 'HIGH',
      bg: 'bg-red-950/50',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-500',
    },
    MEDIUM: {
      label: 'MEDIUM',
      bg: 'bg-amber-950/50',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500',
    },
    LOW: {
      label: 'LOW',
      bg: 'bg-emerald-950/50',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500',
    },
  };

  const config = levelConfig[level] || levelConfig.LOW;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono uppercase tracking-wider ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`inline-block rounded-full ${config.dot} ${
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
          }`}
        />
      )}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="opacity-80 pl-0.5 font-sans font-bold">
          ({score})
        </span>
      )}
    </span>
  );
}

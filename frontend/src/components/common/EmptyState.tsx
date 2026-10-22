import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = <AlertCircle className="h-10 w-10 text-slate-500" />,
  actionText,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center ${className}`}
    >
      <div className="mb-4 rounded-full bg-slate-800/80 p-3">{icon}</div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400">{description}</p>
      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <Button href={actionHref} size="sm" variant="primary">
              {actionText}
            </Button>
          ) : (
            <Button onClick={onAction} size="sm" variant="primary">
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

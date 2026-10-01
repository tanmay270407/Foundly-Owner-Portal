import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-2 shadow-xs transition-colors hover:border-neutral-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500 truncate">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
            {badge}
          </span>
        )}
      </div>

      {subtext && <p className="text-[11px] text-neutral-500 truncate">{subtext}</p>}
    </div>
  );
};

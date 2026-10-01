import React from 'react';
import { Users } from 'lucide-react';

interface ActiveUsersChartProps {
  data: { name: string; count: number }[];
  isSpecificCollege: boolean;
}

export const ActiveUsersChart: React.FC<ActiveUsersChartProps> = ({
  data,
  isSpecificCollege,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-900" />
          <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Active Campus Users</h3>
        </div>
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400">
          No campus active user records available.
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 5);

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
              {isSpecificCollege ? 'Campus Active Personnel' : 'Active Users Across Colleges'}
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            {isSpecificCollege
              ? 'Active user volume for selected institution'
              : 'Institutional active member distribution'}
          </p>
        </div>
      </div>

      {/* Horizontal Bar Breakdown */}
      <div className="space-y-3 pt-2">
        {data.slice(0, 6).map((item, i) => {
          const widthPct = Math.max((item.count / maxCount) * 100, 3);

          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-900 font-medium truncate max-w-[240px]">
                  {item.name}
                </span>
                <span className="font-mono text-neutral-950 font-semibold tabular-nums">
                  {item.count.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${widthPct}%` }}
                  className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

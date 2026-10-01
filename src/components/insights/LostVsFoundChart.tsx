import React from 'react';
import { TimelineDataPoint } from '../../types';
import { Search, Compass } from 'lucide-react';

interface LostVsFoundChartProps {
  data: TimelineDataPoint[];
  totalLost: number;
  totalFound: number;
}

export const LostVsFoundChart: React.FC<LostVsFoundChartProps> = ({
  data,
  totalLost,
  totalFound,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-neutral-900" />
          <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Lost vs. Found Reports</h3>
        </div>
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400">
          No lost or found item activity in this time period.
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.lost, d.found)), 5);

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
              Lost vs. Found Reports
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Item posting comparison over time</p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-neutral-950 inline-block" />
            <span className="text-neutral-600 font-medium">Lost: {totalLost}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-neutral-400 inline-block" />
            <span className="text-neutral-600 font-medium">Found: {totalFound}</span>
          </div>
        </div>
      </div>

      {/* Grouped Bar Visualizer */}
      <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 pb-1 border-b border-neutral-200">
        {data.map((d, i) => {
          const lostHeightPct = Math.max((d.lost / maxVal) * 100, 4);
          const foundHeightPct = Math.max((d.found / maxVal) * 100, 4);

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Lost Bar */}
                <div
                  style={{ height: `${d.lost === 0 ? 3 : lostHeightPct}%` }}
                  className={`w-3 sm:w-4 rounded-t-xs transition-all ${
                    d.lost === 0
                      ? 'bg-neutral-200'
                      : 'bg-neutral-950 group-hover:bg-black'
                  }`}
                  title={`Lost: ${d.lost} (${d.label})`}
                />

                {/* Found Bar */}
                <div
                  style={{ height: `${d.found === 0 ? 3 : foundHeightPct}%` }}
                  className={`w-3 sm:w-4 rounded-t-xs transition-all ${
                    d.found === 0
                      ? 'bg-neutral-200'
                      : 'bg-neutral-400 group-hover:bg-neutral-500'
                  }`}
                  title={`Found: ${d.found} (${d.label})`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-Axis labels */}
      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono px-1">
        {data.map((d, i) => (
          <span key={i} className="truncate max-w-[55px] text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

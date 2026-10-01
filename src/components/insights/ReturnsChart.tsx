import React from 'react';
import { TimelineDataPoint } from '../../types';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReturnsChartProps {
  data: TimelineDataPoint[];
  totalReturns: number;
  totalClaims: number;
}

export const ReturnsChart: React.FC<ReturnsChartProps> = ({
  data,
  totalReturns,
  totalClaims,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-neutral-900" />
          <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">Successful Returns</h3>
        </div>
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400">
          No return or claim activity records available.
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.returns, d.claims)), 5);
  const resolutionRate = totalClaims > 0 ? Math.round((totalReturns / totalClaims) * 100) : 100;

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
              Item Returns & Resolution
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">Successful returns and claim handoffs</p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-base font-bold font-mono text-neutral-950 tabular-nums">
              {totalReturns.toLocaleString()}
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
              {resolutionRate}% Rate
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">
            Total Returned Items
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 pb-1 border-b border-neutral-200">
        {data.map((d, i) => {
          const returnsHeight = Math.max((d.returns / maxVal) * 100, 4);

          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
              <span className="text-[10px] font-mono text-neutral-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {d.returns}
              </span>
              <div
                style={{ height: `${d.returns === 0 ? 3 : returnsHeight}%` }}
                className={`w-full max-w-[36px] rounded-t-xs transition-all ${
                  d.returns === 0
                    ? 'bg-neutral-200'
                    : 'bg-neutral-900 group-hover:bg-black'
                }`}
                title={`Returns: ${d.returns} (${d.label})`}
              />
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

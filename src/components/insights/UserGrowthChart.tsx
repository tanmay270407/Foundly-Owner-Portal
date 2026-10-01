import React from 'react';
import { TimelineDataPoint } from '../../types';
import { TrendingUp, Users } from 'lucide-react';

interface UserGrowthChartProps {
  data: TimelineDataPoint[];
  collegeName: string;
}

export const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data, collegeName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-neutral-900" />
          <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">User Growth Over Time</h3>
        </div>
        <div className="h-44 flex items-center justify-center text-xs text-neutral-400">
          No user growth records available for the selected range.
        </div>
      </div>
    );
  }

  const values = data.map((d) => d.users);
  const maxVal = Math.max(...values, 5);
  const minVal = 0;
  const width = 500;
  const height = 160;
  const paddingX = 35;
  const paddingY = 20;

  const getX = (index: number) => {
    if (data.length <= 1) return width / 2;
    return paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (val: number) => {
    return height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.users)}`).join(' ');
  const areaPath = `M ${getX(0)},${height - paddingY} L ${data.map((d, i) => `${getX(i)},${getY(d.users)}`).join(' L ')} L ${getX(data.length - 1)},${height - paddingY} Z`;

  const totalCurrent = values[values.length - 1] || 0;

  return (
    <div className="p-5 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-900" />
            <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
              User Growth Trend
            </h3>
          </div>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Cumulative registered users for {collegeName}
          </p>
        </div>
        <div className="text-right">
          <span className="text-base font-bold font-mono text-neutral-950 tabular-nums">
            {totalCurrent.toLocaleString()}
          </span>
          <span className="block text-[10px] text-neutral-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#e5e5e5"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#e5e5e5"
            strokeDasharray="3 3"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#d4d4d4"
          />

          {/* Fill Area Gradient */}
          <defs>
            <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#171717" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#171717" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#userGrowthGradient)" />

          {/* Main Line */}
          <polyline
            fill="none"
            stroke="#171717"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {data.map((d, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={getX(i)}
                cy={getY(d.users)}
                r="3.5"
                className="fill-white stroke-neutral-950 stroke-2 group-hover:r-5 transition-all"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* X-Axis labels */}
      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono px-2 pt-1 border-t border-neutral-100">
        {data.map((d, i) => (
          <span key={i} className="truncate max-w-[60px] text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
};

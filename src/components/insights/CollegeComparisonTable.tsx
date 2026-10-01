import React from 'react';
import { CollegeComparisonItem } from '../../types';
import { Building2, Layers } from 'lucide-react';

interface CollegeComparisonTableProps {
  data: CollegeComparisonItem[];
}

export const CollegeComparisonTable: React.FC<CollegeComparisonTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-2 text-center text-xs text-neutral-400">
        No comparative college records available.
      </div>
    );
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-900" />
          <h3 className="text-xs font-bold text-neutral-950 uppercase tracking-wider">
            Institutional Activity Overview
          </h3>
        </div>
        <p className="text-[11px] text-neutral-500">
          Factual summary of campus lost & found metrics across registered colleges
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">College</th>
              <th className="py-3 px-4 text-right font-mono">Users</th>
              <th className="py-3 px-4 text-right font-mono">Active</th>
              <th className="py-3 px-4 text-right font-mono">Lost</th>
              <th className="py-3 px-4 text-right font-mono">Found</th>
              <th className="py-3 px-4 text-right font-mono">Claims</th>
              <th className="py-3 px-4 text-right font-mono">Returns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {data.map((item) => (
              <tr key={item.collegeId} className="hover:bg-neutral-50/80 transition-colors">
                {/* College Name */}
                <td className="py-3.5 px-4 font-semibold text-neutral-950">
                  <div className="flex items-center gap-2 truncate max-w-[220px]">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{item.collegeName}</span>
                  </div>
                </td>

                {/* Total Users */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-800">
                  {item.users.toLocaleString()}
                </td>

                {/* Active Users */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-950 font-medium">
                  {item.activeUsers.toLocaleString()}
                </td>

                {/* Lost Items */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-700">
                  {item.lost.toLocaleString()}
                </td>

                {/* Found Items */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-700">
                  {item.found.toLocaleString()}
                </td>

                {/* Claims */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-700">
                  {item.claims.toLocaleString()}
                </td>

                {/* Returns */}
                <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-neutral-950">
                  {item.returns.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

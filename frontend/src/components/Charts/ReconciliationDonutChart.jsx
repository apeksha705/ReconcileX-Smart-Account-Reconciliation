import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ReconciliationDonutChart({ matched = 0, needsReview = 0, unmatched = 0 }) {
  const total = matched + needsReview + unmatched;
  const matchRate = total > 0 ? Math.round((matched / total) * 100) : 0;

  const data = [
    { name: 'Matched', value: matched, color: '#0B3C2C' },
    { name: 'Needs Review', value: needsReview, color: '#8A5C14' },
    { name: 'Unmatched', value: unmatched, color: '#9E3626' },
  ].filter((d) => d.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return (
        <div className="bg-[#1A1A1A] text-[#FAF9F6] p-2.5 rounded-xl shadow-xl text-xs border border-[#333]">
          <p className="font-bold flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.payload.color }}
            />
            {item.name}
          </p>
          <p className="font-mono text-[#D4E2D4] mt-1">
            {item.value} transactions ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E2DFD4] shadow-xs flex flex-col justify-between h-full">
      <div>
        <h4 className="text-sm font-black text-[#1A1A1A]">Reconciliation Breakdown</h4>
        <p className="text-xs text-[#6B786B] font-medium">3-Way matching distribution</p>
      </div>

      <div className="relative h-48 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length > 0 ? data : [{ name: 'Empty', value: 1, color: '#D4E2D4' }]}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#FAF9F6" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-[#0B3C2C] font-mono tracking-tight">
            {matchRate}%
          </span>
          <span className="text-[10px] uppercase font-bold text-[#6B786B]">Match Rate</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EAE7DC] text-center">
        <div className="p-2 rounded-xl bg-[#D4E2D4]/50 border border-[#B8CEB8]">
          <p className="text-[10px] font-bold text-[#0B3C2C] uppercase">Matched</p>
          <p className="text-sm font-black text-[#0B3C2C] font-mono">{matched}</p>
        </div>
        <div className="p-2 rounded-xl bg-[#FAF0D9] border border-[#E8D8B0]">
          <p className="text-[10px] font-bold text-[#8A5C14] uppercase">Review</p>
          <p className="text-sm font-black text-[#8A5C14] font-mono">{needsReview}</p>
        </div>
        <div className="p-2 rounded-xl bg-[#FDEBE8] border border-[#F2C0B8]">
          <p className="text-[10px] font-bold text-[#9E3626] uppercase">Unmatched</p>
          <p className="text-sm font-black text-[#9E3626] font-mono">{unmatched}</p>
        </div>
      </div>
    </div>
  );
}

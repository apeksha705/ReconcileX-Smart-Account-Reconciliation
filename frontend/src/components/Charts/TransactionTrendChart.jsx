import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function TransactionTrendChart() {
  const trendData = [
    { date: '18 Aug', matched: 142, review: 18, unmatched: 6 },
    { date: '19 Aug', matched: 198, review: 24, unmatched: 11 },
    { date: '20 Aug', matched: 235, review: 19, unmatched: 8 },
    { date: '21 Aug', matched: 180, review: 28, unmatched: 14 },
    { date: '22 Aug', matched: 260, review: 22, unmatched: 9 },
    { date: '23 Aug', matched: 310, review: 15, unmatched: 12 },
    { date: '24 Aug', matched: 284, review: 12, unmatched: 7 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A1A1A] text-[#FAF9F6] p-3 rounded-xl shadow-xl text-xs border border-[#333]">
          <p className="font-bold text-[#D4E2D4] mb-1.5 border-b border-[#333] pb-1">
            {label} 2026
          </p>
          <div className="space-y-1">
            <p className="flex items-center justify-between gap-4 text-[#D4E2D4]">
              <span>Matched:</span>
              <span className="font-mono font-bold">{payload[0]?.value}</span>
            </p>
            <p className="flex items-center justify-between gap-4 text-[#E8D8B0]">
              <span>Needs Review:</span>
              <span className="font-mono font-bold">{payload[1]?.value}</span>
            </p>
            <p className="flex items-center justify-between gap-4 text-[#F2C0B8]">
              <span>Unmatched:</span>
              <span className="font-mono font-bold">{payload[2]?.value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E2DFD4] shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-black text-[#1A1A1A]">Reconciliation Velocity</h4>
          <p className="text-xs text-[#6B786B] font-medium">Daily volume by status</p>
        </div>
        <span className="text-[10px] font-bold text-[#0B3C2C] bg-[#D4E2D4] border border-[#B8CEB8] px-2.5 py-0.5 rounded-md">
          Last 7 Days
        </span>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE7DC" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B786B' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B786B' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Bar dataKey="matched" name="Matched" fill="#0B3C2C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="review" name="Needs Review" fill="#8A5C14" radius={[4, 4, 0, 0]} />
            <Bar dataKey="unmatched" name="Unmatched" fill="#9E3626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

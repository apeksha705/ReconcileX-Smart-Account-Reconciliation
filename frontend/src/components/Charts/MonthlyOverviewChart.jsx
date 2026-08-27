import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function MonthlyOverviewChart() {
  const monthlyData = [
    { month: 'May', accuracy: 88, volume: 890, amount: '₹14.2L' },
    { month: 'Jun', accuracy: 91, volume: 1040, amount: '₹18.9L' },
    { month: 'Jul', accuracy: 93, volume: 1180, amount: '₹22.4L' },
    { month: 'Aug', accuracy: 96, volume: 1248, amount: '₹26.8L' },
  ];

  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E2DFD4] shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-black text-[#1A1A1A]">Monthly Accuracy Trend</h4>
          <p className="text-xs text-[#6B786B] font-medium">AI learning rate over 4 cycles</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#0B3C2C] bg-[#D4E2D4] px-2.5 py-0.5 rounded-md border border-[#B8CEB8]">
            +8.2% Growth
          </span>
        </div>
      </div>

      <div className="h-36 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="accuracyForestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B3C2C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D4E2D4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B786B' }}
            />
            <YAxis
              domain={[75, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#6B786B' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}% Auto-Matched`, 'Accuracy']}
              contentStyle={{
                backgroundColor: '#1A1A1A',
                color: '#FAF9F6',
                borderRadius: '12px',
                border: '1px solid #333',
                fontSize: '11px',
              }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke="#0B3C2C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#accuracyForestGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#EAE7DC] text-center">
        {monthlyData.map((m) => (
          <div key={m.month} className="p-1.5 rounded-xl bg-[#F0EFEB] border border-[#E2DFD4]">
            <p className="text-[10px] text-[#6B786B] uppercase font-bold">{m.month}</p>
            <p className="text-xs font-mono font-black text-[#1A1A1A]">{m.accuracy}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

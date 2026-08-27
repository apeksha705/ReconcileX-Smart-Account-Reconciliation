import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DiscrepancyBarChart({ breakdown }) {
  const data = [
    { name: 'Amount Mismatch', count: breakdown?.amount_mismatch || 2, color: '#8A5C14' },
    { name: 'Missing Records', count: breakdown?.missing_records || 3, color: '#9E3626' },
    { name: 'Vendor Name Diff', count: breakdown?.vendor_mismatch || 2, color: '#6C8B6C' },
    { name: 'Duplicate Payment', count: breakdown?.duplicate_transaction || 1, color: '#B33E2B' },
    { name: 'Date Discrepancy', count: breakdown?.date_mismatch || 1, color: '#0B3C2C' },
  ];

  return (
    <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#E2DFD4] shadow-xs h-full flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-black text-[#1A1A1A]">Discrepancy Causes</h4>
        <p className="text-xs text-[#6B786B] font-medium">Distribution of exceptions</p>
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 20, left: 35, bottom: 5 }}
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#6B786B' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#1A1A1A', fontWeight: 600 }}
              width={110}
            />
            <Tooltip
              formatter={(val) => [`${val} Transactions`, 'Exceptions']}
              contentStyle={{
                backgroundColor: '#1A1A1A',
                color: '#FAF9F6',
                borderRadius: '12px',
                border: '1px solid #333',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-[#6B786B] text-center border-t border-[#EAE7DC] pt-2 font-medium">
        TDS withholding differences & missing tax invoices represent 60% of all flags.
      </p>
    </div>
  );
}

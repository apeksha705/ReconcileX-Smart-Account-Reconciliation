import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

export default function ConfidenceScore({ score, showBar = true, size = 'md' }) {
  const num = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  let colorClass = 'text-[#0B3C2C] bg-[#D4E2D4]/70 border-[#B8CEB8]';
  let barColor = 'bg-[#0B3C2C]';
  let Icon = ShieldCheck;

  if (num < 50) {
    colorClass = 'text-[#9E3626] bg-[#FDEBE8] border-[#F2C0B8]';
    barColor = 'bg-[#9E3626]';
    Icon = AlertCircle;
  } else if (num < 85) {
    colorClass = 'text-[#8A5C14] bg-[#FAF0D9] border-[#E8D8B0]';
    barColor = 'bg-[#8A5C14]';
    Icon = ShieldAlert;
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
        <span className={`px-2 py-0.5 rounded-md border ${colorClass}`}>
          {num}%
        </span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${num >= 85 ? 'text-[#0B3C2C]' : num >= 50 ? 'text-[#8A5C14]' : 'text-[#9E3626]'}`} />
            <span className="text-sm font-bold text-[#1A1A1A]">Match Confidence</span>
          </div>
          <span className={`text-xl font-black font-mono ${num >= 85 ? 'text-[#0B3C2C]' : num >= 50 ? 'text-[#8A5C14]' : 'text-[#9E3626]'}`}>
            {num}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-[#EAE8DE] rounded-full overflow-hidden border border-[#DCD8CC]">
          <div
            className={`h-full ${barColor} transition-all duration-500 ease-out`}
            style={{ width: `${num}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-[#EAE8DE] rounded-full overflow-hidden border border-[#DCD8CC]">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${num}%` }}
        />
      </div>
      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
        {num}%
      </span>
    </div>
  );
}

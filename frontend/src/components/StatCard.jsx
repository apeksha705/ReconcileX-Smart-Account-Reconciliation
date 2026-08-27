import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  subtext,
  variant = 'default', // 'default' | 'matched' | 'review' | 'unmatched'
  onClick,
}) {
  const variantStyles = {
    default: {
      card: 'border-[#E2DFD4] hover:border-[#CBD3CB] bg-[#FAF9F6]',
      iconBg: 'bg-[#EAE8DE] text-[#1A1A1A]',
      indicator: 'bg-[#1A1A1A]',
    },
    matched: {
      card: 'border-[#B8CEB8] bg-gradient-to-b from-[#D4E2D4]/30 to-[#FAF9F6] hover:border-[#8EA88E]',
      iconBg: 'bg-[#D4E2D4] text-[#0B3C2C]',
      indicator: 'bg-[#0B3C2C]',
    },
    review: {
      card: 'border-[#E8D8B0] bg-gradient-to-b from-[#FAF0D9]/40 to-[#FAF9F6] hover:border-[#D8C490]',
      iconBg: 'bg-[#FAF0D9] text-[#8A5C14]',
      indicator: 'bg-[#8A5C14]',
    },
    unmatched: {
      card: 'border-[#F2C0B8] bg-gradient-to-b from-[#FDEBE8]/40 to-[#FAF9F6] hover:border-[#E8A49A]',
      iconBg: 'bg-[#FDEBE8] text-[#9E3626]',
      indicator: 'bg-[#9E3626]',
    },
  }[variant] || variantStyles.default;

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border shadow-xs transition-all duration-200 fintech-card-hover ${
        variantStyles.card
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${variantStyles.indicator}`} />
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B786B]">
              {title}
            </p>
          </div>
          <h3 className="mt-2 text-2xl lg:text-3xl font-black text-[#1A1A1A] font-mono tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </h3>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${variantStyles.iconBg} shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || subtext) && (
        <div className="mt-3.5 flex items-center gap-2 pt-3 border-t border-[#EAE7DC]">
          {change && (
            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                changeType === 'positive'
                  ? 'bg-[#D4E2D4] text-[#0B3C2C]'
                  : changeType === 'negative'
                  ? 'bg-[#FDEBE8] text-[#9E3626]'
                  : 'bg-[#EAE8DE] text-[#4A554A]'
              }`}
            >
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : changeType === 'negative' ? (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              )}
              {change}
            </span>
          )}
          {subtext && (
            <span className="text-xs text-[#6B786B] truncate font-medium">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

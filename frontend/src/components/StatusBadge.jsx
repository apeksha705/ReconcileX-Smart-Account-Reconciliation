import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function StatusBadge({ status, size = 'md', showIcon = true }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');

  const configs = {
    matched: {
      label: 'MATCHED',
      bg: 'bg-[#D4E2D4]/70 text-[#0B3C2C] border-[#B8CEB8]',
      dot: 'bg-[#0B3C2C]',
      icon: CheckCircle2,
    },
    needs_review: {
      label: 'NEEDS REVIEW',
      bg: 'bg-[#FAF0D9] text-[#8A5C14] border-[#E8D8B0]',
      dot: 'bg-[#8A5C14]',
      icon: AlertTriangle,
    },
    unmatched: {
      label: 'UNMATCHED',
      bg: 'bg-[#FDEBE8] text-[#9E3626] border-[#F2C0B8]',
      dot: 'bg-[#9E3626]',
      icon: XCircle,
    },
    pending: {
      label: 'PENDING',
      bg: 'bg-[#EAE8DE] text-[#4A554A] border-[#D4D0C0]',
      dot: 'bg-[#7A8A7A]',
      icon: Clock,
    }
  };

  const config = configs[normalized] || configs.pending;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${config.bg} ${sizeClasses} shadow-2xs font-mono`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
}

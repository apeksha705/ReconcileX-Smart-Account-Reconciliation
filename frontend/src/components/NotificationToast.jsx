import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', title, message } = toast;

  // Define the styles map as a named const FIRST, then look up — prevents
  // the "styles is not defined" ReferenceError when type is an unknown value.
  const stylesMap = {
    success: {
      bg: 'bg-[#1A1A1A] text-[#FAF9F6] border-[#0B3C2C]',
      icon: CheckCircle2,
      iconColor: 'text-[#D4E2D4]',
    },
    warning: {
      bg: 'bg-[#1A1A1A] text-[#FAF9F6] border-[#8A5C14]',
      icon: AlertTriangle,
      iconColor: 'text-[#E8D8B0]',
    },
    error: {
      bg: 'bg-[#1A1A1A] text-[#FAF9F6] border-[#9E3626]',
      icon: AlertTriangle,
      iconColor: 'text-[#F2C0B8]',
    },
    info: {
      bg: 'bg-[#1A1A1A] text-[#FAF9F6] border-[#333]',
      icon: Info,
      iconColor: 'text-[#D4E2D4]',
    },
  };

  const styles = stylesMap[type] || stylesMap.info;
  const IconComponent = styles.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${styles.bg}`}>
        <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
        <div className="flex-1 pr-2">
          {title && <p className="text-xs font-bold text-[#FAF9F6] leading-tight">{title}</p>}
          <p className="text-xs text-[#D4E2D4] mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#8C8C8C] hover:text-[#FAF9F6] p-0.5 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

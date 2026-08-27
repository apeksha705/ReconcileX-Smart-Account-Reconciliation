import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  RefreshCw,
  ReceiptText,
  AlertOctagon,
  BarChart3,
  History as HistoryIcon,
  Settings,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ pendingExceptionsCount = 0, currentUser }) {
  const businessName = currentUser?.business || 'Apex Retail & Logistics';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/reconcile',
      label: 'Reconciliation',
      icon: RefreshCw,
      badge: 'Engine',
      badgeColor: 'bg-[#D4E2D4] text-[#0B3C2C] font-semibold',
    },
    {
      to: '/transactions',
      label: 'Transactions',
      icon: ReceiptText,
    },
    {
      to: '/exceptions',
      label: 'Exceptions',
      icon: AlertOctagon,
      badge: pendingExceptionsCount > 0 ? String(pendingExceptionsCount) : null,
      badgeColor: 'bg-[#D4E2D4] text-[#0B3C2C] font-bold border border-[#B8CEB8]',
    },
    {
      to: '/history',
      label: 'History',
      icon: HistoryIcon,
      badge: 'Audit',
      badgeColor: 'bg-[#D4E2D4] text-[#0B3C2C] font-semibold',
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1A1A1A] text-[#E5E5E5] flex flex-col justify-between border-r border-[#2D2D2D] select-none min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#2D2D2D] bg-[#141414]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B3C2C] to-[#134E39] border border-[#1E6B50] flex items-center justify-center text-[#D4E2D4] shadow-md shadow-[#0B3C2C]/30">
              <ShieldCheck className="w-5 h-5 text-[#D4E2D4]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-[#FAF9F6] tracking-wider">RECONCILE</span>
                <span className="text-sm font-black text-[#D4E2D4]">X</span>
              </div>
              <p className="text-[10px] text-[#A3A3A3] font-medium tracking-wide uppercase">Smart Account Engine</p>
            </div>
          </div>
        </div>

        {/* Business Entity Banner */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-[#242424] border border-[#333333] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-[#2E2E2E] text-[#D4E2D4]">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#FAF9F6] truncate">{businessName}</p>
              <p className="text-[10px] text-[#D4E2D4] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4E2D4] animate-pulse"></span>
                Reconciled (Aug 2026)
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-2">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#737373]">
            Navigation Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#0B3C2C] text-[#FAF9F6] border border-[#1A5943] shadow-sm shadow-[#0B3C2C]/40 font-bold'
                      : 'text-[#A3A3A3] hover:text-[#FAF9F6] hover:bg-[#262626]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`w-4 h-4 transition-transform duration-150 ${
                          isActive ? 'text-[#D4E2D4]' : 'text-[#8C8C8C] group-hover:text-[#D4E2D4]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          isActive ? 'bg-[#134E39] text-[#D4E2D4] border border-[#1E6B50]' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      isActive && <ChevronRight className="w-3.5 h-3.5 text-[#D4E2D4]/70" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#2D2D2D] bg-[#141414]">
        <div className="flex items-center justify-between text-[11px] text-[#A3A3A3] mb-1.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D4E2D4]" />
            AI Engine Online
          </span>
          <span className="font-mono text-[10px] bg-[#262626] border border-[#333] px-1.5 py-0.5 rounded text-[#D4E2D4]">v2.4 MVP</span>
        </div>
        <div className="text-[10px] text-[#737373]">
          Multi-Ledger Automated Reconciliation
        </div>
      </div>
    </aside>
  );
}

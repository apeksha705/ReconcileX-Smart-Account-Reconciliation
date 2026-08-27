import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { reconciliationService } from '../services/reconciliationService';

export default function Topbar({ onRefreshData, searchQuery, setSearchQuery, currentUser, onSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const userName = currentUser?.name || 'Ananya Deshmukh';
  const userRole = currentUser?.role || 'Head of Finance';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'AD';
  const businessName = currentUser?.business || 'Apex Retail & Logistics';
  const gstin = currentUser?.gstin || '27AAACA9918B1ZX';

  const notifications = [
    {
      id: 1,
      title: 'Discrepancy Flagged',
      desc: 'TXN-1087: ₹500 difference detected on Zeta Tech Solutions invoice.',
      time: '12m ago',
      type: 'warning',
      unread: true,
      link: '/exceptions'
    },
    {
      id: 2,
      title: 'Duplicate Payment Prevented',
      desc: 'TXN-1134: Two ₹50,000 NEFT transfers identified for Kavita Marketing.',
      time: '1h ago',
      type: 'warning',
      unread: true,
      link: '/exceptions'
    },
    {
      id: 3,
      title: 'Batch Reconciled',
      desc: 'August 2026 Batch #881 completed with 94.2% automated match rate.',
      time: '3h ago',
      type: 'success',
      unread: false,
      link: '/reports'
    }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    reconciliationService.resetToDefaultData();
    if (onRefreshData) onRefreshData();
  };

  return (
    <header className="h-16 bg-[#FAF9F6] border-b border-[#E5E2D9] px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7A8A7A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions, vendors, invoice #, amounts..."
            value={searchQuery || ''}
            onChange={(e) => {
              if (setSearchQuery) setSearchQuery(e.target.value);
              if (location.pathname !== '/transactions' && e.target.value.length > 1) {
                navigate(`/transactions?q=${encodeURIComponent(e.target.value)}`);
              }
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F0EFEB] border border-[#DBD7CB] rounded-xl text-[#1A1A1A] placeholder-[#8A958A] focus:outline-none focus:ring-2 focus:ring-[#0B3C2C]/20 focus:border-[#0B3C2C] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A8A7A] hover:text-[#1A1A1A]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Reset */}
        <button
          onClick={handleResetData}
          title="Reset dataset to initial state"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B3C2C] bg-[#D4E2D4]/50 hover:bg-[#D4E2D4] border border-[#B8CEB8] rounded-xl transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#0B3C2C]" />
          <span>Reset</span>
        </button>

        {/* Primary Action Button */}
        {location.pathname !== '/reconcile' && (
          <button
            onClick={() => navigate('/reconcile')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-[#FAF9F6] bg-[#0B3C2C] hover:bg-[#134E39] rounded-xl shadow-xs shadow-[#0B3C2C]/30 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4E2D4]" />
            <span>New Reconciliation</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadCount(0);
            }}
            className="relative p-2 text-[#4A554A] hover:text-[#1A1A1A] hover:bg-[#EAE8DE] rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#9E3626] rounded-full ring-2 ring-[#FAF9F6]" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#DCD8CC] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-[#EAE7DC] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1A1A]">Reconciliation Alerts</h4>
                  <p className="text-[10px] text-[#6B786B]">Real-time discrepancy & audit logs</p>
                </div>
                <span className="text-[10px] font-semibold text-[#0B3C2C] bg-[#D4E2D4] px-2 py-0.5 rounded-md">
                  Live Engine
                </span>
              </div>

              <div className="divide-y divide-[#EAE7DC] max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate(n.link);
                    }}
                    className="p-3.5 hover:bg-[#F2F0E6] cursor-pointer transition-colors flex items-start gap-3"
                  >
                    <div className="mt-0.5">
                      {n.type === 'warning' ? (
                        <div className="p-1.5 rounded-lg bg-[#FAF0D9] text-[#9E6514]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-[#D4E2D4] text-[#0B3C2C]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#1A1A1A]">{n.title}</p>
                        <span className="text-[10px] text-[#7A857A] font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#4A554A] mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2 border-t border-[#EAE7DC] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/exceptions');
                  }}
                  className="text-xs font-bold text-[#0B3C2C] hover:text-[#134E39] inline-flex items-center gap-1"
                >
                  <span>View all exceptions queue</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative pl-2 border-l border-[#E2DFD4]" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#EAE8DE] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-[#D4E2D4] font-bold text-xs flex items-center justify-center border border-[#333] shadow-xs">
              {userInitials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-[#1A1A1A] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#6B786B] font-medium">{userRole}</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F6] rounded-2xl shadow-2xl border border-[#DCD8CC] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-[#EAE7DC]">
                <p className="text-xs font-bold text-[#1A1A1A]">{businessName}</p>
                <p className="text-[10px] text-[#6B786B]">GSTIN: {gstin}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#EAE8DE]"
                >
                  Matching Preferences
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/reports');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-[#1A1A1A] hover:bg-[#EAE8DE]"
                >
                  Audit Reports
                </button>
              </div>
              <div className="pt-1 border-t border-[#EAE7DC]">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onSignOut) {
                      onSignOut();
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#9E3626] hover:bg-[#FCEAE6] transition-colors flex items-center justify-between"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

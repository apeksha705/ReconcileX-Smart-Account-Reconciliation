import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import NotificationToast from './components/NotificationToast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reconciliation from './pages/Reconciliation';
import Transactions from './pages/Transactions';
import Exceptions from './pages/Exceptions';
import Reports from './pages/Reports';
import History from './pages/History';
import Settings from './pages/Settings';

import { reconciliationService } from './services/reconciliationService';

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout({ children, toast, setToast, pendingExceptionsCount, onRefreshData, searchQuery, setSearchQuery, currentUser, onSignOut }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] font-sans">
        {children}
        <NotificationToast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FAF9F6] overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar pendingExceptionsCount={pendingExceptionsCount} currentUser={currentUser} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAF9F6]">
        <Topbar
          onRefreshData={onRefreshData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onSignOut={onSignOut}
        />

        <main className="flex-1 overflow-y-auto bg-[#FAF9F6]">
          {children}
        </main>
      </div>

      {/* Toast Notification */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('reconcilex_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [toast, setToast] = useState(null);
  const [pendingExceptionsCount, setPendingExceptionsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const updateGlobalStats = async () => {
    try {
      const stats = await reconciliationService.getDashboardStats();
      setPendingExceptionsCount(stats.needsReview || 0);
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    updateGlobalStats();
  }, [refreshKey]);

  const handleRefreshData = () => {
    setRefreshKey((k) => k + 1);
    showToast('info', 'Dataset Refreshed', 'Ledger records reset to default state');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast('success', 'Welcome Back', `Signed in as ${user.name}`);
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem('reconcilex_auth_user');
    } catch (err) {
      console.warn(err);
    }
    setCurrentUser(null);
    showToast('info', 'Signed Out', 'You have been safely signed out.');
  };

  return (
    <BrowserRouter>
      <AppLayout
        toast={toast}
        setToast={setToast}
        pendingExceptionsCount={pendingExceptionsCount}
        onRefreshData={handleRefreshData}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onSignOut={handleSignOut}
      >
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={currentUser}>
                <Dashboard showToast={showToast} onDataUpdated={updateGlobalStats} currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reconcile"
            element={
              <ProtectedRoute user={currentUser}>
                <Reconciliation showToast={showToast} onDataUpdated={updateGlobalStats} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute user={currentUser}>
                <Transactions showToast={showToast} onDataUpdated={updateGlobalStats} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exceptions"
            element={
              <ProtectedRoute user={currentUser}>
                <Exceptions showToast={showToast} onDataUpdated={updateGlobalStats} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute user={currentUser}>
                <Reports showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute user={currentUser}>
                <History showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute user={currentUser}>
                <Settings showToast={showToast} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

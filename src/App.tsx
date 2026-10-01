import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OwnerLogin } from './components/auth/OwnerLogin';
import { AccessDenied } from './components/auth/AccessDenied';
import { OwnerLayout } from './components/layout/OwnerLayout';
import { NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { CollegesPage } from './pages/CollegesPage';
import { AdminRequestsPage } from './pages/AdminRequestsPage';
import { CollegeAdminsPage } from './pages/CollegeAdminsPage';
import { CollegeInsightsPage } from './pages/CollegeInsightsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function AppContent() {
  const { user, isOwner, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCallback, setRefreshCallback] = useState<(() => void) | null>(null);

  // Sync with URL hash for persistent tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavTab;
      const validTabs: NavTab[] = [
        'dashboard',
        'colleges',
        'admin-requests',
        'college-admins',
        'college-insights',
        'activity-logs',
        'settings',
      ];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
  };

  const handleRefresh = async () => {
    if (refreshCallback) {
      setIsRefreshing(true);
      try {
        await refreshCallback();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // 1. Loading authentication verification state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" message="Verifying Owner Authorization..." />
      </div>
    );
  }

  // 2. Unauthenticated: Show Owner Login
  if (!user) {
    return <OwnerLogin />;
  }

  // 3. Authenticated but unauthorized (Non-Owner role): Show Access Denied
  if (!isOwner) {
    return <AccessDenied />;
  }

  // 4. Authenticated & Verified Owner: Render Owner Portal
  return (
    <OwnerLayout
      currentTab={currentTab}
      onSelectTab={handleSelectTab}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigate={handleSelectTab}
          onRefreshTrigger={(fn) => setRefreshCallback(() => fn)}
        />
      )}
      {currentTab === 'colleges' && <CollegesPage />}
      {currentTab === 'admin-requests' && <AdminRequestsPage />}
      {currentTab === 'college-admins' && <CollegeAdminsPage />}
      {currentTab === 'college-insights' && <CollegeInsightsPage />}
      {currentTab === 'activity-logs' && <ActivityLogsPage />}
      {currentTab === 'settings' && <SettingsPage />}
    </OwnerLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

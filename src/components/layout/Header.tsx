import React from 'react';
import { Menu, RefreshCw, Database, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onToggleMobileMenu: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Platform Overview', subtitle: 'Global college network and administrator requests' },
  colleges: { title: 'Colleges Directory', subtitle: 'Registered universities and campus configurations' },
  'admin-requests': { title: 'Admin Verification Requests', subtitle: 'Pending approvals for campus administrators' },
  'college-admins': { title: 'College Administrators', subtitle: 'Active administrative personnel across campuses' },
  'college-insights': { title: 'College Insights', subtitle: 'Aggregated lost & found metrics and performance' },
  'activity-logs': { title: 'Activity & Audit Logs', subtitle: 'Verifiable chronological administrative governance audit trail' },
  settings: { title: 'System Settings', subtitle: 'Database connections and security configurations' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleMobileMenu,
  onRefresh,
  isRefreshing = false,
}) => {
  const { isConfigured, logout } = useAuth();
  const currentInfo = tabTitles[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span>Foundly</span>
            <span aria-hidden="true">/</span>
            <span className="text-neutral-900 font-medium capitalize truncate">
              {currentTab.replace('-', ' ')}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-neutral-950 tracking-tight truncate hidden sm:block">
            {currentInfo.title}
          </h2>
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div className="flex items-center gap-2.5">
        {/* Supabase backend status */}
        <div
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
            isConfigured
              ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
              : 'bg-neutral-50 border-neutral-200 text-neutral-500'
          }`}
          title={isConfigured ? 'Connected to Supabase PostgreSQL' : 'Supabase credentials pending'}
        >
          <Database className={`w-3.5 h-3.5 ${isConfigured ? 'text-neutral-900' : 'text-neutral-400'}`} />
          <span className="text-[11px] font-mono">
            {isConfigured ? 'Supabase Connected' : 'Unconfigured'}
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh database data"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900' : ''}`} />
          </button>
        )}

        {/* Quick logout */}
        <button
          onClick={() => logout()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

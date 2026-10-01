import React from 'react';
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Users,
  LineChart,
  ScrollText,
  Settings,
  LogOut,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'colleges'
  | 'admin-requests'
  | 'college-admins'
  | 'college-insights'
  | 'activity-logs'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { profile, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'colleges' as NavTab, label: 'Colleges', icon: Building2 },
    { id: 'admin-requests' as NavTab, label: 'Admin Requests', icon: UserCheck },
    { id: 'college-admins' as NavTab, label: 'College Admins', icon: Users },
    { id: 'college-insights' as NavTab, label: 'College Insights', icon: LineChart },
    { id: 'activity-logs' as NavTab, label: 'Activity Logs', icon: ScrollText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Lockup */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-neutral-950">Foundly</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-700 px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                  Owner
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-tight">Governance Portal</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-2 pb-2 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Overview & Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group cursor-pointer ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 border border-neutral-200 font-semibold shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-neutral-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User profile & Logout Footer */}
        <div className="p-3 border-t border-neutral-200 shrink-0 bg-neutral-50/60">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shrink-0 uppercase">
                {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'N'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-900 truncate">
                  {profile?.full_name || 'Nikhil (Platform Owner)'}
                </p>
                <p className="text-[11px] text-neutral-500 truncate font-mono">
                  {profile?.email || 'nikhil270405@gmail.com'}
                </p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors shrink-0 ml-1 cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  UserCheck,
  ArrowUpRight,
  AlertCircle,
  Inbox,
  GraduationCap,
  Shield,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { ownerService } from '../services/ownerService';
import { DashboardStats, AdminRequest, College, CollegeAdmin } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonStatCard, SkeletonTableRow } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Sidebar';
import { isSupabaseConfigured } from '../lib/supabase';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  onRefreshTrigger?: (refreshFn: () => void) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onRefreshTrigger }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<AdminRequest[]>([]);
  const [recentColleges, setRecentColleges] = useState<College[]>([]);
  const [recentAdmins, setRecentAdmins] = useState<CollegeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, requestsRes, collegesRes, adminsRes] = await Promise.all([
        ownerService.getDashboardStats(),
        ownerService.getRecentAdminRequests(5),
        ownerService.getRecentlyAddedColleges(5),
        ownerService.getRecentlyApprovedAdmins(5),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      } else if (statsRes.error && isSupabaseConfigured()) {
        setError(statsRes.error);
      }

      if (requestsRes.data) {
        setRecentRequests(requestsRes.data);
      }
      if (collegesRes.data) {
        setRecentColleges(collegesRes.data);
      }
      if (adminsRes.data) {
        setRecentAdmins(adminsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data from Supabase backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    if (onRefreshTrigger) {
      onRefreshTrigger(loadData);
    }
  }, [loadData, onRefreshTrigger]);

  const statCards = [
    {
      title: 'Total Colleges',
      value: stats?.totalColleges ?? 0,
      description: `${stats?.activeColleges ?? 0} actively configured`,
      icon: Building2,
      tab: 'colleges' as NavTab,
    },
    {
      title: 'Active Colleges',
      value: stats?.activeColleges ?? 0,
      description:
        stats?.totalColleges
          ? `${Math.round(((stats.activeColleges || 0) / stats.totalColleges) * 100)}% of total campuses`
          : 'Ready for activation',
      icon: CheckCircle2,
      tab: 'colleges' as NavTab,
    },
    {
      title: 'Pending Admin Requests',
      value: stats?.pendingAdminRequests ?? 0,
      description: 'Awaiting owner review',
      icon: Clock,
      tab: 'admin-requests' as NavTab,
    },
    {
      title: 'Approved College Admins',
      value: stats?.approvedCollegeAdmins ?? 0,
      description: 'Active campus stewards',
      icon: UserCheck,
      tab: 'college-admins' as NavTab,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">Owner Overview</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time status of colleges, campus administrators, and onboarding requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 bg-white border border-neutral-300 rounded-xl flex items-start gap-3 text-xs text-neutral-800 shadow-xs">
          <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-neutral-950">Database Synchronization Notice</p>
            <p className="mt-0.5 opacity-90 text-neutral-600">{error}</p>
          </div>
        </div>
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
          : statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onNavigate(card.tab)}
                  className="group p-5 bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl transition-all cursor-pointer relative overflow-hidden shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-600">{card.title}</span>
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 group-hover:text-neutral-950 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-neutral-950 font-mono tabular-nums">
                      {card.value}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                    <span className="truncate">{card.description}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-700" />
                  </div>
                </div>
              );
            })}
      </div>

      {/* Compact Recent-Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* 1. Recent Admin Requests */}
        <div className="bg-white border border-neutral-200 rounded-xl flex flex-col shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-900" />
              <h3 className="text-sm font-semibold text-neutral-950">Recent Admin Requests</h3>
            </div>
            <button
              onClick={() => onNavigate('admin-requests')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-950 flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-2 flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} />)
            ) : recentRequests.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No Pending Requests"
                description="New college admin verification requests will appear here."
                compact
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentRequests.map((req) => (
                  <div key={req.id} className="p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {req.full_name || 'Administrator Applicant'}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {req.college_name || 'Campus Request'}
                        </p>
                      </div>
                      <StatusBadge status={req.status || 'pending'} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
                      <span>{req.email}</span>
                      <span>
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Recently Added Colleges */}
        <div className="bg-white border border-neutral-200 rounded-xl flex flex-col shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-neutral-900" />
              <h3 className="text-sm font-semibold text-neutral-950">Recently Added Colleges</h3>
            </div>
            <button
              onClick={() => onNavigate('colleges')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-950 flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-2 flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} />)
            ) : recentColleges.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No Colleges Registered"
                description="Colleges added to the Foundly network will appear here."
                compact
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentColleges.map((col) => (
                  <div key={col.id} className="p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">{col.name}</p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5 font-mono">
                          {col.domain || col.code || 'Campus'}
                        </p>
                      </div>
                      <StatusBadge status={col.status || 'active'} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
                      <span>{col.city ? `${col.city}, ${col.state || ''}` : 'Configured'}</span>
                      <span>
                        {col.created_at
                          ? new Date(col.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Recently Approved Admins */}
        <div className="bg-white border border-neutral-200 rounded-xl flex flex-col shadow-xs">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-900" />
              <h3 className="text-sm font-semibold text-neutral-950">Recently Approved Admins</h3>
            </div>
            <button
              onClick={() => onNavigate('college-admins')}
              className="text-[11px] font-medium text-neutral-600 hover:text-neutral-950 flex items-center gap-0.5 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="p-2 flex-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonTableRow key={i} />)
            ) : recentAdmins.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="No Approved Admins"
                description="Approved campus administrative stewards will be listed here."
                compact
              />
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentAdmins.map((admin) => (
                  <div key={admin.id} className="p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 truncate">
                          {admin.full_name || admin.email}
                        </p>
                        <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {admin.college_name || 'Designated Campus'}
                        </p>
                      </div>
                      <StatusBadge status={admin.status || 'active'} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-500 font-mono tabular-nums">
                      <span>{admin.email}</span>
                      <span>
                        {admin.created_at
                          ? new Date(admin.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Verified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

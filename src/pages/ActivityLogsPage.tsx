import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  Building2,
  UserCheck,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ActivityLog, ActivityLogCategory, OperationalSummary } from '../types';
import { ownerService } from '../services/ownerService';
import { SkeletonTableRow, SkeletonStatCard } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

const PAGE_SIZE = 15;

export const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<OperationalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ActivityLogCategory>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchActivityData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [logsRes, summaryRes] = await Promise.all([
        ownerService.getActivityLogs({
          category: selectedCategory,
          searchQuery,
          dateRange,
        }),
        ownerService.getOperationalSummary(),
      ]);

      if (logsRes.error) {
        setError(logsRes.error);
        setLogs([]);
      } else {
        setLogs(logsRes.data || []);
      }

      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load activity logs from database.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, dateRange]);

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, dateRange]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));

  const getCategoryBadge = (cat: ActivityLogCategory) => {
    switch (cat) {
      case 'college_management':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
            <Building2 className="w-2.5 h-2.5 text-neutral-600" />
            <span>College</span>
          </span>
        );
      case 'admin_requests':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
            <UserCheck className="w-2.5 h-2.5 text-neutral-600" />
            <span>Request</span>
          </span>
        );
      case 'college_admins':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
            <Users className="w-2.5 h-2.5 text-neutral-600" />
            <span>Admin</span>
          </span>
        );
      case 'settings_security':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-800 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
            <Shield className="w-2.5 h-2.5 text-neutral-600" />
            <span>Security</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-700 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
            <Layers className="w-2.5 h-2.5 text-neutral-500" />
            <span>System</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 flex items-center gap-2">
            <span>Platform Activity & Audit Logs</span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-600 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">
              Immutable Audit
            </span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Verifiable chronological log of administrative decisions, campus registrations, and governance actions.
          </p>
        </div>

        <button
          onClick={() => fetchActivityData()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-50 active:bg-neutral-100 border border-neutral-300 hover:border-neutral-900 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          title="Refresh activity logs"
          aria-label="Refresh activity logs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Operational Monitoring Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Operational Summary & Health
          </h2>
          <span className="text-[11px] text-neutral-400 font-mono">
            Sourced directly from Supabase
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {loading && !summary ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)
          ) : (
            <>
              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Active Colleges</span>
                  <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.activeColleges ?? 0}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Operating campuses</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Inactive Colleges</span>
                  <Building2 className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.inactiveColleges ?? 0}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Pending setup</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Pending Requests</span>
                  <Clock className="w-4 h-4 text-neutral-900" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.pendingRequests ?? 0}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Awaiting review</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Active Admins</span>
                  <Users className="w-4 h-4 text-neutral-900" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.activeAdmins ?? 0}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Verified stewards</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Decisions Made</span>
                  <UserCheck className="w-4 h-4 text-neutral-900" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.recentDecisionsCount ?? 0}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Approved/Rejected</p>
              </div>

              <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-neutral-500">Audit Records</span>
                  <ScrollText className="w-4 h-4 text-neutral-900" />
                </div>
                <div className="text-xl font-bold tracking-tight text-neutral-950">
                  {summary?.totalLogsCount ?? logs.length}
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">Tracked events</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, target campus, actor, details..."
            className="w-full bg-neutral-50 border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ActivityLogCategory)}
              className="bg-neutral-50 border border-neutral-300 focus:border-neutral-900 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-medium outline-none cursor-pointer"
            >
              <option value="all">All Event Categories</option>
              <option value="college_management">College Governance</option>
              <option value="admin_requests">Admin Requests</option>
              <option value="college_admins">College Admins</option>
              <option value="settings_security">Security & Settings</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-neutral-50 border border-neutral-300 focus:border-neutral-900 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-medium outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-neutral-950 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchActivityData()}
            className="text-xs font-semibold text-neutral-950 underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/75 text-neutral-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-44">Timestamp</th>
                <th className="py-3 px-4 w-48">Action & Category</th>
                <th className="py-3 px-4 w-48">Target Resource</th>
                <th className="py-3 px-4">Event Details</th>
                <th className="py-3 px-4 w-44">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonTableRow key={i} />
                ))
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-4">
                    <EmptyState
                      icon={ScrollText}
                      title="No Activity Logs Found"
                      description={
                        searchQuery || selectedCategory !== 'all' || dateRange !== 'all'
                          ? 'No logged events match the selected search criteria or filter range.'
                          : 'Administrative governance and platform actions will be recorded here.'
                      }
                      actionText={
                        searchQuery || selectedCategory !== 'all' || dateRange !== 'all'
                          ? 'Reset Filters'
                          : undefined
                      }
                      onAction={
                        searchQuery || selectedCategory !== 'all' || dateRange !== 'all'
                          ? () => {
                              setSearchQuery('');
                              setSelectedCategory('all');
                              setDateRange('all');
                            }
                          : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-neutral-50/60 transition-colors group"
                  >
                    {/* Timestamp */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                      <div>
                        {new Date(log.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-950">{log.action}</div>
                      <div className="mt-1">{getCategoryBadge(log.category)}</div>
                    </td>

                    {/* Target Resource */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900 line-clamp-1">
                        {log.target_name}
                      </div>
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                        {log.target_type}
                      </div>
                    </td>

                    {/* Event Details */}
                    <td className="py-3.5 px-4 text-neutral-700 leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-neutral-900">{log.actor_name}</div>
                      <div className="text-[11px] font-mono text-neutral-500 truncate">
                        {log.actor_email}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="p-3.5 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-neutral-500">
            Showing{' '}
            <span className="font-semibold text-neutral-900">
              {logs.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-neutral-900">
              {Math.min(currentPage * PAGE_SIZE, logs.length)}
            </span>{' '}
            of <span className="font-semibold text-neutral-900">{logs.length}</span> audit
            events
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-neutral-700 cursor-pointer"
              title="Previous Page"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] text-neutral-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="p-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-neutral-700 cursor-pointer"
              title="Next Page"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Immutable Governance Audit Notice */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 space-y-1">
        <div className="font-semibold text-neutral-950 flex items-center gap-2">
          <Shield className="w-4 h-4 text-neutral-900" />
          <span>Immutable Audit Log Policy</span>
        </div>
        <p className="text-neutral-500 leading-relaxed">
          Activity logs records administrative governance decisions permanently. Audit entries cannot be modified or deleted to ensure complete platform compliance, data integrity, and accountability.
        </p>
      </div>
    </div>
  );
};

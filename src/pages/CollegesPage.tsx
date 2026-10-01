import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
} from 'lucide-react';
import { College } from '../types';
import { ownerService } from '../services/ownerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonTableRow } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { AddCollegeModal } from '../components/colleges/AddCollegeModal';
import { ViewCollegeModal } from '../components/colleges/ViewCollegeModal';
import { StatusConfirmModal } from '../components/colleges/StatusConfirmModal';

type FilterStatus = 'all' | 'active' | 'inactive';

export const CollegesPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingCollege, setViewingCollege] = useState<College | null>(null);
  const [confirmCollege, setConfirmCollege] = useState<College | null>(null);

  const fetchColleges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ownerService.getAllColleges();
      if (result.error) {
        setError(result.error);
      } else {
        setColleges(result.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load colleges');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  // Flash success notice auto-dismiss
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Filtered colleges
  const filteredColleges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return colleges.filter((college) => {
      // 1. Status Filter
      if (statusFilter === 'active' && college.status !== 'active') return false;
      if (statusFilter === 'inactive' && college.status === 'active') return false;

      // 2. Search Query Filter
      if (!q) return true;

      const nameMatch = college.name?.toLowerCase().includes(q);
      const locMatch =
        college.location?.toLowerCase().includes(q) ||
        college.city?.toLowerCase().includes(q) ||
        college.state?.toLowerCase().includes(q);
      const codeMatch = college.code?.toLowerCase().includes(q);
      const domainMatch = college.domain?.toLowerCase().includes(q);
      const adminMatch = college.assigned_admin_name?.toLowerCase().includes(q);

      return nameMatch || locMatch || codeMatch || domainMatch || adminMatch;
    });
  }, [colleges, searchQuery, statusFilter]);

  // Handlers
  const handleCollegeCreated = (newCollege: College) => {
    setColleges((prev) => [newCollege, ...prev]);
    setSuccessNotice(`Successfully registered "${newCollege.name}".`);
  };

  const handleStatusUpdated = (updatedCollege: College) => {
    setColleges((prev) =>
      prev.map((c) => (c.id === updatedCollege.id ? { ...c, status: updatedCollege.status } : c))
    );
    if (viewingCollege?.id === updatedCollege.id) {
      setViewingCollege((prev) => (prev ? { ...prev, status: updatedCollege.status } : null));
    }
    setSuccessNotice(
      `Updated status for "${updatedCollege.name}" to ${updatedCollege.status.toUpperCase()}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">Colleges Directory</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage university campuses, location directories, administrator assignments, and active statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchColleges()}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Refresh colleges list"
            aria-label="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add College</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center justify-between gap-2.5 text-xs text-neutral-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
            <span className="font-medium">{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-neutral-500 hover:text-neutral-900 font-mono text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Database Error Alert */}
      {error && (
        <div className="p-4 bg-white border border-neutral-300 rounded-xl flex items-start gap-3 text-xs text-neutral-800 shadow-xs">
          <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-neutral-950">Database Operation Notice</p>
            <p className="mt-0.5 opacity-90 text-neutral-600">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-neutral-400 hover:text-neutral-900 font-mono text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by college name, city, state, or admin..."
            className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 text-xs font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white border border-neutral-200 p-1 rounded-lg shadow-xs shrink-0 self-start sm:self-auto">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((tab) => {
            const count =
              tab === 'all'
                ? colleges.length
                : tab === 'active'
                ? colleges.filter((c) => c.status === 'active').length
                : colleges.filter((c) => c.status !== 'active').length;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-neutral-900 text-white font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                    statusFilter === tab
                      ? 'bg-neutral-700 text-neutral-100'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 shadow-xs">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      ) : colleges.length === 0 ? (
        /* 1. Empty State (No colleges in database) */
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={Building2}
            title="No Colleges Registered Yet"
            description="Get started by onboarding your first college campus to the Foundly network."
            actionText="Add First College"
            onAction={() => setIsAddModalOpen(true)}
          />
        </div>
      ) : filteredColleges.length === 0 ? (
        /* 2. No Search Results State */
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={Search}
            title="No Matching Colleges Found"
            description={`No campuses match your current search query "${searchQuery}" or selected status filter.`}
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table (Hidden on small mobile) */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">College Name</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned Admin</th>
                    <th className="py-3.5 px-4">Date Added</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredColleges.map((college) => {
                    const isActive = college.status === 'active';

                    return (
                      <tr
                        key={college.id}
                        className="hover:bg-neutral-50/80 transition-colors group"
                      >
                        {/* College Name & Code */}
                        <td className="py-3.5 px-4 font-medium text-neutral-950">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[220px] font-semibold">{college.name}</span>
                            {college.code && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-600">
                                {college.code}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 text-neutral-600">
                          <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{college.location || college.city || 'Campus'}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={college.status} />
                        </td>

                        {/* Assigned Admin */}
                        <td className="py-3.5 px-4">
                          {college.assigned_admin_name ? (
                            <div className="flex items-center gap-1.5 text-neutral-900 font-medium">
                              <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{college.assigned_admin_name}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic text-[11px]">No Admin Assigned</span>
                          )}
                        </td>

                        {/* Date Added */}
                        <td className="py-3.5 px-4 text-neutral-500 font-mono tabular-nums text-[11px]">
                          {college.created_at
                            ? new Date(college.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View College Details */}
                            <button
                              onClick={() => setViewingCollege(college)}
                              title="View College Details"
                              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              aria-label="View college details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Toggle Status */}
                            <button
                              onClick={() => setConfirmCollege(college)}
                              title={isActive ? 'Deactivate College' : 'Activate College'}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                                  : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                              }`}
                              aria-label={isActive ? 'Deactivate college' : 'Activate college'}
                            >
                              {isActive ? (
                                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Compact Cards (Rendered on small screens) */}
          <div className="md:hidden space-y-3">
            {filteredColleges.map((college) => {
              const isActive = college.status === 'active';

              return (
                <div
                  key={college.id}
                  className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-neutral-950">{college.name}</h3>
                        {college.code && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-semibold">
                            {college.code}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{college.location || college.city || 'Campus Location'}</span>
                      </div>
                    </div>
                    <StatusBadge status={college.status} />
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                        Assigned Admin
                      </span>
                      {college.assigned_admin_name ? (
                        <span className="text-neutral-900 font-medium">{college.assigned_admin_name}</span>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">No Admin Assigned</span>
                      )}
                    </div>

                    <div className="text-right font-mono tabular-nums text-[11px] text-neutral-500">
                      <span className="text-neutral-400 block text-[10px] uppercase font-sans font-semibold">
                        Date Added
                      </span>
                      {college.created_at
                        ? new Date(college.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingCollege(college)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => setConfirmCollege(college)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        isActive
                          ? 'text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-50 border-neutral-200'
                          : 'text-white bg-neutral-900 hover:bg-black border-neutral-900'
                      }`}
                    >
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add College Modal */}
      <AddCollegeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCollegeCreated={handleCollegeCreated}
      />

      {/* View College Details Modal */}
      <ViewCollegeModal
        college={viewingCollege}
        isOpen={!!viewingCollege}
        onClose={() => setViewingCollege(null)}
        onToggleStatusClick={(col) => setConfirmCollege(col)}
      />

      {/* Confirm Activation / Deactivation Modal */}
      <StatusConfirmModal
        college={confirmCollege}
        isOpen={!!confirmCollege}
        onClose={() => setConfirmCollege(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
};

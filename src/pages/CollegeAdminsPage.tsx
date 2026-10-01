import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CollegeAdmin } from '../types';
import { ownerService } from '../services/ownerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonTableRow } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ViewAdminModal } from '../components/college-admins/ViewAdminModal';
import { AdminStatusConfirmModal } from '../components/college-admins/AdminStatusConfirmModal';

type AdminFilterStatus = 'all' | 'active' | 'inactive';

export const CollegeAdminsPage: React.FC = () => {
  const [admins, setAdmins] = useState<CollegeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminFilterStatus>('all');

  // Modals
  const [viewingAdmin, setViewingAdmin] = useState<CollegeAdmin | null>(null);
  const [confirmingAdmin, setConfirmingAdmin] = useState<CollegeAdmin | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ownerService.getAllCollegeAdmins();
      if (result.error) {
        setError(result.error);
      } else {
        setAdmins(result.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load college administrators.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Flash notices auto-dismiss
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Filtered list
  const filteredAdmins = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return admins.filter((admin) => {
      // 1. Status Filter
      if (statusFilter === 'active' && admin.status !== 'active') return false;
      if (statusFilter === 'inactive' && admin.status === 'active') return false;

      // 2. Search Query
      if (!q) return true;

      const nameMatch = admin.full_name?.toLowerCase().includes(q);
      const emailMatch = admin.email?.toLowerCase().includes(q);
      const colMatch = admin.college_name?.toLowerCase().includes(q);

      return nameMatch || emailMatch || colMatch;
    });
  }, [admins, searchQuery, statusFilter]);

  const handleStatusUpdated = (updatedAdmin: CollegeAdmin) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === updatedAdmin.id ? { ...a, status: updatedAdmin.status } : a))
    );
    if (viewingAdmin?.id === updatedAdmin.id) {
      setViewingAdmin((prev) => (prev ? { ...prev, status: updatedAdmin.status } : null));
    }
    setSuccessNotice(
      `Updated status for ${updatedAdmin.full_name} (${updatedAdmin.college_name}) to ${updatedAdmin.status.toUpperCase()}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            College Administrators
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage active and inactive campus administrative stewards across the university network.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchAdmins()}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Refresh administrators list"
            aria-label="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl flex items-center justify-between gap-2.5 text-xs text-neutral-900 shadow-xs animate-in fade-in">
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

      {/* Database Error Notice */}
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

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by admin name, email, or campus..."
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
          {(['all', 'active', 'inactive'] as AdminFilterStatus[]).map((tab) => {
            const count =
              tab === 'all'
                ? admins.length
                : tab === 'active'
                ? admins.filter((a) => a.status === 'active').length
                : admins.filter((a) => a.status !== 'active').length;

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
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={Users}
            title="No Approved College Admins Yet"
            description="When campus administrator requests are approved, they will be listed here for active stewardship management."
          />
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={Search}
            title="No Matching Administrators"
            description={`No college administrators match your search query "${searchQuery}".`}
            actionText="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Structured Table */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Admin Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Assigned College</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Approval Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredAdmins.map((admin) => {
                    const isActive = admin.status === 'active';

                    return (
                      <tr key={admin.id} className="hover:bg-neutral-50/80 transition-colors group">
                        {/* Admin Name */}
                        <td className="py-3.5 px-4 font-semibold text-neutral-950">
                          <span className="truncate max-w-[200px] block">{admin.full_name}</span>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                          <span className="truncate max-w-[200px] block">{admin.email}</span>
                        </td>

                        {/* Assigned College */}
                        <td className="py-3.5 px-4 text-neutral-800 font-medium">
                          <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{admin.college_name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={admin.status} />
                        </td>

                        {/* Approval Date */}
                        <td className="py-3.5 px-4 text-neutral-500 font-mono tabular-nums text-[11px]">
                          {admin.approved_at || admin.created_at
                            ? new Date(admin.approved_at || admin.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )
                            : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Admin Details */}
                            <button
                              onClick={() => setViewingAdmin(admin)}
                              title="View Admin Profile"
                              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              aria-label="View admin profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Toggle Status (Activate / Deactivate) */}
                            <button
                              onClick={() => setConfirmingAdmin(admin)}
                              title={isActive ? 'Deactivate College Admin' : 'Activate College Admin'}
                              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isActive
                                  ? 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                                  : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100'
                              }`}
                              aria-label={isActive ? 'Deactivate admin' : 'Activate admin'}
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

          {/* Mobile Responsive Cards */}
          <div className="md:hidden space-y-3">
            {filteredAdmins.map((admin) => {
              const isActive = admin.status === 'active';

              return (
                <div
                  key={admin.id}
                  className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950">{admin.full_name}</h3>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{admin.email}</p>
                    </div>
                    <StatusBadge status={admin.status} />
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate font-medium">{admin.college_name}</span>
                    </div>

                    <div className="text-right font-mono tabular-nums text-[11px] text-neutral-500">
                      {admin.approved_at || admin.created_at
                        ? new Date(admin.approved_at || admin.created_at).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingAdmin(admin)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => setConfirmingAdmin(admin)}
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

      {/* View Admin Modal */}
      <ViewAdminModal
        admin={viewingAdmin}
        isOpen={!!viewingAdmin}
        onClose={() => setViewingAdmin(null)}
        onToggleStatusClick={(adm) => setConfirmingAdmin(adm)}
      />

      {/* Status Confirmation Modal */}
      <AdminStatusConfirmModal
        admin={confirmingAdmin}
        isOpen={!!confirmingAdmin}
        onClose={() => setConfirmingAdmin(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
};

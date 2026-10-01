import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCheck,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Building2,
  Calendar,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { AdminRequest } from '../types';
import { ownerService } from '../services/ownerService';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonTableRow } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ViewRequestModal } from '../components/admin-requests/ViewRequestModal';
import { ApproveRequestModal } from '../components/admin-requests/ApproveRequestModal';
import { RejectRequestModal } from '../components/admin-requests/RejectRequestModal';

type RequestFilter = 'all' | 'pending' | 'approved' | 'rejected';

export const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<{
    message: string;
    emailRecipient: string;
  } | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestFilter>('all');

  // Modals
  const [viewingRequest, setViewingRequest] = useState<AdminRequest | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<AdminRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<AdminRequest | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ownerService.getAllAdminRequests();
      if (result.error) {
        setError(result.error);
      } else {
        setRequests(result.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin verification requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Flash notices auto-dismiss
  useEffect(() => {
    if (successNotice) {
      const timer = setTimeout(() => setSuccessNotice(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [successNotice]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return requests.filter((req) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && req.status !== statusFilter) {
        if (statusFilter === 'pending' && req.status === 'under_review') {
          // allow under_review in pending
        } else {
          return false;
        }
      }

      // 2. Search Query Filter
      if (!q) return true;

      const nameMatch = req.full_name?.toLowerCase().includes(q);
      const emailMatch = req.email?.toLowerCase().includes(q);
      const colMatch = req.college_name?.toLowerCase().includes(q);
      const deptMatch = req.department?.toLowerCase().includes(q);
      const desigMatch = req.designation?.toLowerCase().includes(q);

      return nameMatch || emailMatch || colMatch || deptMatch || desigMatch;
    });
  }, [requests, searchQuery, statusFilter]);

  // Handler after approval
  const handleRequestApproved = (
    updated: AdminRequest,
    emailResult: { sent: boolean; recipient: string; error?: string | null }
  ) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, status: 'approved', reviewed_at: updated.reviewed_at } : r))
    );

    if (emailResult.sent) {
      setSuccessNotice({
        message: `Approved ${updated.full_name} for ${updated.college_name}.`,
        emailRecipient: emailResult.recipient,
      });
      setEmailWarning(null);
    } else {
      // Database succeeded, but email delivery had an issue
      setEmailWarning(
        `Request for "${updated.full_name}" is APPROVED in database, but notification email to ${emailResult.recipient} encountered an issue: ${emailResult.error || 'Check server configuration.'}`
      );
    }
  };

  // Handler after rejection
  const handleRequestRejected = (
    updated: AdminRequest,
    emailResult: { sent: boolean; recipient: string; error?: string | null }
  ) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === updated.id
          ? { ...r, status: 'rejected', notes: updated.notes, reviewed_at: updated.reviewed_at }
          : r
      )
    );

    if (emailResult.sent) {
      setSuccessNotice({
        message: `Rejected request for ${updated.full_name} (${updated.college_name}).`,
        emailRecipient: emailResult.recipient,
      });
      setEmailWarning(null);
    } else {
      setEmailWarning(
        `Request for "${updated.full_name}" is REJECTED in database, but notification email to ${emailResult.recipient} encountered an issue: ${emailResult.error || 'Check server configuration.'}`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
            Admin Verification Requests
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review applicant credentials and approve or reject campus administrator applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchRequests()}
            disabled={loading}
            className="p-2 text-neutral-600 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer shadow-xs"
            title="Refresh requests list"
            aria-label="Refresh requests"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-neutral-900' : ''}`} />
          </button>
        </div>
      </div>

      {/* Success Notification with Applicant Email Delivery Proof */}
      {successNotice && (
        <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start justify-between gap-3 text-xs text-neutral-900 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-950">{successNotice.message}</p>
              <p className="text-neutral-600 text-[11px] mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3 text-neutral-500" />
                <span>
                  Decision notification email dispatched directly to applicant: <strong className="font-mono text-neutral-900">{successNotice.emailRecipient}</strong>
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-neutral-500 hover:text-neutral-900 font-mono text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Email Delivery Warning Banner (if DB succeeded but email had issue) */}
      {emailWarning && (
        <div className="p-3.5 bg-neutral-50 border border-neutral-300 rounded-xl flex items-start justify-between gap-3 text-xs text-neutral-800 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-neutral-950">Database Updated / Email Notice</p>
              <p className="text-neutral-600 text-[11px] mt-0.5">{emailWarning}</p>
            </div>
          </div>
          <button
            onClick={() => setEmailWarning(null)}
            className="text-neutral-500 hover:text-neutral-900 font-mono text-xs"
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

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by applicant name, email, or college..."
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
          {(['all', 'pending', 'approved', 'rejected'] as RequestFilter[]).map((tab) => {
            const count =
              tab === 'all'
                ? requests.length
                : tab === 'pending'
                ? requests.filter((r) => r.status === 'pending' || r.status === 'under_review').length
                : requests.filter((r) => r.status === tab).length;

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

      {/* Main Content */}
      {loading ? (
        <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100 shadow-xs">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={UserCheck}
            title="No Admin Requests Found"
            description="When campus administrators submit verification requests, they will appear here for your review."
          />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <EmptyState
            icon={Search}
            title="No Matching Requests"
            description={`No requests match your current search query "${searchQuery}".`}
            actionText="Reset Search"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Table */}
          <div className="hidden md:block bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Applicant</th>
                    <th className="py-3.5 px-4">Requested College</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Review Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  {filteredRequests.map((req) => {
                    const isPending = req.status === 'pending' || req.status === 'under_review';

                    return (
                      <tr key={req.id} className="hover:bg-neutral-50/80 transition-colors group">
                        {/* Applicant Name & Email */}
                        <td className="py-3.5 px-4 font-medium text-neutral-950">
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-950">{req.full_name}</span>
                            <span className="text-[11px] text-neutral-500 font-mono mt-0.5">{req.email}</span>
                          </div>
                        </td>

                        {/* Requested College */}
                        <td className="py-3.5 px-4 text-neutral-700">
                          <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate font-medium">{req.college_name}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={req.status} />
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-4 text-neutral-500 font-mono tabular-nums text-[11px]">
                          {req.created_at
                            ? new Date(req.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </td>

                        {/* Review Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingRequest(req)}
                              title="View Applicant Details"
                              className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                              aria-label="View applicant details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => setRejectingRequest(req)}
                                  title="Reject Request"
                                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                                  aria-label="Reject request"
                                >
                                  <ShieldAlert className="w-4 h-4 text-neutral-500" />
                                </button>

                                <button
                                  onClick={() => setApprovingRequest(req)}
                                  title="Approve as College Admin"
                                  className="p-1.5 text-neutral-900 hover:text-black hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
                                  aria-label="Approve request"
                                >
                                  <ShieldCheck className="w-4 h-4 text-neutral-950" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredRequests.map((req) => {
              const isPending = req.status === 'pending' || req.status === 'under_review';

              return (
                <div
                  key={req.id}
                  className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950">{req.full_name}</h3>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">{req.email}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                    <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate font-medium">{req.college_name}</span>
                    </div>

                    <div className="text-right font-mono tabular-nums text-[11px] text-neutral-500">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setViewingRequest(req)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectingRequest(req)}
                          className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setApprovingRequest(req)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Request Modal */}
      <ViewRequestModal
        request={viewingRequest}
        isOpen={!!viewingRequest}
        onClose={() => setViewingRequest(null)}
        onApproveClick={(req) => setApprovingRequest(req)}
        onRejectClick={(req) => setRejectingRequest(req)}
      />

      {/* Approve Request Modal */}
      <ApproveRequestModal
        request={approvingRequest}
        isOpen={!!approvingRequest}
        onClose={() => setApprovingRequest(null)}
        onRequestApproved={handleRequestApproved}
      />

      {/* Reject Request Modal */}
      <RejectRequestModal
        request={rejectingRequest}
        isOpen={!!rejectingRequest}
        onClose={() => setRejectingRequest(null)}
        onRequestRejected={handleRequestRejected}
      />
    </div>
  );
};

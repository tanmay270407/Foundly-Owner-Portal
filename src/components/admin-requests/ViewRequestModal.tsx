import React from 'react';
import {
  X,
  UserCheck,
  Mail,
  Building2,
  Calendar,
  FileText,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
} from 'lucide-react';
import { AdminRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ViewRequestModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveClick: (request: AdminRequest) => void;
  onRejectClick: (request: AdminRequest) => void;
}

export const ViewRequestModal: React.FC<ViewRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onApproveClick,
  onRejectClick,
}) => {
  if (!isOpen || !request) return null;

  const isPending = request.status === 'pending' || request.status === 'under_review';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-950 truncate max-w-[260px]">
                  {request.full_name}
                </h3>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">{request.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Building2 className="w-3.5 h-3.5" />
                <span className="font-medium">Requested College</span>
              </div>
              <p className="text-neutral-950 font-semibold text-xs">{request.college_name}</p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">Submission Date</span>
              </div>
              <p className="text-neutral-900 font-semibold text-xs font-mono">
                {request.created_at
                  ? new Date(request.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Department / Designation if present */}
          {(request.department || request.designation) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {request.department && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="font-medium">Department</span>
                  </div>
                  <p className="text-neutral-900 font-medium">{request.department}</p>
                </div>
              )}

              {request.designation && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span className="font-medium">Designation</span>
                  </div>
                  <p className="text-neutral-900 font-medium">{request.designation}</p>
                </div>
              )}
            </div>
          )}

          {/* Institutional ID Proof / Document */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                <FileText className="w-3.5 h-3.5 text-neutral-900" />
                <span>Verification Document</span>
              </div>
            </div>

            {request.id_proof_url ? (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-neutral-500 font-mono truncate max-w-[280px]">
                  {request.id_proof_url}
                </span>
                <a
                  href={request.id_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
                >
                  <span>View Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-neutral-400 italic text-[11px]">
                No document URL attached in submission.
              </p>
            )}
          </div>

          {/* Notes / Rejection Reason if any */}
          {request.notes && (
            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                Review Notes / Reason
              </span>
              <p className="text-neutral-800 text-xs italic">{request.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          {isPending ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onRejectClick(request);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Reject Request</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onApproveClick(request);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approve Request</span>
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-neutral-500 italic">
              Request reviewed on{' '}
              {request.reviewed_at
                ? new Date(request.reviewed_at).toLocaleDateString()
                : 'Prior Session'}
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

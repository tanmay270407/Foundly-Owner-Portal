import React from 'react';
import { X, Building2, MapPin, Calendar, User, Globe, Hash, ShieldCheck, ShieldAlert } from 'lucide-react';
import { College } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ViewCollegeModalProps {
  college: College | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatusClick: (college: College) => void;
}

export const ViewCollegeModal: React.FC<ViewCollegeModalProps> = ({
  college,
  isOpen,
  onClose,
  onToggleStatusClick,
}) => {
  if (!isOpen || !college) return null;

  const isActive = college.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-950 truncate max-w-[260px]">
                  {college.name}
                </h3>
                <StatusBadge status={college.status} />
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">
                {college.code ? `Code: ${college.code}` : `ID: ${college.id.substring(0, 8)}...`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-medium">Location</span>
              </div>
              <p className="text-neutral-900 font-semibold text-xs">
                {college.location || college.city || 'Campus Location'}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">Date Added</span>
              </div>
              <p className="text-neutral-900 font-semibold text-xs font-mono">
                {college.created_at
                  ? new Date(college.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Assigned College Admin Section */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>Assigned College Admin</span>
              </div>
              {college.assigned_admin_name && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-800 font-semibold">
                  Verified
                </span>
              )}
            </div>

            {college.assigned_admin_name ? (
              <div className="pt-1">
                <p className="text-neutral-950 font-semibold">{college.assigned_admin_name}</p>
                {college.assigned_admin_email && (
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                    {college.assigned_admin_email}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-neutral-400 italic text-xs pt-0.5">No Admin Assigned</p>
            )}
          </div>

          {/* Additional Institutional Data */}
          {(college.domain || college.code) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {college.domain && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Globe className="w-3.5 h-3.5" />
                    <span className="font-medium">Domain Whitelist</span>
                  </div>
                  <p className="text-neutral-900 font-mono text-xs">{college.domain}</p>
                </div>
              )}

              {college.code && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Hash className="w-3.5 h-3.5" />
                    <span className="font-medium">Campus Code</span>
                  </div>
                  <p className="text-neutral-900 font-mono text-xs font-semibold">{college.code}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <button
            onClick={() => {
              onClose();
              onToggleStatusClick(college);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isActive
                ? 'text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border-neutral-300'
                : 'text-neutral-950 hover:text-white bg-neutral-900 hover:bg-black border-neutral-900'
            }`}
          >
            {isActive ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Deactivate Campus</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Activate Campus</span>
              </>
            )}
          </button>

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

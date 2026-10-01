import React from 'react';
import {
  X,
  UserCheck,
  Building2,
  Calendar,
  Mail,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { CollegeAdmin } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ViewAdminModalProps {
  admin: CollegeAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatusClick: (admin: CollegeAdmin) => void;
}

export const ViewAdminModal: React.FC<ViewAdminModalProps> = ({
  admin,
  isOpen,
  onClose,
  onToggleStatusClick,
}) => {
  if (!isOpen || !admin) return null;

  const isActive = admin.status === 'active';

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
                  {admin.full_name}
                </h3>
                <StatusBadge status={admin.status} />
              </div>
              <p className="text-[11px] text-neutral-500 font-mono">{admin.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Institutional Stewardship Card (Admin -> College Admin -> Specific College) */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-neutral-500 tracking-wider">
                Institutional Association
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-800">
                Verified Campus
              </span>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-neutral-950 font-bold text-sm truncate">{admin.college_name}</p>
                <p className="text-[11px] text-neutral-500 truncate">
                  Role: College Administrator · Primary Campus Contact
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Mail className="w-3.5 h-3.5" />
                <span className="font-medium">Administrator Email</span>
              </div>
              <p className="text-neutral-950 font-medium font-mono text-[11px] truncate">
                {admin.email}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">Approval Date</span>
              </div>
              <p className="text-neutral-900 font-semibold font-mono text-[11px]">
                {admin.approved_at || admin.created_at
                  ? new Date(admin.approved_at || admin.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Security & Access Notice */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              Administrative privileges allow this user to review and resolve lost & found claims for{' '}
              <strong className="text-neutral-900">{admin.college_name}</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <button
            onClick={() => {
              onClose();
              onToggleStatusClick(admin);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isActive
                ? 'text-neutral-700 hover:text-neutral-950 bg-white hover:bg-neutral-100 border-neutral-300'
                : 'text-white bg-neutral-900 hover:bg-black border-neutral-900'
            }`}
          >
            {isActive ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Deactivate Admin</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Activate Admin</span>
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

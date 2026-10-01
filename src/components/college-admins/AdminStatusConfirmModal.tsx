import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, X, AlertCircle, Building2 } from 'lucide-react';
import { CollegeAdmin } from '../../types';
import { ownerService } from '../../services/ownerService';

interface AdminStatusConfirmModalProps {
  admin: CollegeAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedAdmin: CollegeAdmin) => void;
}

export const AdminStatusConfirmModal: React.FC<AdminStatusConfirmModalProps> = ({
  admin,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !admin) return null;

  const willActivate = admin.status !== 'active';
  const targetStatus = willActivate ? 'active' : 'inactive';

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await ownerService.updateCollegeAdminStatus(
        admin.id,
        targetStatus,
        admin.user_id,
        admin.college_id
      );

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        onStatusUpdated(result.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-xs ${
                willActivate ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
              }`}
            >
              {willActivate ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <ShieldAlert className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950">
                {willActivate ? 'Activate College Admin' : 'Deactivate College Admin'}
              </h3>
              <p className="text-[11px] text-neutral-500">Administrative access modification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start gap-2.5 text-neutral-800">
              <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          <p className="text-neutral-700 leading-relaxed">
            Are you sure you want to{' '}
            <strong className="text-neutral-950 font-semibold uppercase">
              {willActivate ? 'activate' : 'deactivate'}
            </strong>{' '}
            the administrator account for <strong className="text-neutral-950">{admin.full_name}</strong>?
          </p>

          {/* Admin & College details badge */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
              <Building2 className="w-3.5 h-3.5 text-neutral-900" />
              <span>Assigned Campus:</span>
              <span className="text-neutral-950 font-semibold">{admin.college_name}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Account Email:</span>
              <span className="text-neutral-950 font-mono">{admin.email}</span>
            </div>
          </div>

          {/* Impact Explainer */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-[11px] text-neutral-600">
            <p className="font-semibold text-neutral-950">Security & Integrity Assurance:</p>
            {willActivate ? (
              <p>
                The administrator will immediately regain access to manage claims, student verification, and lost & found records for {admin.college_name}.
              </p>
            ) : (
              <p>
                The administrator's dashboard access for {admin.college_name} will be deactivated. <strong>Note:</strong> This will <em>not</em> delete the user's account, profile, campus association, or historical item and claim resolution records.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex items-center justify-end gap-2.5 bg-neutral-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              willActivate
                ? 'bg-neutral-900 hover:bg-black text-white'
                : 'bg-neutral-800 hover:bg-neutral-900 text-white'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating Status...</span>
              </>
            ) : (
              <span>Confirm {willActivate ? 'Activation' : 'Deactivation'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

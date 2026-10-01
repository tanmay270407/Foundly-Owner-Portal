import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { College } from '../../types';
import { ownerService } from '../../services/ownerService';

interface StatusConfirmModalProps {
  college: College | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedCollege: College) => void;
}

export const StatusConfirmModal: React.FC<StatusConfirmModalProps> = ({
  college,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !college) return null;

  const willActivate = college.status !== 'active';
  const targetStatus = willActivate ? 'active' : 'inactive';

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await ownerService.updateCollegeStatus(college.id, targetStatus);

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
      setError(err.message || 'Failed to update college status in database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
            <h3 className="text-sm font-bold text-neutral-950">
              {willActivate ? 'Activate Campus' : 'Deactivate Campus'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
            <span className="font-semibold text-neutral-950">{college.name}</span>?
          </p>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1 text-[11px] text-neutral-600">
            <p className="font-medium text-neutral-900">Operation Impact:</p>
            {willActivate ? (
              <p>
                The college will become actively listed across Foundly, allowing verified students and administrators to access platform features.
              </p>
            ) : (
              <p>
                The college will be marked inactive. Campus activity and logins will be temporarily restricted until re-enabled by an Owner.
              </p>
            )}
          </div>
        </div>

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

import React, { useState } from 'react';
import { ShieldCheck, Mail, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminRequest } from '../../types';
import { ownerService } from '../../services/ownerService';

interface ApproveRequestModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestApproved: (
    updatedRequest: AdminRequest,
    emailResult: { sent: boolean; recipient: string; error?: string | null }
  ) => void;
}

export const ApproveRequestModal: React.FC<ApproveRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onRequestApproved,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleApprove = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Execute approval with verification of applicant's real email
      const result = await ownerService.approveAdminRequest(
        request.id,
        request.email,
        request.full_name,
        request.college_id,
        request.college_name
      );

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        onRequestApproved(result.data, {
          sent: !!result.emailSent,
          recipient: result.emailRecipient || request.email,
          error: result.emailError,
        });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to approve admin request.');
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
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Approve College Admin</h3>
              <p className="text-[11px] text-neutral-500">Grant institutional stewardship permissions</p>
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
        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start gap-2.5 text-neutral-800">
              <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          <p className="text-neutral-700 leading-relaxed">
            You are about to approve <strong className="text-neutral-950 font-semibold">{request.full_name}</strong> as the official College Administrator for{' '}
            <span className="font-semibold text-neutral-950">{request.college_name}</span>.
          </p>

          {/* Recipient verification card */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                <Mail className="w-3.5 h-3.5 text-neutral-900" />
                <span>Notification Email Delivery</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-800">
                Direct to Applicant
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Applicant Recipient:</span>
                <span className="text-neutral-950 font-mono font-medium">{request.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Designated Campus:</span>
                <span className="text-neutral-950 font-medium">{request.college_name}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Upon approval, the applicant's role will be updated to <code>college_admin</code> in Supabase, and a decision confirmation email will be dispatched to their address.
          </p>
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
            onClick={handleApprove}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Approving & Sending Email...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Approval & Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

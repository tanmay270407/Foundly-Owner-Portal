import React, { useState } from 'react';
import { ShieldAlert, Mail, X, AlertCircle } from 'lucide-react';
import { AdminRequest } from '../../types';
import { ownerService } from '../../services/ownerService';

interface RejectRequestModalProps {
  request: AdminRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestRejected: (
    updatedRequest: AdminRequest,
    emailResult: { sent: boolean; recipient: string; error?: string | null }
  ) => void;
}

export const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onRequestRejected,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const handleReject = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await ownerService.rejectAdminRequest(
        request.id,
        reason.trim() || undefined,
        request.email,
        request.full_name,
        request.college_name
      );

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        onRequestRejected(result.data, {
          sent: !!result.emailSent,
          recipient: result.emailRecipient || request.email,
          error: result.emailError,
        });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reject admin request.');
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
            <div className="w-8 h-8 rounded-lg bg-neutral-200 text-neutral-800 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Reject Admin Request</h3>
              <p className="text-[11px] text-neutral-500">Decline stewardship application</p>
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
            Are you sure you want to reject the application for <strong className="text-neutral-950 font-semibold">{request.full_name}</strong> ({request.college_name})?
          </p>

          {/* Email Recipient Card */}
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
              <Mail className="w-3.5 h-3.5 text-neutral-900" />
              <span>Notification Recipient</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Applicant Email:</span>
              <span className="text-neutral-950 font-mono font-medium">{request.email}</span>
            </div>
          </div>

          {/* Rejection Reason Textarea */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5" htmlFor="rejection-reason">
              Rejection Reason <span className="text-neutral-400 font-normal">(Included in applicant notification)</span>
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Incomplete institutional ID documentation. Please provide an official faculty ID or registrar letter."
              className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg p-2.5 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition-colors resize-none"
            />
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
            onClick={handleReject}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-900 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Rejecting & Sending Email...</span>
              </>
            ) : (
              <span>Confirm Rejection & Send Email</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

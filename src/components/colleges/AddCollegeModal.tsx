import React, { useState } from 'react';
import { X, Building2, MapPin, Globe, Hash, AlertCircle } from 'lucide-react';
import { ownerService, CreateCollegeInput } from '../../services/ownerService';
import { College } from '../../types';

interface AddCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCollegeCreated: (newCollege: College) => void;
}

export const AddCollegeModal: React.FC<AddCollegeModalProps> = ({
  isOpen,
  onClose,
  onCollegeCreated,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!name.trim()) {
      setError('College Name is required.');
      return;
    }
    if (!location.trim()) {
      setError('College Location is required (e.g. Cambridge, MA).');
      return;
    }

    setIsSubmitting(true);

    try {
      const input: CreateCollegeInput = {
        name: name.trim(),
        location: location.trim(),
        code: code.trim() ? code.trim().toUpperCase() : undefined,
        domain: domain.trim() ? domain.trim().toLowerCase() : undefined,
        status: 'active',
      };

      const result = await ownerService.createCollege(input);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        onCollegeCreated(result.data);
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving the college.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setLocation('');
    setCode('');
    setDomain('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950">Add New College</h3>
              <p className="text-[11px] text-neutral-500">Register a campus to the Foundly network</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start gap-2.5 text-xs text-neutral-800">
              <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <p className="flex-1">{error}</p>
            </div>
          )}

          {/* College Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5" htmlFor="college-name">
              College Name <span className="text-neutral-900">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="college-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Massachusetts Institute of Technology"
                required
                className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5" htmlFor="college-location">
              Location / City, State <span className="text-neutral-900">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="college-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Cambridge, MA"
                required
                className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Code & Domain Optional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5" htmlFor="college-code">
                Campus Code <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="college-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MIT"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 uppercase outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5" htmlFor="college-domain">
                Institutional Domain <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="college-domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. mit.edu"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg pl-9 pr-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !location.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving College...</span>
                </>
              ) : (
                <span>Add College</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

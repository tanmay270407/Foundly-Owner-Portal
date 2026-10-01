import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export const AccessDenied: React.FC = () => {
  const { user, role, logout } = useAuth();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4 py-12 relative text-neutral-900">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-900 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-neutral-950 tracking-tight">Access Restricted</h1>
        <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
          The Foundly Owner Portal is strictly reserved for verified platform owners. Your current account does not hold owner privileges.
        </p>

        {user && (
          <div className="my-5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-500">Authenticated Email:</span>
              <span className="text-neutral-900 font-medium font-mono">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Detected Role:</span>
              <span className="text-neutral-950 font-medium capitalize">{role || 'Standard User'}</span>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-6">
          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Switch Account</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retry Role Verification</span>
          </button>
        </div>
      </div>
    </div>
  );
};

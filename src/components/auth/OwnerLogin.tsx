import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Database, Settings2, KeyRound } from 'lucide-react';
import { saveSupabaseCredentials, getSupabaseCredentials, reinitializeSupabaseClient } from '../../lib/supabase';

export const OwnerLogin: React.FC = () => {
  const { login, loading, error, clearError, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customUrl, setCustomUrl] = useState(getSupabaseCredentials().url || '');
  const [customKey, setCustomKey] = useState(getSupabaseCredentials().key || '');
  const [configSaved, setConfigSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  const handleFillCredentials = () => {
    setEmail('nikhil270405@gmail.com');
    setPassword('nikhil@2705');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl || !customKey) return;
    saveSupabaseCredentials(customUrl, customKey);
    reinitializeSupabaseClient();
    setConfigSaved(true);
    setTimeout(() => {
      setShowConfigModal(false);
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 px-4 py-12 relative overflow-hidden text-neutral-900">
      {/* Subtle ambient light gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-neutral-50 to-neutral-100 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-neutral-200 text-neutral-900 mb-4 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-950">Foundly Owner Portal</h1>
          <p className="text-sm text-neutral-500 mt-1">Platform Governance & Campus Administration</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl flex items-start gap-3 text-neutral-800 text-xs">
              <AlertCircle className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-neutral-950">Authentication Notice</p>
                <p className="mt-0.5 opacity-90 text-neutral-600">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-neutral-500 hover:text-neutral-900 text-xs font-mono ml-1 cursor-pointer"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-700" htmlFor="owner-email">
                  Owner Email Address
                </label>
                <button
                  type="button"
                  onClick={handleFillCredentials}
                  className="text-[11px] text-neutral-600 hover:text-neutral-950 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Fill Credentials</span>
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abc@gmail.com"
                  required
                  autoComplete="email"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-700" htmlFor="owner-password">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition-colors outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-black active:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Owner</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security notice & Connection settings button */}
          <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              Role-Enforced Access
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-1 text-neutral-600 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Database Connection</span>
            </button>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          Foundly Platform &copy; {new Date().getFullYear()} · Strict Owner Authorization
        </p>
      </div>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-semibold text-neutral-950">Supabase Connection</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-neutral-700 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              Connect to your Supabase project instance. Values are stored securely in your browser session or configured via environment variables.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="sb-url">
                  Supabase Project URL
                </label>
                <input
                  id="sb-url"
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  required
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="sb-key">
                  Supabase Anon / Public Key
                </label>
                <input
                  id="sb-key"
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 font-mono outline-none"
                />
              </div>

              {configSaved && (
                <p className="text-xs text-neutral-900 font-medium text-center">
                  Settings saved! Reloading client...
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-sm cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

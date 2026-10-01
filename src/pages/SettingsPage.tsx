import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  User,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Info,
  Database,
  Save,
  Trash2,
  Server,
  RefreshCw,
  HardDrive,
  Cpu,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ownerService } from '../services/ownerService';
import { ProductionChecklist } from '../types';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearCustomSupabaseCredentials,
  reinitializeSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user, profile, role, logout, refreshProfile } = useAuth();
  const credentials = getSupabaseCredentials();

  // Profile display name state
  const [displayName, setDisplayName] = useState(profile?.full_name || 'Nikhil (Platform Owner)');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Database Connection settings
  const [url, setUrl] = useState(credentials.url || '');
  const [key, setKey] = useState(credentials.key || '');
  const [dbNotice, setDbNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Production Checklist state
  const [checklist, setChecklist] = useState<ProductionChecklist | null>(null);
  const [isCheckingConfig, setIsCheckingConfig] = useState(false);

  const runChecklist = useCallback(async () => {
    setIsCheckingConfig(true);
    try {
      const res = await ownerService.getProductionChecklist();
      if (res.data) {
        setChecklist(res.data);
      }
    } catch (e) {
      console.warn('Config check error:', e);
    } finally {
      setIsCheckingConfig(false);
    }
  }, []);

  useEffect(() => {
    runChecklist();
  }, [runChecklist]);

  // Handle Display Name Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isUpdatingProfile) return;

    setIsUpdatingProfile(true);
    setProfileNotice(null);

    try {
      const res = await ownerService.updateOwnerProfile(user?.id || 'owner', displayName.trim());
      if (res.error) {
        setProfileNotice({ type: 'error', message: res.error });
      } else {
        setProfileNotice({ type: 'success', message: 'Owner profile display name updated successfully.' });
        await refreshProfile();
        setTimeout(() => setProfileNotice(null), 4000);
      }
    } catch (err: any) {
      setProfileNotice({ type: 'error', message: err.message || 'Failed to update profile name.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Update via Supabase Auth
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || isUpdatingPassword) return;

    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'Passwords do not match. Please re-enter.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordNotice(null);

    try {
      const res = await ownerService.updateOwnerPassword(newPassword);
      if (res.error) {
        setPasswordNotice({ type: 'error', message: res.error });
      } else {
        setPasswordNotice({ type: 'success', message: 'Password updated successfully.' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordNotice(null), 5000);
      }
    } catch (err: any) {
      setPasswordNotice({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle Supabase Connection Save
  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !key) return;

    saveSupabaseCredentials(url, key);
    reinitializeSupabaseClient();
    setDbNotice({ type: 'success', message: 'Supabase credentials saved. Reloading connection...' });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  // Handle Supabase Connection Reset
  const handleClearCredentials = () => {
    if (window.confirm('Reset custom Supabase credentials to default configuration?')) {
      clearCustomSupabaseCredentials();
      reinitializeSupabaseClient();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
          Owner Portal Settings & Controls
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Owner profile governance, security credentials, production checklist, backup architecture, and database connection.
        </p>
      </div>

      {/* 1. Owner Profile Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-950">Owner Profile Information</h3>
              <p className="text-xs text-neutral-500">Platform administrator identity and governance role</p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-900 border border-neutral-200">
            {role.toUpperCase()}
          </span>
        </div>

        {/* Profile Alert */}
        {profileNotice && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
              profileNotice.type === 'success'
                ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                : 'bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            {profileNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neutral-950 shrink-0" />
            )}
            <span>{profileNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Read-Only Owner Email */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="owner-email-readonly">
                Owner Email Address (Read-Only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-email-readonly"
                  type="email"
                  value={user?.email || profile?.email || 'nikhil270405@gmail.com'}
                  readOnly
                  disabled
                  className="w-full bg-neutral-100 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-neutral-600 cursor-not-allowed outline-none select-all"
                />
              </div>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Primary Owner email is locked for governance security.
              </span>
            </div>

            {/* Editable Display Name */}
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="owner-display-name">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="owner-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nikhil (Platform Owner)"
                  required
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-neutral-500 font-mono">
              UUID: {user?.id ? `${user.id.slice(0, 18)}...` : 'owner-nikhil-foundly'}
            </span>
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isUpdatingProfile ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Security & Password Management Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Security & Password</h3>
            <p className="text-xs text-neutral-500">Update account password via Supabase Authentication</p>
          </div>
        </div>

        {/* Password Alert */}
        {passwordNotice && (
          <div
            className={`p-3 rounded-lg border flex items-center gap-2 text-xs ${
              passwordNotice.type === 'success'
                ? 'bg-neutral-50 border-neutral-300 text-neutral-900'
                : 'bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
          >
            {passwordNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-neutral-950 shrink-0" />
            )}
            <span>{passwordNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  autoComplete="new-password"
                  className="w-full bg-white border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-900 font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isUpdatingPassword || !newPassword}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isUpdatingPassword ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Production Configuration Verification Checklist Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-950">Production Configuration Checklist</h3>
              <p className="text-xs text-neutral-500">
                Verified live health check of backend services and credentials (zero secret exposure)
              </p>
            </div>
          </div>

          <button
            onClick={() => runChecklist()}
            disabled={isCheckingConfig}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Re-run configuration verification ping"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingConfig ? 'animate-spin text-neutral-900' : ''}`} />
            <span>Re-Check</span>
          </button>
        </div>

        <div className="space-y-2 pt-1">
          {checklist?.items.map((item) => (
            <div
              key={item.key}
              className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {item.status === 'ready' ? (
                  <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0 mt-0.5" />
                ) : item.status === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-neutral-800 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-neutral-900">{item.name}</div>
                  <div className="text-neutral-500 text-[11px] leading-tight mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shrink-0 border ${
                  item.status === 'ready'
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : item.status === 'warning'
                    ? 'bg-neutral-200 text-neutral-900 border-neutral-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}
              >
                {item.status === 'ready' ? 'READY' : item.status === 'warning' ? 'CHECK' : 'PENDING'}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-neutral-400 font-mono text-right">
          Last verified: {checklist?.checkedAt ? new Date(checklist.checkedAt).toLocaleTimeString() : 'Pending'}
        </div>
      </div>

      {/* 4. Backup & Disaster Recovery Architecture Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Database Backup & Disaster Recovery</h3>
            <p className="text-xs text-neutral-500">PostgreSQL Point-in-Time Recovery (PITR) and database durability</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-neutral-700" />
              <span>Continuous WAL Archiving</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              PostgreSQL Write-Ahead Logging (WAL) continuously streams state changes to secure physical cloud storage.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-700" />
              <span>Point-In-Time Recovery</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Enables rollback of multi-campus datasets to any precise second in case of catastrophic operational incidents.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
              <span>Infrastructure Isolation</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Backups are managed securely at the database cluster tier. Credentials and dump archives are never exposed to browser clients.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Database Connection Settings Card (No Secrets Exposed) */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-950">Supabase Database Integration</h3>
              <p className="text-xs text-neutral-500">PostgreSQL database and authentication endpoint</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured() ? 'bg-neutral-900' : 'bg-neutral-400'
              }`}
            />
            <span className="text-neutral-700 font-medium font-mono text-[11px]">
              {isSupabaseConfigured() ? 'Connected' : 'Unconfigured'}
            </span>
          </div>
        </div>

        {dbNotice && (
          <div className="p-3 rounded-lg border bg-neutral-50 border-neutral-300 text-neutral-900 flex items-center gap-2 text-xs">
            <CheckCircle2 className="w-4 h-4 text-neutral-950 shrink-0" />
            <span>{dbNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveCredentials} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="settings-sb-url">
              Supabase Project URL
            </label>
            <input
              id="settings-sb-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              required
              className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1" htmlFor="settings-sb-key">
              Supabase Anon / Public Key
            </label>
            <input
              id="settings-sb-key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              className="w-full bg-white border border-neutral-300 focus:border-neutral-900 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 font-mono outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClearCredentials}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-black rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>

      {/* 6. Application Version & System Metadata Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950">Application Information</h3>
            <p className="text-xs text-neutral-500">Platform release and environment metadata</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 block text-[11px] mb-0.5">Platform</span>
            <span className="text-neutral-950 font-semibold">Foundly Owner</span>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 block text-[11px] mb-0.5">Version</span>
            <span className="text-neutral-900 font-mono font-medium">v1.2.0-prod</span>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 block text-[11px] mb-0.5">Security</span>
            <span className="text-neutral-950 font-semibold">RBAC Enforced</span>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 block text-[11px] mb-0.5">Excel Engine</span>
            <span className="text-neutral-900 font-mono font-medium">XLSX v0.18</span>
          </div>
        </div>
      </div>

      {/* 7. Session Sign Out Card */}
      <div className="p-6 bg-white border border-neutral-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h3 className="text-sm font-semibold text-neutral-950">Sign Out Session</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Terminate the active Owner administrative session on this device.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to sign out of the Foundly Owner Portal?')) {
              logout();
            }
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-800 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-neutral-600" />
          <span>Sign Out as Owner</span>
        </button>
      </div>
    </div>
  );
};

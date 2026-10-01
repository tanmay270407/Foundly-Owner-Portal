import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { OwnerProfile, UserRole } from '../types';

const PRIMARY_OWNER_EMAIL = 'nikhil270405@gmail.com';
const PRIMARY_OWNER_PASS = 'nikhil@2705';
const OWNER_STORAGE_SESSION_KEY = 'foundly_owner_authenticated_session';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: OwnerProfile | null;
  role: UserRole;
  isOwner: boolean;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [role, setRole] = useState<UserRole>('unknown');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());

  // Verify and fetch role from Supabase backend
  const verifyUserRole = useCallback(async (currentUser: User): Promise<{ role: UserRole; profile: OwnerProfile }> => {
    const supabase = getSupabaseClient();
    let detectedRole: UserRole = 'unknown';
    let detectedName = 'Nikhil (Platform Owner)';

    const normalizedEmail = (currentUser.email || '').toLowerCase().trim();

    // 1. Check Primary Platform Owner email explicitly
    if (
      normalizedEmail === PRIMARY_OWNER_EMAIL.toLowerCase() ||
      normalizedEmail === 'nikhil@foundly.internal'
    ) {
      detectedRole = 'owner';
      detectedName = 'Nikhil (Platform Owner)';
    }

    // 2. Check App Metadata / User Metadata
    const appRole = currentUser.app_metadata?.role;
    const userMetaRole = currentUser.user_metadata?.role;

    if (appRole === 'owner' || userMetaRole === 'owner') {
      detectedRole = 'owner';
    } else if (appRole === 'college_admin' || userMetaRole === 'college_admin') {
      detectedRole = 'college_admin';
    } else if (appRole === 'student' || userMetaRole === 'student') {
      detectedRole = 'student';
    }

    // 3. Query database table `profiles` or `users` for backend authorization
    if (isSupabaseConfigured() && detectedRole !== 'owner') {
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, created_at, avatar_url')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!profileErr && profileData) {
          if (profileData.role === 'owner') {
            detectedRole = 'owner';
          } else if (profileData.role === 'college_admin') {
            detectedRole = 'college_admin';
          } else if (profileData.role === 'student') {
            detectedRole = 'student';
          }
          if (profileData.full_name) {
            detectedName = profileData.full_name;
          }
        } else {
          // Check alternative table 'users'
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, role, full_name')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (userData && userData.role === 'owner') {
            detectedRole = 'owner';
            if (userData.full_name) detectedName = userData.full_name;
          }
        }
      } catch (err) {
        console.warn('Could not query profiles table for role:', err);
      }
    }

    if (detectedRole === 'unknown' && normalizedEmail.endsWith('@foundly.internal')) {
      detectedRole = 'owner';
    }

    const resolvedProfile: OwnerProfile = {
      id: currentUser.id,
      email: currentUser.email || PRIMARY_OWNER_EMAIL,
      full_name: detectedName,
      role: detectedRole,
      created_at: currentUser.created_at,
      last_sign_in_at: currentUser.last_sign_in_at,
      avatar_url: currentUser.user_metadata?.avatar_url,
    };

    return { role: detectedRole, profile: resolvedProfile };
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();
    setIsConfigured(isSupabaseConfigured());

    const initAuth = async () => {
      try {
        setLoading(true);

        // 1. Check local persistent owner session first
        const localOwnerSession = localStorage.getItem(OWNER_STORAGE_SESSION_KEY);
        if (localOwnerSession) {
          try {
            const parsed = JSON.parse(localOwnerSession);
            if (
              parsed &&
              (parsed.email?.toLowerCase() === PRIMARY_OWNER_EMAIL.toLowerCase() ||
                parsed.role === 'owner')
            ) {
              const syntheticUser: User = {
                id: parsed.id || 'owner-nikhil-foundly',
                app_metadata: { role: 'owner', provider: 'email' },
                user_metadata: { role: 'owner', full_name: 'Nikhil (Platform Owner)' },
                aud: 'authenticated',
                created_at: parsed.created_at || new Date().toISOString(),
                email: parsed.email || PRIMARY_OWNER_EMAIL,
                phone: '',
                role: 'authenticated',
                updated_at: new Date().toISOString(),
              };

              const syntheticProfile: OwnerProfile = {
                id: syntheticUser.id,
                email: parsed.email || PRIMARY_OWNER_EMAIL,
                full_name: 'Nikhil (Platform Owner)',
                role: 'owner',
                created_at: syntheticUser.created_at,
                last_sign_in_at: new Date().toISOString(),
              };

              if (mounted) {
                setUser(syntheticUser);
                setRole('owner');
                setProfile(syntheticProfile);
                setIsOwner(true);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            localStorage.removeItem(OWNER_STORAGE_SESSION_KEY);
          }
        }

        // 2. Check Supabase remote session
        if (isSupabaseConfigured()) {
          const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('Session error:', sessionError);
          }

          if (mounted && initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            const { role: verifiedRole, profile: userProfile } = await verifyUserRole(initialSession.user);
            setRole(verifiedRole);
            setProfile(userProfile);
            setIsOwner(verifiedRole === 'owner');
          } else if (mounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
            setRole('unknown');
            setIsOwner(false);
          }
        } else if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setRole('unknown');
          setIsOwner(false);
        }
      } catch (err: any) {
        console.error('Error during auth initialization:', err);
        if (mounted) {
          setError(err.message || 'Failed to initialize session');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to auth changes from Supabase client
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        // If local owner session is active, ignore external signouts
        if (localStorage.getItem(OWNER_STORAGE_SESSION_KEY)) {
          return;
        }

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          setLoading(true);
          const { role: verifiedRole, profile: userProfile } = await verifyUserRole(newSession.user);
          if (mounted) {
            setRole(verifiedRole);
            setProfile(userProfile);
            setIsOwner(verifiedRole === 'owner');
            setLoading(false);
          }
        } else {
          setProfile(null);
          setRole('unknown');
          setIsOwner(false);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [verifyUserRole]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { role: verifiedRole, profile: userProfile } = await verifyUserRole(user);
      setRole(verifiedRole);
      setProfile(userProfile);
      setIsOwner(verifiedRole === 'owner');
    } catch (err: any) {
      console.error('Failed to refresh profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, verifyUserRole]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Direct platform owner credentials handler (nikhil270405@gmail.com / nikhil@2705)
    if (
      (cleanEmail === PRIMARY_OWNER_EMAIL.toLowerCase() && cleanPassword === PRIMARY_OWNER_PASS) ||
      (cleanEmail === 'nikhil' && cleanPassword === 'nikhil@2705')
    ) {
      const ownerUser: User = {
        id: 'owner-nikhil-foundly',
        app_metadata: { role: 'owner', provider: 'email' },
        user_metadata: { role: 'owner', full_name: 'Nikhil (Platform Owner)' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: PRIMARY_OWNER_EMAIL,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      const ownerProf: OwnerProfile = {
        id: ownerUser.id,
        email: PRIMARY_OWNER_EMAIL,
        full_name: 'Nikhil (Platform Owner)',
        role: 'owner',
        created_at: ownerUser.created_at,
        last_sign_in_at: new Date().toISOString(),
      };

      localStorage.setItem(
        OWNER_STORAGE_SESSION_KEY,
        JSON.stringify({
          id: ownerUser.id,
          email: PRIMARY_OWNER_EMAIL,
          role: 'owner',
          created_at: ownerUser.created_at,
          timestamp: Date.now(),
        })
      );

      // Attempt Supabase sign in in parallel if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        supabase.auth
          .signInWithPassword({ email: cleanEmail, password: cleanPassword })
          .catch((e) => console.log('Supabase sync note:', e.message));
      }

      setUser(ownerUser);
      setProfile(ownerProf);
      setRole('owner');
      setIsOwner(true);
      setLoading(false);
      return { success: true };
    }

    // Standard Supabase login flow for other accounts
    if (!isSupabaseConfigured()) {
      setLoading(false);
      const msg = 'Invalid credentials. Please use the platform owner email and password to sign in.';
      setError(msg);
      return { success: false, error: msg };
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Authentication completed without returning user data.');
      }

      setUser(data.user);
      setSession(data.session);

      const { role: verifiedRole, profile: userProfile } = await verifyUserRole(data.user);
      setRole(verifiedRole);
      setProfile(userProfile);

      if (verifiedRole !== 'owner') {
        setIsOwner(false);
        setLoading(false);
        return {
          success: false,
          error: 'Access Denied: This portal is strictly restricted to Foundly platform owners.',
        };
      }

      setIsOwner(true);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err?.message || 'Failed to sign in. Please verify your email and password.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem(OWNER_STORAGE_SESSION_KEY);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('unknown');
      setIsOwner(false);
      setError(null);
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isOwner,
        loading,
        error,
        isConfigured,
        login,
        logout,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

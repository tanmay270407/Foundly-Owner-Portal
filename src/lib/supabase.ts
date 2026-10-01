import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or configured credentials
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Stored custom connection credentials for local runtime overrides if needed
const STORAGE_KEY_URL = 'foundly_owner_sb_url';
const STORAGE_KEY_KEY = 'foundly_owner_sb_key';

export function getSupabaseCredentials(): { url: string; key: string } {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) : null;

  return {
    url: customUrl || ENV_SUPABASE_URL,
    key: customKey || ENV_SUPABASE_ANON_KEY,
  };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  }
}

export function clearCustomSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const { url, key } = getSupabaseCredentials();

  // If no credentials configured yet, create a dummy or minimal client to prevent crashes
  const effectiveUrl = url || 'https://placeholder.supabase.co';
  const effectiveKey = key || 'placeholder-anon-key';

  if (!supabaseInstance) {
    supabaseInstance = createClient(effectiveUrl, effectiveKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'foundly_owner_auth_session',
      },
    });
  }

  return supabaseInstance;
}

export function reinitializeSupabaseClient(): SupabaseClient {
  supabaseInstance = null;
  return getSupabaseClient();
}

export const supabase = getSupabaseClient();

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url !== 'https://placeholder.supabase.co' &&
    key !== 'placeholder-anon-key' &&
    url.startsWith('http')
  );
}

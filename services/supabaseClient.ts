
import { createClient } from '@supabase/supabase-js';

/**
 * Safely access environment variables.
 * Handles cases where Vite might stringify undefined/null values.
 */
const getEnv = (key: string): string => {
  try {
    const value = (process.env as any)[key];
    if (value === undefined || value === 'undefined' || value === null) return '';
    return value;
  } catch {
    return '';
  }
};

/**
 * Using the credentials provided to ensure immediate preview functionality.
 * These will act as defaults if environment variables are not present.
 */
const DEFAULT_URL = 'https://tihgqcmowinnrwrreeco.supabase.co';
const DEFAULT_KEY = 'sb_publishable_9ZKn0NUfZ250isgBif9vKg_KmgxPlx7';

const supabaseUrl = getEnv('SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Ensure configuration status is exported for the rest of the app to check
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '');

/**
 * Initialize the Supabase client.
 * We only attempt initialization if the configuration is complete to avoid library-level throws.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

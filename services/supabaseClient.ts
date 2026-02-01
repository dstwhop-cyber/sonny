
import { createClient } from '@supabase/supabase-js';

/**
 * Using the credentials provided to ensure immediate preview functionality.
 * These will act as defaults if environment variables are not present.
 */
const DEFAULT_URL = 'https://tihgqcmowinnrwrreeco.supabase.co';
const DEFAULT_KEY = 'sb_publishable_9ZKn0NUfZ250isgBif9vKg_KmgxPlx7';

// Vite's string replacement requires literal paths to process.env
const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_KEY;

// Ensure configuration status is exported for the rest of the app to check
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '');

/**
 * Initialize the Supabase client.
 * We only attempt initialization if the configuration is complete to avoid library-level throws.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

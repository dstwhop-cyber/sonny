
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { userRegistryService } from './userRegistryService';

export const authService = {
  signup: async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured.' };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };

    if (data.user) {
      await userRegistryService.createProfile(data.user.id, data.user.email!);
    }

    return { success: true, user: data.user };
  },

  login: async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured.' };

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };
    
    if (data.user) {
      const profile = await userRegistryService.getProfile(data.user.id);
      if (!profile) {
        await userRegistryService.createProfile(data.user.id, data.user.email!);
      }
    }

    return { success: true };
  },

  resendConfirmation: async (email: string) => {
    if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase is not configured.' };
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  logout: async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    window.dispatchEvent(new Event('authChange'));
  },

  isAuthenticated: async (): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  getCurrentUserId: async (): Promise<string | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user.id || null;
  }
};

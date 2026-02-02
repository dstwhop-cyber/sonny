
import { userRegistryService } from './userRegistryService';
import { authService } from './authService';
import { UserProfile } from '../types';
import { isSupabaseConfigured } from './supabaseClient';

let cachedProfile: UserProfile | null = null;

export const usageService = {
  getCurrentUser: (): UserProfile | null => cachedProfile,

  refreshProfile: async () => {
    if (!isSupabaseConfigured) return null;
    const userId = await authService.getCurrentUserId();
    if (!userId) {
      cachedProfile = null;
      return null;
    }
    const profile = await userRegistryService.getProfile(userId);
    cachedProfile = profile;
    // Notify application that profile data is ready/updated
    window.dispatchEvent(new Event('profileUpdated'));
    return profile;
  },

  getUsage: () => {
    if (!cachedProfile) return null;
    return {
      isPro: cachedProfile.plan !== 'free',
      textCount: cachedProfile.usage.textCount,
      proCount: cachedProfile.usage.proCount,
      stats: cachedProfile.usage.stats
    };
  },

  getLimits: () => ({ text: 10, pro: 3 }),

  canUse: (type: 'text' | 'pro'): boolean => {
    // If profile is still loading, allow use to avoid locking inputs prematurely
    if (!cachedProfile) return true;
    if (cachedProfile.isBanned) return false;
    if (cachedProfile.plan !== 'free') return true; 

    const limits = usageService.getLimits();
    if (type === 'text') return (cachedProfile.usage.textCount || 0) < limits.text;
    if (type === 'pro') return (cachedProfile.usage.proCount || 0) < limits.pro;
    
    return false;
  },

  increment: async (type: 'text' | 'pro', feature?: string) => {
    if (!isSupabaseConfigured) return;
    const userId = await authService.getCurrentUserId();
    if (!userId || !cachedProfile) return;

    const newStats = { ...cachedProfile.usage.stats };
    if (feature) {
      (newStats as any)[feature] = ((newStats as any)[feature] || 0) + 1;
    }

    await userRegistryService.updateUsage(userId, type, newStats);
    await usageService.refreshProfile();
  },

  getRemaining: (type: 'text' | 'pro'): number => {
    const limits = usageService.getLimits();
    // If no profile yet, show the full limit instead of 0 to avoid red "Locked" UI
    if (!cachedProfile) return limits[type];
    if (cachedProfile.plan !== 'free') return Infinity;
    
    const count = type === 'text' ? (cachedProfile.usage.textCount || 0) : (cachedProfile.usage.proCount || 0);
    return Math.max(0, limits[type] - count);
  }
};

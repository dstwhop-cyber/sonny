
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
    if (!cachedProfile || cachedProfile.isBanned) return false;
    if (cachedProfile.plan !== 'free') return true; 

    const limits = usageService.getLimits();
    if (type === 'text') return cachedProfile.usage.textCount < limits.text;
    if (type === 'pro') return cachedProfile.usage.proCount < limits.pro;
    
    return false;
  },

  increment: async (type: 'text' | 'pro', feature?: string) => {
    if (!isSupabaseConfigured) return;
    const userId = await authService.getCurrentUserId();
    if (!userId || !cachedProfile) return;

    const newStats = { ...cachedProfile.usage.stats };
    if (feature && (newStats as any)[feature] !== undefined) {
      (newStats as any)[feature] += 1;
    }

    await userRegistryService.updateUsage(userId, type, newStats);
    await usageService.refreshProfile();
  },

  getRemaining: (type: 'text' | 'pro'): number => {
    if (!cachedProfile) return 0;
    if (cachedProfile.plan !== 'free') return Infinity;
    const limits = usageService.getLimits();
    return Math.max(0, limits[type] - (type === 'text' ? cachedProfile.usage.textCount : cachedProfile.usage.proCount));
  }
};

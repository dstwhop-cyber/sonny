
import { userRegistryService } from './userRegistryService';
import { authService } from './authService';
import { UserProfile } from '../types';

export const usageService = {
  getCurrentUser: (): UserProfile | null => {
    const userId = authService.getCurrentUserId();
    if (!userId) return null;
    const users = userRegistryService.getUsers();
    return users.find(u => u.id === userId) || null;
  },

  getUsage: () => {
    const user = usageService.getCurrentUser();
    if (!user) return null;
    return {
      isPro: user.plan !== 'free',
      textCount: user.usage.textCount,
      proCount: user.usage.proCount,
      stats: user.usage.stats
    };
  },

  getLimits: () => ({ text: 10, pro: 3 }),

  canUse: (type: 'text' | 'pro'): boolean => {
    const user = usageService.getCurrentUser();

    if (!user || user.isBanned) return false;

    // Paid tiers are unlimited for this demo
    if (user.plan !== 'free') return true; 

    const limits = usageService.getLimits();
    if (type === 'text') return user.usage.textCount < limits.text;
    if (type === 'pro') return user.usage.proCount < limits.pro;
    
    return false;
  },

  increment: (type: 'text' | 'pro', feature?: string) => {
    const userId = authService.getCurrentUserId();
    if (!userId) return;

    const users = userRegistryService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    
    if (idx !== -1) {
      if (type === 'text') users[idx].usage.textCount += 1;
      if (type === 'pro') users[idx].usage.proCount += 1;
      
      if (feature && (users[idx].usage.stats as any)[feature] !== undefined) {
        (users[idx].usage.stats as any)[feature] += 1;
      }
      
      userRegistryService.saveUsers(users);
      
      userRegistryService.addLog({
        level: 'info',
        message: `AI Call: ${type} ${feature ? `(${feature})` : ''}`,
        userId: userId
      });
      
      window.dispatchEvent(new Event('usageUpdated'));
    }
  },

  getRemaining: (type: 'text' | 'pro'): number => {
    const user = usageService.getCurrentUser();
    if (!user) return 0;
    if (user.plan !== 'free') return Infinity;
    const limits = usageService.getLimits();
    return Math.max(0, limits[type] - (type === 'text' ? user.usage.textCount : user.usage.proCount));
  }
};

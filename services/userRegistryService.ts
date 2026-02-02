
import { supabase } from './supabaseClient';
import { UserProfile, SystemLog } from '../types';

export const userRegistryService = {
  // Fetch a single profile by user ID
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    // Map DB fields to UserProfile type with robust fallbacks
    return {
      id: data.id,
      email: data.email,
      plan: data.plan || 'free', // Fallback to free if null
      subStatus: data.sub_status || 'none',
      isBanned: data.is_banned || false,
      createdAt: data.created_at,
      usage: {
        textCount: data.usage_text || 0, // Fallback to 0 if null
        proCount: data.usage_pro || 0,   // Fallback to 0 if null
        stats: data.stats || {}          // Fallback to empty object if null
      },
      passwordHash: '' // Not stored in public table
    };
  },

  // Fetch all user profiles (Admin functionality)
  getUsers: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      email: d.email,
      plan: d.plan || 'free',
      subStatus: d.sub_status || 'none',
      isBanned: d.is_banned || false,
      createdAt: new Date(d.created_at).toLocaleDateString(),
      usage: {
        textCount: d.usage_text || 0,
        proCount: d.usage_pro || 0,
        stats: d.stats || {}
      },
      passwordHash: ''
    }));
  },

  // Fetch system logs (Admin functionality)
  getLogs: async (): Promise<SystemLog[]> => {
    // Placeholder for log retrieval if a logs table existed
    return [];
  },

  // Create initial profile for a new user with explicit defaults
  createProfile: async (userId: string, email: string) => {
    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          email,
          plan: 'free',
          usage_text: 0,
          usage_pro: 0,
          stats: {},
          sub_status: 'none'
        }
      ]);
    
    if (error) console.error('Error creating profile:', error);
  },

  // Increment usage counters for a user
  updateUsage: async (userId: string, type: 'text' | 'pro', stats: any) => {
    const field = type === 'text' ? 'usage_text' : 'usage_pro';
    
    const profile = await userRegistryService.getProfile(userId);
    if (!profile) return;

    // Use current count or default to 0 if somehow null
    const currentCount = type === 'text' ? profile.usage.textCount : profile.usage.proCount;
    const nextCount = (currentCount || 0) + 1;

    const updates = {
      [field]: nextCount,
      stats: { ...(profile.usage.stats || {}), ...stats }
    };

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    window.dispatchEvent(new Event('usageUpdated'));
  },

  // Generic status/plan update for a user
  updateUserStatus: async (userId: string, updates: any) => {
    const dbUpdates: any = {};
    if (updates.plan) dbUpdates.plan = updates.plan;
    if (updates.subId) dbUpdates.sub_id = updates.subId;
    if (updates.subStatus) dbUpdates.sub_status = updates.subStatus;
    if (updates.isBanned !== undefined) dbUpdates.is_banned = updates.isBanned;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId);
    
    if (error) console.error('Error updating user status:', error);
    
    window.dispatchEvent(new Event('profileUpdated'));
    window.dispatchEvent(new Event('usageUpdated'));
  },

  // Specialized plan update (often called after payment success)
  updatePlan: async (userId: string, plan: string, subId: string) => {
    await userRegistryService.updateUserStatus(userId, { plan, subId, subStatus: 'active' });
  },

  // Add a generic system log
  addLog: async (log: Omit<SystemLog, 'timestamp'>) => {
    console.log('System Audit:', log);
  }
};

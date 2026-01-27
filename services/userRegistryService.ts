
import { UserProfile, SystemLog } from '../types';

const USERS_KEY = "sm_pro_registry_v1";
const LOGS_KEY = "sm_pro_audit_logs";

export const userRegistryService = {
  getUsers: (): UserProfile[] => {
    const saved = localStorage.getItem(USERS_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  addUser: (user: UserProfile) => {
    const users = userRegistryService.getUsers();
    users.push(user);
    userRegistryService.saveUsers(users);
    userRegistryService.addLog({
      level: 'info',
      message: `New User Registered: ${user.email}`,
      userId: user.id
    });
  },

  saveUsers: (users: UserProfile[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUserStatus: (userId: string, updates: Partial<UserProfile>) => {
    const users = userRegistryService.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      userRegistryService.saveUsers(users);
      userRegistryService.addLog({
        level: 'info',
        message: `User ${userId} record updated: ${Object.keys(updates).join(', ')}`,
        userId
      });
      // Notify components that user state has changed (e.g. upgrades)
      window.dispatchEvent(new Event('profileUpdated'));
    }
  },

  addLog: (log: Omit<SystemLog, 'timestamp'>) => {
    const logs = userRegistryService.getLogs();
    const newLog = { ...log, timestamp: new Date().toISOString() };
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  },

  getLogs: (): SystemLog[] => {
    const saved = localStorage.getItem(LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  }
};

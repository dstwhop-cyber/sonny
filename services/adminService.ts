
import { GlobalConfig } from '../types';

const OWNER_EMAIL = "owner@socialmediapro.ai";
const SESSION_KEY = "sm_pro_owner_auth";
const CONFIG_KEY = "sm_pro_global_config";

const DEFAULT_CONFIG: GlobalConfig = {
  featuresEnabled: { text: true, media: true, voice: true },
  maintenanceMode: false
};

export const adminService = {
  login: (email: string, password: string, secretKey: string): boolean => {
    // SECURITY: Triple-lock check
    const validSecret = process.env.ADMIN_SECRET_KEY || "owner-master-key-2025";
    
    if (
      email.toLowerCase() === OWNER_EMAIL &&
      password === "admin123" && // In prod, this would be a hashed check
      secretKey === validSecret
    ) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        authenticated: true,
        at: Date.now()
      }));
      return true;
    }
    return false;
  },

  isAuthenticated: (): boolean => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const data = JSON.parse(session);
    return data.authenticated && (Date.now() - data.at < 3600000); // 1hr expiry
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
  },

  getConfig: (): GlobalConfig => {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  },

  updateConfig: (updates: Partial<GlobalConfig>) => {
    const current = adminService.getConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('configUpdated'));
  }
};

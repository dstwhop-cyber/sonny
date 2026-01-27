
import { userRegistryService } from './userRegistryService';
import { UserProfile } from '../types';

const SESSION_KEY = "sm_pro_user_session";

// Simulated password hasher
const hashPassword = (p: string) => `hashed_${btoa(p).split('').reverse().join('')}`;

export const authService = {
  signup: (email: string, password: string): { success: boolean; error?: string } => {
    const users = userRegistryService.getUsers();
    if (users.find(u => u.email === email.toLowerCase())) {
      return { success: false, error: "Email already exists." };
    }

    const newUser: UserProfile = {
      id: `u_${Date.now()}`,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      plan: 'free',
      subStatus: 'none',
      isBanned: false,
      createdAt: new Date().toISOString(),
      usage: {
        textCount: 0,
        proCount: 0,
        stats: {
          captions: 0, hooks: 0, videos: 0,
          images: 0, ideas: 0, voice: 0, analysis: 0,
          video_director: 0, video_planner: 0
        }
      }
    };

    userRegistryService.addUser(newUser);
    authService.createSession(newUser.id);
    return { success: true };
  },

  login: (email: string, password: string): { success: boolean; error?: string } => {
    const users = userRegistryService.getUsers();
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user || user.passwordHash !== hashPassword(password)) {
      return { success: false, error: "Invalid credentials." };
    }

    // Keep check for banned status in case legacy data exists, 
    // though new admins cannot be created to set this.
    if (user.isBanned) {
      return { success: false, error: "Your account has been terminated." };
    }

    authService.createSession(user.id);
    return { success: true };
  },

  logout: () => {
    sessionStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('authChange'));
  },

  createSession: (userId: string) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      id: userId,
      token: `sess_${Math.random().toString(36).substr(2)}`,
      at: Date.now()
    }));
    window.dispatchEvent(new Event('authChange'));
  },

  getCurrentUserId: (): string | null => {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const data = JSON.parse(session);
    // 24 hour session expiry
    if (Date.now() - data.at > 86400000) {
      authService.logout();
      return null;
    }
    return data.id;
  },

  isAuthenticated: (): boolean => {
    return !!authService.getCurrentUserId();
  }
};

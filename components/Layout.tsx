
import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';
import { authService } from '../services/authService';
import { usageService } from '../services/usageService';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, isDarkMode, onToggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(usageService.getCurrentUser());

  useEffect(() => {
    const refreshUser = () => setUser(usageService.getCurrentUser());
    window.addEventListener('profileUpdated', refreshUser);
    window.addEventListener('usageUpdated', refreshUser);
    window.addEventListener('authChange', refreshUser);
    return () => {
      window.removeEventListener('profileUpdated', refreshUser);
      window.removeEventListener('usageUpdated', refreshUser);
      window.removeEventListener('authChange', refreshUser);
    };
  }, []);

  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: ViewType.CAPTION_GEN, label: 'Insta Captions', icon: '✍️' },
    { id: ViewType.TIKTOK_HOOKS, label: 'TikTok Hooks', icon: '🎵' },
    { id: ViewType.SCRIPT_WRITER, label: 'Viral Script Writer', icon: '📜' },
    { id: ViewType.VIDEO_PLANNER, label: 'AI Script Planner', icon: '📋' },
    { id: ViewType.DESCRIPTION_GEN, label: 'Post Descriptions', icon: '📝' },
    { id: ViewType.CONTENT_IDEAS, label: 'Idea Lab', icon: '💡' },
    { id: ViewType.BUSINESS_ADS, label: 'Ad Copywriter', icon: '📢' },
    { id: ViewType.WHATSAPP_PROMO, label: 'WhatsApp Promo', icon: '💬' },
    { id: ViewType.IMAGE_LAB, label: 'AI Image Lab', icon: '🎨' },
    { id: ViewType.VIDEO_STUDIO, label: 'Veo Video Studio', icon: '📽️' },
    { id: ViewType.VOICE_LIVE, label: 'Voice Studio', icon: '🎙️' },
    { id: ViewType.ANALYSIS, label: 'Media Analysis', icon: '🔍' },
    { id: ViewType.PRICING, label: 'Pricing & Pro', icon: '💎' },
  ];

  const handleNavClick = (id: ViewType) => {
    onViewChange(id);
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between lg:block">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-blue-400">SocialMediaPro AI</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Creator Suite</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">✕</button>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeView === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 flex flex-col space-y-3 border-t border-slate-800">
        {user && (
          <div className="px-2">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active User</p>
            <p className="text-xs text-white font-bold truncate">{user.email}</p>
          </div>
        )}
        <button onClick={() => authService.logout()} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-red-400 hover:text-red-300">Sign Out Session</button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col hidden lg:flex border-r border-transparent dark:border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 transition-colors">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden mr-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><span className="text-xl">☰</span></button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">{navItems.find(i => i.id === activeView)?.label || 'Dashboard'}</h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             {user?.plan === 'pro' && <span className="hidden md:inline text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-md uppercase">Master Creator</span>}
            <button onClick={onToggleDarkMode} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">{isDarkMode ? '☀️' : '🌙'}</button>
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xs flex-shrink-0">{user?.email[0].toUpperCase() || 'AI'}</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-0 bg-slate-50 dark:bg-slate-950 transition-colors">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

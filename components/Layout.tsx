
import React, { useState, useEffect, useRef } from 'react';
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

const SonnyLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="28" fill="url(#logoGrad)" />
    <path 
      d="M35 70 C 35 70, 30 65, 30 55 C 30 40, 45 35, 50 35 C 55 35, 70 40, 70 55 C 70 65, 65 70, 65 70" 
      stroke="white" 
      strokeWidth="8" 
      fill="none" 
      strokeLinecap="round" 
      opacity="0.3"
    />
    <text 
      x="50%" 
      y="65%" 
      textAnchor="middle" 
      fill="white" 
      fontSize="48" 
      fontWeight="900" 
      fontFamily="Inter, sans-serif"
      style={{ letterSpacing: '-0.05em' }}
    >
      S
    </text>
    <circle cx="75" cy="25" r="6" fill="#fbbf24" className="animate-pulse" />
  </svg>
);

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, isDarkMode, onToggleDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState(usageService.getCurrentUser());
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refreshUser = () => setUser(usageService.getCurrentUser());
    window.addEventListener('profileUpdated', refreshUser);
    window.addEventListener('usageUpdated', refreshUser);
    window.addEventListener('authChange', refreshUser);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('profileUpdated', refreshUser);
      window.removeEventListener('usageUpdated', refreshUser);
      window.removeEventListener('authChange', refreshUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const coreItems = [
    { id: ViewType.DASHBOARD, label: 'Overview', icon: '🏠' },
    { id: ViewType.SAVED_COLLECTION, label: 'Saved Library', icon: '📂' },
  ];

  const contentItems = [
    { id: ViewType.CAPTION_GEN, label: 'Insta Captions', icon: '✍️' },
    { id: ViewType.TIKTOK_HOOKS, label: 'TikTok Hooks', icon: '🎵' },
    { id: ViewType.SCRIPT_WRITER, label: 'Viral Script Writer', icon: '📜' },
    { id: ViewType.DESCRIPTION_GEN, label: 'Post Descriptions', icon: '📝' },
    { id: ViewType.CONTENT_IDEAS, label: 'Idea Lab', icon: '💡' },
    { id: ViewType.BUSINESS_ADS, label: 'Ad Copywriter', icon: '📢' },
    { id: ViewType.WHATSAPP_PROMO, label: 'WhatsApp Promo', icon: '💬' },
  ];

  const mediaItems = [
    { id: ViewType.IMAGE_LAB, label: 'AI Image Lab', icon: '🎨' },
    { id: ViewType.VIDEO_STUDIO, label: 'Veo Studio', icon: '🎬' },
    { id: ViewType.VIDEO_EDITOR, label: 'Generative Editor', icon: '🎞️' },
    { id: ViewType.TIMELINE_EDITOR, label: 'Timeline Editor', icon: '⏲️' },
    { id: ViewType.VOICE_LIVE, label: 'Voice Studio', icon: '🎙️' },
    { id: ViewType.ANALYSIS, label: 'Media Analysis', icon: '🔍' },
  ];

  const toolkitItems = [
    { id: ViewType.VIDEO_DIRECTOR, label: 'AI Video Director', icon: '🎥' },
    { id: ViewType.VIDEO_PLANNER, label: 'AI Script Planner', icon: '📋' },
    { id: ViewType.SMART_CUT, label: 'Smart Cut AI', icon: '✂️' },
    { id: ViewType.SHORT_CAPTIONS, label: 'Viral Subtitles', icon: '🔥' },
    { id: ViewType.TIKTOK_EDIT_PLAN, label: 'Editing Plan', icon: '📐' },
    { id: ViewType.B_ROLL_GEN, label: 'B-Roll Architect', icon: '📽️' },
    { id: ViewType.MUSIC_SYNC, label: 'Music Syncer', icon: '🎹' },
    { id: ViewType.ZOOM_EFFECTS, label: 'Zoom Dynamics', icon: '🔍' },
    { id: ViewType.VIDEO_TEMPLATES, label: 'Preset Templates', icon: '🔖' },
  ];

  const handleNavClick = (id: ViewType) => {
    onViewChange(id);
    setIsMobileMenuOpen(false);
  };

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="py-2">
      <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="mr-3 text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between lg:block">
        <div className="flex flex-col items-start group cursor-pointer" onClick={() => handleNavClick(ViewType.DASHBOARD)}>
          <div className="flex items-center space-x-3 mb-1">
            <SonnyLogo className="h-10 w-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-110" />
            <span className="text-xl font-black text-white tracking-tighter italic">SONNY</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-1 opacity-70">AI Creator Pro</p>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">✕</button>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-2 overflow-y-auto scrollbar-hide">
        <NavGroup title="Main" items={coreItems} />
        <NavGroup title="Core Content" items={contentItems} />
        <NavGroup title="Media Engine" items={mediaItems} />
        <NavGroup title="Production Toolkit" items={toolkitItems} />
        
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => handleNavClick(ViewType.PRICING)}
            className={`w-full flex items-center px-4 py-3 text-xs font-black rounded-xl transition-all ${
              activeView === ViewType.PRICING 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40 border border-indigo-500/20'
            }`}
          >
            <span className="mr-3 text-base">💎</span>
            Pricing & Pro
          </button>
        </div>
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors font-sans">
      {isMobileMenuOpen && <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
      <aside className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col hidden lg:flex border-r border-transparent dark:border-slate-800 flex-shrink-0">
        <SidebarContent />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shadow-sm z-30 transition-colors">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden mr-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"><span className="text-xl">☰</span></button>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight">Creator Studio</h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             {user?.plan === 'pro' && <span className="hidden md:inline text-[9px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded-md uppercase tracking-widest shadow-lg shadow-blue-500/20">Master Creator</span>}
            <button onClick={onToggleDarkMode} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95">{isDarkMode ? '☀️' : '🌙'}</button>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-lg hover:ring-4 hover:ring-blue-500/20 transition-all active:scale-95"
              >
                {user?.email?.[0].toUpperCase() || 'S'}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 z-50">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.email}</p>
                    <p className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase mt-1 tracking-tight">{user?.plan === 'pro' ? 'Creator Pro Subscription' : 'Free Access Plan'}</p>
                  </div>

                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { onViewChange(ViewType.DASHBOARD); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors group"
                    >
                      <span className="mr-3 opacity-50 group-hover:scale-110 transition-transform">👤</span> Profile & Stats
                    </button>
                    
                    {user?.plan !== 'pro' && (
                      <button 
                        onClick={() => { onViewChange(ViewType.PRICING); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center px-4 py-3 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-2xl transition-colors group"
                      >
                        <span className="mr-3 group-hover:animate-bounce">💎</span> Upgrade to Master Pro
                      </button>
                    )}

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>

                    <button 
                      onClick={() => { onViewChange(ViewType.TERMS); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                    >
                      <span className="mr-3 opacity-50">⚖️</span> Terms of Service
                    </button>
                    
                    <button 
                      onClick={() => { onViewChange(ViewType.PRIVACY); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                    >
                      <span className="mr-3 opacity-50">🔒</span> Privacy Policy
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4"></div>

                    <button 
                      onClick={() => { authService.logout(); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center px-4 py-3 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                    >
                      <span className="mr-3">🚪</span> Sign Out Session
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sonny AI Studio v1.2.5</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-0 bg-slate-50 dark:bg-slate-950 transition-colors">{children}</div>
      </main>
    </div>
  );
};

export default Layout;

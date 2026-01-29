
import React, { useState, useEffect } from 'react';
import { usageService } from '../services/usageService';
import { ViewType } from '../types';

const Dashboard: React.FC = () => {
  const [usage, setUsage] = useState(usageService.getUsage());
  const limits = usageService.getLimits();

  useEffect(() => {
    const updateUsage = () => setUsage(usageService.getUsage());
    window.addEventListener('usageUpdated', updateUsage);
    window.addEventListener('profileUpdated', updateUsage);
    return () => {
      window.removeEventListener('usageUpdated', updateUsage);
      window.removeEventListener('profileUpdated', updateUsage);
    };
  }, []);

  const navigateTo = (view: ViewType) => {
    window.dispatchEvent(new CustomEvent('changeView', { detail: view }));
  };

  // Static list of tools to ensure the dashboard never appears empty
  const tools = [
    { id: ViewType.CAPTION_GEN, label: 'Insta Captions', icon: '✍️', desc: 'Viral captions with deep reasoning.', category: 'Social' },
    { id: ViewType.TIKTOK_HOOKS, label: 'TikTok Hooks', icon: '🎵', desc: 'Scroll-stopping video intros.', category: 'Video' },
    { id: ViewType.SCRIPT_WRITER, label: 'Viral Scripts', icon: '📜', desc: 'Full-length short-form scripts.', category: 'Video' },
    { id: ViewType.VIDEO_PLANNER, label: 'AI Planner', icon: '📋', desc: 'Scene-by-scene production maps.', category: 'Video' },
    { id: ViewType.DESCRIPTION_GEN, label: 'Descriptions', icon: '📝', desc: 'SEO optimized post details.', category: 'SEO' },
    { id: ViewType.CONTENT_IDEAS, label: 'Idea Lab', icon: '💡', desc: 'Strategic content brainstorming.', category: 'Strategy' },
    { id: ViewType.BUSINESS_ADS, label: 'Ad Copy', icon: '📢', desc: 'High-conversion business ads.', category: 'Business' },
    { id: ViewType.WHATSAPP_PROMO, label: 'WA Promos', icon: '💬', desc: 'Punchy sales messages for chat.', category: 'Business' },
    { id: ViewType.IMAGE_LAB, label: 'AI Image Lab', icon: '🎨', desc: '4K visuals with Gemini Pro.', category: 'Media' },
    { id: ViewType.VIDEO_STUDIO, label: 'Veo Studio', icon: '🎬', desc: 'Generate cinematic 720p clips.', category: 'Media' },
    { id: ViewType.VIDEO_EDITOR, label: 'AI Video Editor', icon: '🎞️', desc: 'Transform images into motion.', category: 'Media' },
    { id: ViewType.VOICE_LIVE, label: 'Voice Studio', icon: '🎙️', desc: 'High-fidelity AI narrations.', category: 'Audio' },
    { id: ViewType.ANALYSIS, label: 'Media Analysis', icon: '🔍', desc: 'Intelligence reports for media.', category: 'AI' },
    { id: ViewType.VIDEO_DIRECTOR, label: 'AI Director', icon: '🎥', desc: 'Expert coordination & roadmap.', category: 'Premium' },
  ];

  const textProgress = usage?.isPro ? 100 : (usage ? (usage.textCount / limits.text) * 100 : 0);
  const proProgress = usage?.isPro ? 100 : (usage ? (usage.proCount / limits.pro) * 100 : 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 p-6 md:p-10 pb-32">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Creator Command Center</p>
          <h2 className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
            What are we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">creating</span> today?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Choose an engine from the launchpad below to get started.
          </p>
        </div>
        
        {/* Quick Usage Summary */}
        {usage && !usage.isPro && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Text Credits</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-600" style={{ width: `${Math.min(textProgress, 100)}%` }}></div>
                </div>
                <span className="text-xs font-bold">{usage.textCount}/{limits.text}</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:border-slate-800"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pro Trials</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-600" style={{ width: `${Math.min(proProgress, 100)}%` }}></div>
                </div>
                <span className="text-xs font-bold">{usage.proCount}/{limits.pro}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Launchpad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => navigateTo(tool.id)}
            className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 text-left active:scale-95"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 shadow-inner ring-1 ring-slate-100 dark:ring-slate-700/50">
                {tool.icon}
              </div>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">
                {tool.category}
              </span>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                {tool.label}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {tool.desc}
              </p>
            </div>
            
            <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              Launch Engine 
              <span className="ml-2">→</span>
            </div>
            
            {/* Background Accent */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-br-[2.5rem] pointer-events-none"></div>
          </button>
        ))}
      </div>

      {/* Hero Upgrade Section */}
      {usage?.isPro ? (
        <div className="bg-slate-900 dark:bg-indigo-950/20 p-12 rounded-[3rem] border border-indigo-500/30 flex items-center justify-between text-left shadow-2xl relative overflow-hidden">
           <div className="space-y-2 z-10">
             <div className="flex items-center space-x-3">
                <span className="text-3xl">💎</span>
                <h4 className="text-2xl font-black text-white uppercase tracking-widest">Master Creator Plan</h4>
             </div>
             <p className="text-slate-400 max-w-xl font-medium">Your studio is operating at 100% capacity. You have unrestricted access to Veo Video, 4K Imaging, and Long-form Intelligence.</p>
           </div>
           <div className="text-9xl opacity-5 absolute right-[-50px] top-[-50px] rotate-12">👑</div>
        </div>
      ) : (
        <div className="p-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="flex items-center space-x-8 text-center lg:text-left mb-8 lg:mb-0 relative z-10">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">⚡</div>
            <div>
              <h4 className="text-3xl font-black tracking-tight">Unlock Professional Power</h4>
              <p className="text-white/80 font-medium mt-1 text-lg max-w-lg">Get unlimited 4K visuals, Veo video engine, and High-fidelity narrations for your brand.</p>
            </div>
          </div>
          <button 
            onClick={() => navigateTo(ViewType.PRICING)} 
            className="px-12 py-6 bg-white text-blue-600 font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10 text-lg uppercase tracking-widest"
          >
            Go Unlimited
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

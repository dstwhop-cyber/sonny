
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

  const tools = [
    { id: ViewType.CAPTION_GEN, label: 'Insta Captions', icon: '✍️', desc: 'Viral captions with Llama 3.2.', category: 'Social', pro: false },
    { id: ViewType.TIKTOK_HOOKS, label: 'TikTok Hooks', icon: '🎵', desc: 'Scroll-stopping video intros.', category: 'Video', pro: false },
    { id: ViewType.SCRIPT_WRITER, label: 'Viral Scripts', icon: '📜', desc: 'Full-length short-form scripts.', category: 'Video', pro: false },
    { id: ViewType.VIDEO_PLANNER, label: 'AI Planner', icon: '📋', desc: 'Scene-by-scene production maps.', category: 'Video', pro: false },
    { id: ViewType.DESCRIPTION_GEN, label: 'Descriptions', icon: '📝', desc: 'SEO optimized post details.', category: 'SEO', pro: false },
    { id: ViewType.CONTENT_IDEAS, label: 'Idea Lab', icon: '💡', desc: 'Strategic content brainstorming.', category: 'Strategy', pro: false },
    { id: ViewType.BUSINESS_ADS, label: 'Ad Copy', icon: '📢', desc: 'High-conversion business ads.', category: 'Business', pro: false },
    { id: ViewType.WHATSAPP_PROMO, label: 'WA Promos', icon: '💬', desc: 'Punchy sales messages for chat.', category: 'Business', pro: false },
    { id: ViewType.IMAGE_LAB, label: 'FLUX Studio', icon: '🎨', desc: 'High-fidelity visuals with FLUX.1.', category: 'Media', pro: true },
    { id: ViewType.VIDEO_STUDIO, label: 'Motion Lab', icon: '🎬', desc: 'Generate open-source video clips.', category: 'Media', pro: true },
    { id: ViewType.VIDEO_EDITOR, label: 'Sync Studio', icon: '🎞️', desc: 'Neural motion interpolation.', category: 'Media', pro: true },
    { id: ViewType.VOICE_LIVE, label: 'Voice Studio', icon: '🎙️', desc: 'MMS Architecture narrations.', category: 'Audio', pro: true },
    { id: ViewType.ANALYSIS, label: 'Media Analysis', icon: '🔍', desc: 'BLIP Intelligence reports.', category: 'AI', pro: true },
    { id: ViewType.VIDEO_DIRECTOR, label: 'AI Director', icon: '🎥', desc: 'Expert coordination & roadmap.', category: 'Premium', pro: true },
  ];

  const textProgress = usage?.isPro ? 100 : (usage ? (usage.textCount / limits.text) * 100 : 0);
  const proProgress = usage?.isPro ? 100 : (usage ? (usage.proCount / limits.pro) * 100 : 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 p-6 md:p-10 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Hugging Face Command Center</p>
          <h2 className="text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
            What are we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">synthesizing</span> today?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Powered by Hugging Face Inference API and Open Source SOTA models.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <button 
            key={tool.id}
            onClick={() => navigateTo(tool.id)}
            className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 text-left active:scale-95"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                {tool.icon}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">
                  {tool.category}
                </span>
                {tool.pro && (
                  <span className="mt-1 text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    PRO
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 group-hover:text-blue-500 transition-colors uppercase tracking-tighter italic">
                {tool.label}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {tool.desc}
              </p>
            </div>
            
            <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              Launch Sync 
              <span className="ml-2">→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="p-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-white flex flex-col lg:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-8 text-center lg:text-left mb-8 lg:mb-0 relative z-10">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">🔥</div>
          <div>
            <h4 className="text-3xl font-black tracking-tight">Open Source Power</h4>
            <p className="text-white/80 font-medium mt-1 text-lg max-w-lg">Get unlimited high-speed inference for Llama 3, FLUX, and Whisper models.</p>
          </div>
        </div>
        <button 
          onClick={() => navigateTo(ViewType.PRICING)} 
          className="px-12 py-6 bg-white text-blue-600 font-black rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all relative z-10 text-lg uppercase tracking-widest"
        >
          Go Unlimited
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

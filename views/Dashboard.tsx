
import React, { useState, useEffect } from 'react';
import { usageService } from '../services/usageService';

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

  if (!usage) return null;

  const textProgress = usage.isPro ? 100 : (usage.textCount / limits.text) * 100;
  const proProgress = usage.isPro ? 100 : (usage.proCount / limits.pro) * 100;

  const statsBreakdown = [
    { label: 'Scripts', value: usage.textCount, icon: '📜' },
    { label: 'Captions', value: usage.stats.captions, icon: '✍️' },
    { label: 'Hooks', value: usage.stats.hooks, icon: '🎵' },
    { label: 'Images', value: usage.stats.images, icon: '🎨' },
    { label: 'Ideas', value: usage.stats.ideas, icon: '💡' },
    { label: 'Voice', value: usage.stats.voice, icon: '🎙️' },
    { label: 'Analysis', value: usage.stats.analysis, icon: '🔍' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Sonny Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {usage.isPro ? 'Enjoy unrestricted access to the full Sonny AI suite.' : 'Monitor your lifetime trial credits.'}
          </p>
        </div>
        {!usage.isPro && (
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-transform active:scale-95"
          >
            Unlock Unlimited Pro
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Copywriting</h3>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {usage.isPro ? '∞' : `${usage.textCount} / ${limits.text}`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${usage.isPro ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(textProgress, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Captions, Scripts, Hooks, and Post Descriptions.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Visuals & Voice</h3>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              {usage.isPro ? '∞' : `${usage.proCount} / ${limits.pro}`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${usage.isPro ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-purple-600'}`} style={{ width: `${Math.min(proProgress, 100)}%` }}></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">4K Images and Voice Synthesis.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Creator Performance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800">
          {statsBreakdown.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{stat.icon}</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-100">{stat.value}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {usage.isPro ? (
        <div className="p-8 bg-slate-900 dark:bg-blue-900/30 rounded-[2rem] border border-blue-500/30 flex items-center justify-center text-center shadow-lg">
           <div className="space-y-2">
             <div className="text-4xl">👑</div>
             <h4 className="text-xl font-black text-white dark:text-blue-400 uppercase tracking-widest">Master Sonny Status</h4>
             <p className="text-slate-400 max-w-md mx-auto text-sm">Unlocked full potential of Sonny AI.</p>
           </div>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-6 text-center md:text-left mb-6 md:mb-0">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">💎</div>
            <div>
              <h4 className="text-xl font-black">Join Sonny Pro</h4>
              <p className="text-white/80 font-medium">Unlimited 4K images and Voice studio.</p>
            </div>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))} className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:scale-105 transition-all">Upgrade Now</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

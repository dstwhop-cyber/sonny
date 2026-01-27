
import React, { useState, useEffect } from 'react';
import { generateVideoTemplate } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { VideoTemplate } from '../types';

const VideoTemplates: React.FC = () => {
  const [type, setType] = useState('Short Educational Tutorial');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoTemplate | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!type.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await generateVideoTemplate(type);
      setResult(data);
      usageService.increment('text', 'templates');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate template.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10 transition-colors">
        <div className="text-center space-y-4">
          <div className="text-7xl mb-6">📋</div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Preset Template Lab</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Generate high-conversion reusable presets for your video production. Standardize your edits for consistency and speed.
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-6">
           <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Video Format Genre</label>
              <select 
                value={type}
                onChange={e => setType(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 font-bold text-center text-lg appearance-none cursor-pointer"
              >
                <option>Short Educational Tutorial</option>
                <option>Fast-paced Lifestyle Vlog</option>
                <option>Cinematic Product Showcase</option>
                <option>Talking Head / Podcast Clip</option>
                <option>Aggressive / Urgent Sales Promo</option>
                <option>Street Style Interview</option>
              </select>
           </div>

           <button 
            onClick={handleGenerate}
            disabled={loading || isLimitReached}
            className={`w-full py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all active:scale-95 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}
          >
            {loading ? 'Designing Framework...' : 'Generate Reusable Preset'}
          </button>
        </div>

        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-700">
             {[
               { label: 'Cut Pacing', value: result.cut_pacing, icon: '⚡' },
               { label: 'Caption Style', value: result.caption_style, icon: '✍️' },
               { label: 'Music Usage', value: result.music_usage, icon: '🎵' },
               { label: 'Effects Style', value: result.effects_style, icon: '✨' },
             ].map((item, i) => (
               <div key={i} className="p-8 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] space-y-3 hover:border-blue-400 transition-colors">
                 <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</h5>
                 </div>
                 <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">{item.value}</p>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTemplates;

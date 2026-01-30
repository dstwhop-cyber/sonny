
import React, { useState, useEffect } from 'react';
import { generateSocialScripts } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ScriptVariation, ViewType } from '../types';

const ScriptWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [duration, setDuration] = useState('60s');
  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<ScriptVariation[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));
  const user = usageService.getCurrentUser();
  const isPro = user?.plan === 'pro' || user?.plan === 'agency';

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setVariations([]);
    try {
      const data = await generateSocialScripts({ topic, tone, duration });
      setVariations(data);
      usageService.increment('text', 'scripts');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate scripts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDurationClick = (val: string) => {
    if (!isPro && val !== '60s') {
      if (confirm(`Setting custom durations (${val}) is a Pro feature. Would you like to see pricing?`)) {
        window.dispatchEvent(new CustomEvent('changeView', { detail: ViewType.PRICING }));
      }
      return;
    }
    setDuration(val);
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Sidebar Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📜</span> Viral Scripting
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Craft high-retention scripts for TikTok, Reels, and Shorts. Optimized for maximum watch time.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Topic or Hook</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="What is this video about? e.g. 5 hidden secrets of iPhone users..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Script Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {['15s', '60s', '90s', '120s'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleDurationClick(val)}
                    className={`relative py-3 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-2 ${
                      duration === val 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400'
                    }`}
                  >
                    <span>{val}</span>
                    {!isPro && val !== '60s' && (
                      <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">Pro</span>
                    )}
                  </button>
                ))}
              </div>
              {!isPro && (
                <p className="text-[10px] text-slate-400 mt-2 italic font-medium px-1 leading-tight">
                  Free plan is locked to 60s viral standard. Upgrade to unlock custom lengths (up to 120s).
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tone of Voice</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50 font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
              >
                <option>High Energy</option>
                <option>Educational</option>
                <option>Controversial</option>
                <option>Storytelling</option>
                <option>Witty & Funny</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !topic.trim() || isLimitReached}
            className={`w-full py-5 rounded-3xl font-black text-white text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-600 to-blue-700 hover:shadow-blue-500/20'}`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Directing...</span>
              </>
            ) : (
              <>
                <span>Write Scripts</span>
                <span className="text-xl">✍️</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Results Area */}
      <div className="lg:col-span-8 space-y-6">
        {variations.length > 0 ? (
          <div className="space-y-6">
            {variations.map((v, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Variation #{i+1}: {v.variation_title}</h4>
                   <button 
                     onClick={() => {
                        const text = `HOOK: ${v.hook}\n\nBODY: ${v.body}\n\nCTA: ${v.cta}\n\n${v.hashtags.join(' ')}`;
                        navigator.clipboard.writeText(text);
                        alert("Variation copied to clipboard!");
                     }}
                     className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline"
                   >
                     Copy Script
                   </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">The Hook (0-3s)</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight underline decoration-red-500/30 underline-offset-4">{v.hook}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Body & Value (3-55s)</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{v.body}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Call to Action (Last 5s)</p>
                    <p className="text-sm font-black text-slate-800 dark:text-white">{v.cta}</p>
                  </div>
                  <div className="pt-4 flex flex-wrap gap-2">
                     {v.hashtags.map((h, idx) => (
                       <span key={idx} className="text-[10px] font-bold text-slate-400">#{h}</span>
                     ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col items-center justify-center text-center p-12 transition-colors">
            {loading ? (
              <div className="space-y-6 max-w-sm">
                <div className="relative w-24 h-24 mx-auto">
                   <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="space-y-2">
                   <p className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Analyzing Topic Trends</p>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">Gemini 3 Flash is currently architecting 3 unique script variations optimized for the {duration} timeframe.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 opacity-30 max-w-xs">
                <div className="text-9xl mb-4">📜</div>
                <div className="space-y-2">
                  <p className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Script Board Empty</p>
                  <p className="text-sm text-slate-500 font-medium">Input your video topic to generate a viral roadmap for your short-form content.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;

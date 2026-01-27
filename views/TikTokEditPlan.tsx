
import React, { useState, useEffect } from 'react';
import { generateTikTokEditPlan } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { EditPlanItem } from '../types';

const TikTokEditPlan: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EditPlanItem[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await generateTikTokEditPlan(topic, tone);
      setResults(data);
      usageService.increment('text', 'tiktok_edit_plan');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate editing plan.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📐</span> Editing Plan
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Generate a step-by-step editing roadmap for viral retention. We'll suggest jump cuts, zooms, and text pop-ups synchronized to your topic.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Video Topic</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="e.g. 5 Morning Habits for Success..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Desired Tone</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 disabled:opacity-50"
              >
                <option>High Energy</option>
                <option>Informative & Clean</option>
                <option>Cinematic & Slow</option>
                <option>Aggressive / Urgent</option>
                <option>Storyteller</option>
              </select>
            </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3">Daily Inspiration Limit Met</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest"
              >
                Go Unlimited
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/20'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Drafting Strategy...</span>
                </>
              ) : 'Generate Editing Plan'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Director's Roadmap</h4>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                {results.length} Strategic Steps
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-6">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex flex-col space-y-3 transition-all hover:border-indigo-400 group relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                          {item.timestamp}
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                          {item.action}
                        </span>
                      </div>
                      {item.text_overlay && (
                        <div className="bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[10px] font-black px-2 py-1 rounded border border-pink-200 dark:border-pink-800 animate-pulse">
                          POP: "{item.text_overlay}"
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                        <span className="text-slate-400 font-bold uppercase text-[9px] mr-2">Visual:</span>
                        {item.visual}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        <span className="text-slate-400 font-bold uppercase text-[9px] mr-2">Retention logic:</span>
                        {item.reasoning}
                      </p>
                    </div>

                    <div className="absolute right-[-20px] top-[-20px] text-6xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">
                      🎬
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">📐</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Timeline Blueprint</p>
                  <p className="text-xs text-slate-500 mt-2">Enter a video topic to generate a viral-ready editing timeline with frame-by-frame instructions.</p>
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <button 
                 onClick={() => {
                   const text = results.map(r => `[${r.timestamp}] ${r.action.toUpperCase()}\nVISUAL: ${r.visual}\n${r.text_overlay ? `POP-UP: ${r.text_overlay}\n` : ''}WHY: ${r.reasoning}`).join('\n\n---\n\n');
                   navigator.clipboard.writeText(text);
                   alert('Plan copied to clipboard!');
                 }}
                 className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
               >
                 Export Strategy Draft
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TikTokEditPlan;

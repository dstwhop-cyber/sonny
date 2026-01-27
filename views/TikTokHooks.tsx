
import React, { useState, useEffect } from 'react';
import { generateTikTokHooks } from '../services/geminiService';
import { usageService } from '../services/usageService';

const TikTokHooks: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('text')) return;
    setLoading(true);
    try {
      const data = await generateTikTokHooks({ topic, tone });
      setResult(data);
      usageService.increment('text');
    } catch (err) {
      console.error(err);
      alert("Failed to generate TikTok hooks.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">🎵</span> Hook Strategy
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Generate 3 viral-ready hooks that stop the scroll.
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Topic</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Life hacks for busy students"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
            >
              <option>High Energy</option>
              <option>Controversial</option>
              <option>Storytelling</option>
              <option>Educational</option>
              <option>Humorous</option>
            </select>
          </div>
          
          {isLimitReached ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-center space-y-3">
              <p className="text-xs font-bold text-red-700 dark:text-red-400">Daily Limit Reached</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest hover:scale-105 transition-transform"
              >
                Go Pro
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600'}`}
            >
              {loading ? 'Analyzing Trends...' : 'Generate Viral Hooks'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[400px] flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Hook Laboratory</h3>
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative group transition-colors">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                      {result}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="absolute top-4 right-4 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-200"
                  >
                    📋 Copy All
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 dark:text-slate-600">
                <div className="text-6xl animate-bounce">🎬</div>
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Ready for the FYP?</p>
                  <p className="text-sm">Input your topic to see viral potential.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokHooks;

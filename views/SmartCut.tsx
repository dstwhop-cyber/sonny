
import React, { useState, useEffect } from 'react';
import { generateEditDecisions } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { EditDecision } from '../types';

const SmartCut: React.FC = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EditDecision[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleAnalyze = async () => {
    if (!description.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await generateEditDecisions(description);
      setResults(data);
      usageService.increment('text', 'video_edits');
    } catch (err: any) {
      console.error(err);
      alert("Failed to analyze for smart cuts.");
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
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Smart Cut AI</h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Paste your video transcript or a detailed description of the raw footage. Our AI editor will identify pauses, silent gaps, and recommend professional cuts.
          </p>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Video Content / Transcript</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. 0:00 - Intro starts. 0:15 - long pause while I look at notes. 0:22 - resumes talking about the product features..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-64 outline-none focus:ring-2 focus:ring-cyan-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none font-mono text-xs"
            />
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3">Limit reached for today.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAnalyze}
              disabled={loading || !description.trim()}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Timeline...</span>
                </>
              ) : 'Identify Smart Cuts'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Editing Decision Log</h4>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-1 rounded">
                {results.filter(r => r.action === 'cut').length} Cuts Suggested
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px]">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((decision, idx) => (
                  <div 
                    key={idx}
                    className={`p-5 rounded-2xl border flex items-start justify-between transition-all hover:translate-x-1 ${
                      decision.action === 'cut' 
                        ? 'bg-red-50/30 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                        : 'bg-green-50/30 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${
                          decision.action === 'cut' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {decision.action}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {decision.start_time} — {decision.end_time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "{decision.reason}"
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      {decision.action === 'cut' ? '✂️' : '✅'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">🎞️</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Timeline Empty</p>
                  <p className="text-xs text-slate-500 mt-2">Paste a video transcript or log to get structured editing decisions and smart cut recommendations.</p>
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <button 
                 onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
                 className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
               >
                 Export JSON Data
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartCut;

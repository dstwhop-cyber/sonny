
import React, { useState, useEffect } from 'react';
import { generateBRollSuggestions } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { BRollSuggestion } from '../types';

const BRollGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('60s');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BRollSuggestion[]>([]);
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
      const data = await generateBRollSuggestions(topic, duration);
      setResults(data);
      usageService.increment('text', 'b_roll');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate b-roll suggestions.");
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
              <span className="mr-2">📽️</span> B-Roll Architect
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Generate cinematic b-roll suggestions synchronized to your topic and video length.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Video Topic</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="e.g. A morning routine video for high performance..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Main Video Duration</label>
              <select 
                value={duration}
                onChange={e => setDuration(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>15s</option>
                <option>30s</option>
                <option>60s</option>
                <option>2m</option>
                <option>5m</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !topic.trim() || isLimitReached}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Mapping Visuals...</span>
              </>
            ) : 'Generate B-Roll Strategy'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">B-Roll Visual Log</h4>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                {results.length} Suggestions
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-4">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex flex-col space-y-2 transition-all hover:border-blue-400 group relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                        {item.timestamp}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Duration: {item.duration}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                      {item.description}
                    </p>

                    <div className="absolute right-[-15px] top-[-15px] text-5xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 pointer-events-none">
                      📽️
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">📽️</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Visual Archive Empty</p>
                  <p className="text-xs text-slate-500 mt-2">Describe your video topic to receive a professionally curated list of B-roll inserts.</p>
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <button 
                 onClick={() => {
                   const text = results.map(r => `[${r.timestamp} - ${r.duration}] ${r.description}`).join('\n\n---\n\n');
                   navigator.clipboard.writeText(text);
                   alert('B-Roll plan copied to clipboard!');
                 }}
                 className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
               >
                 Export B-Roll List
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BRollGenerator;

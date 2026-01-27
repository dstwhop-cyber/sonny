
import React, { useState, useEffect } from 'react';
import { generateMusicSync } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { MusicSyncItem } from '../types';

const MusicSync: React.FC = () => {
  const [mood, setMood] = useState('High Energy / Viral');
  const [duration, setDuration] = useState('30s');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MusicSyncItem[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!mood.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await generateMusicSync(mood, duration);
      setResults(data);
      usageService.increment('text', 'music_sync');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate music sync plan.");
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
              <span className="mr-2">🎹</span> Music Syncer
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Sync your video edits perfectly to the beat. Get precise instructions on cuts and volume levels.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Music Mood</label>
              <select 
                value={mood}
                onChange={e => setMood(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>High Energy / Viral</option>
                <option>Lo-fi / Chill</option>
                <option>Cinematic / Epic</option>
                <option>Aggressive / Phonk</option>
                <option>Inspirational / Acoustic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Desired Video Length</label>
              <select 
                value={duration}
                onChange={e => setDuration(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>15s</option>
                <option>30s</option>
                <option>60s</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || isLimitReached}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/20'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Syncing Rhythms...</span>
              </>
            ) : 'Analyze Beat Sync'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beat Synchronization Map</h4>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-4">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:border-emerald-400 group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase min-w-[50px] text-center">
                        {item.timestamp}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                          {item.action}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">
                          Volume: {item.volume_level}
                        </p>
                      </div>
                    </div>
                    <div className="text-xl opacity-20 group-hover:opacity-100 transition-opacity">
                       🎹
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">🎹</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Timeline Silent</p>
                  <p className="text-xs text-slate-500 mt-2">Pick a music mood to generate a frame-accurate beat syncing strategy for your video.</p>
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <button 
                 onClick={() => {
                   const text = results.map(r => `[${r.timestamp}] ${r.action.toUpperCase()} - Volume: ${r.volume_level}`).join('\n');
                   navigator.clipboard.writeText(text);
                   alert('Music sync plan copied!');
                 }}
                 className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
               >
                 Export Sync Script
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicSync;

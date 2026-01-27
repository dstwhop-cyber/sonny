
import React, { useState, useEffect } from 'react';
import { generateZoomEffects } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ZoomEffect } from '../types';

const ZoomEffects: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ZoomEffect[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!transcript.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await generateZoomEffects(transcript);
      setResults(data);
      usageService.increment('text', 'zoom_effects');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate zoom plan.");
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
              <span className="mr-2">🔍</span> Zoom Dynamics
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Automatically identify emphasis moments in your script and apply subtle zoom-in effects for maximum retention.
          </p>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Voiceover Script / Transcript</label>
            <textarea 
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              disabled={isLimitReached}
              placeholder="Paste your video transcript here to analyze for emotional or factual emphasis..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-64 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !transcript.trim() || isLimitReached}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/20'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Emphasis...</span>
              </>
            ) : 'Plan Dynamic Zooms'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dynamic Frame Automation Log</h4>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-4">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:border-indigo-400 group relative overflow-hidden"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          {item.timestamp_start} — {item.timestamp_end}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smooth Ease-In/Out</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
                        Action: Apply subtle focal zoom to 1.15x
                      </p>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block mb-1">Zoom Factor</span>
                       <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{item.zoom_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">🔍</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Zoom Engine Idle</p>
                  <p className="text-xs text-slate-500 mt-2">Submit a transcript to receive a precise list of zoom-in and zoom-out keyframes optimized for viewer retention.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomEffects;

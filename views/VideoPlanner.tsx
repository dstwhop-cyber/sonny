
import React, { useState, useEffect } from 'react';
import { generateVideoPlan } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { VideoGenerationPlan } from '../types';

const VideoPlanner: React.FC = () => {
  const [script, setScript] = useState('');
  const [style, setStyle] = useState('Viral / Energetic');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<VideoGenerationPlan | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!script.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateVideoPlan({ script, style });
      if (result) {
        setPlan(result);
        usageService.increment('text', 'video_planner');
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate video plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-10 animate-in fade-in duration-500">
      {/* Input Side */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-8 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📋</span> Script Planner
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Transform your raw script into a frame-by-frame production roadmap. <strong>Duration is automatically calculated</strong> based on the length of your script.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Video Script</label>
              <textarea 
                value={script}
                onChange={e => setScript(e.target.value)}
                disabled={isLimitReached}
                placeholder="Paste your script here. The plan will adjust to its natural length..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-64 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Video Style</label>
              <select 
                value={style}
                onChange={e => setStyle(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50 font-bold"
              >
                <option>Viral / Energetic</option>
                <option>Educational / Clean</option>
                <option>Documentary / Serious</option>
                <option>Cinematic / Moody</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !script.trim() || isLimitReached}
            className={`w-full py-5 rounded-2xl font-black text-white text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-500/30'}`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Architecting Plan...</span>
              </>
            ) : (
              <>
                <span>Generate Roadmap</span>
                <span className="text-xl">✨</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Side */}
      <div className="lg:col-span-8">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col overflow-hidden transition-colors">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Production Blueprint</h4>
            {plan && (
              <div className="flex items-center space-x-4">
                <span className="text-xs font-bold text-slate-500">
                  Total Length: <span className="text-blue-600 dark:text-blue-400">{plan.total_duration_seconds}s</span>
                </span>
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `video-plan-${Date.now()}.json`;
                    a.click();
                  }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg text-xs font-bold shadow-sm hover:scale-105 active:scale-95 transition-all"
                >
                  Export JSON
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-8 space-y-8 overflow-y-auto max-h-[800px] scrollbar-hide">
            {plan ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {plan.scenes.map((scene) => (
                  <div 
                    key={scene.scene_id} 
                    className="group bg-slate-50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-400 transition-all shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-3">
                        <span className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-black text-xs">
                          {scene.scene_id}
                        </span>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{scene.duration_seconds} Seconds</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[9px] font-black px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded uppercase tracking-tighter">
                          {scene.camera}
                        </span>
                        <span className="text-[9px] font-black px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded uppercase tracking-tighter">
                          {scene.background}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Narration / Dialogue</p>
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">
                            "{scene.narration}"
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Visual Scene Description</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {scene.visuals}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                          <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1.5">On-Screen Text Overlay</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            {scene.on_screen_text}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5">Audio & Sound FX</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {scene.audio}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-40 opacity-30">
                <div className="text-8xl">📽️</div>
                <div className="max-w-md mx-auto space-y-2">
                  <p className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Timeline Empty</p>
                  <p className="text-xs text-slate-500 leading-relaxed px-10">
                    Paste your video script to generate a synchronized production plan with visual, audio, and camera instructions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlanner;


import React, { useState, useEffect } from 'react';
import { generateFullEditPlan } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { FullEditPlan } from '../types';

const VideoDirector: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy / Viral');
  const [platform, setPlatform] = useState('TikTok');
  const [musicMood, setMusicMood] = useState('Phonk / Bass Boosted');
  const [captionStyle, setCaptionStyle] = useState('Bold / Animated');
  const [duration, setDuration] = useState('30s');
  
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<FullEditPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'subtitles' | 'visuals' | 'audio'>('timeline');
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setPlan(null);
    try {
      const data = await generateFullEditPlan({ 
        topic, 
        duration, 
        tone, 
        platform, 
        music_mood: musicMood, 
        caption_style: captionStyle 
      });
      setPlan(data);
      usageService.increment('text', 'video_director');
    } catch (err: any) {
      console.error(err);
      alert("Failed to coordinate expert edit plan.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-3 text-4xl">🎬</span> AI Video Director
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Professional expert-led roadmaps for viral short-form content.</p>
          </div>
          <div className="flex items-center space-x-3">
             <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Daily Sessions Left
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Topic / Script</label>
                  <textarea 
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    disabled={isLimitReached}
                    placeholder="e.g. 3 Tips for Better Sleep..."
                    className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors resize-none text-sm leading-relaxed"
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                    <select value={duration} onChange={e => setDuration(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-xs font-bold dark:text-slate-200">
                      <option>15s</option>
                      <option>30s</option>
                      <option>60s</option>
                      <option>90s</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-xs font-bold dark:text-slate-200">
                      <option>TikTok</option>
                      <option>Instagram Reels</option>
                      <option>YouTube Shorts</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Video Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-xs font-bold dark:text-slate-200">
                      <option>High Energy / Viral</option>
                      <option>Professional / Educational</option>
                      <option>Aesthetic / Slow Vibe</option>
                      <option>Aggressive / Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Music Mood</label>
                    <select value={musicMood} onChange={e => setMusicMood(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-xs font-bold dark:text-slate-200">
                      <option>Phonk / Bass Boosted</option>
                      <option>Lo-fi / Chill</option>
                      <option>Cinematic / Orchestral</option>
                      <option>Upbeat / Pop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Caption Style</label>
                    <select value={captionStyle} onChange={e => setCaptionStyle(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none text-xs font-bold dark:text-slate-200">
                      <option>Bold / Animated</option>
                      <option>Minimalist / Clean</option>
                      <option>Subtle / Professional</option>
                    </select>
                  </div>
               </div>

               <button 
                onClick={handleGenerate}
                disabled={loading || !topic.trim() || isLimitReached}
                className={`w-full py-5 rounded-3xl font-black text-white text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-500/30'}`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Directing Session...</span>
                  </>
                ) : (
                  <>
                    <span>Produce Master Strategy</span>
                    <span className="text-xl">✨</span>
                  </>
                )}
              </button>
            </div>

            {plan && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white space-y-4 shadow-xl">
                 <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Director's Intent</h4>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                       <span className="text-2xl">⚡</span>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Edit Pacing</p>
                          <p className="font-bold text-sm">{plan.style_preset.pacing}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <span className="text-2xl">🎨</span>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Visual Identity</p>
                          <p className="font-bold text-sm">{plan.style_preset.vibe}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <span className="text-2xl">🔤</span>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Typography Recommendation</p>
                          <p className="font-bold text-sm">{plan.style_preset.font_suggestion}</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col overflow-hidden transition-colors">
              {plan ? (
                <>
                  {/* Tabs */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    {[
                      { id: 'timeline', label: 'Timeline & Cuts', icon: '✂️' },
                      { id: 'subtitles', label: 'Captions', icon: '✍️' },
                      { id: 'visuals', label: 'Motion & FX', icon: '✨' },
                      { id: 'audio', label: 'Audio & Beats', icon: '🎹' },
                    ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-5 flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 border-b-2 border-blue-600' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 p-8 overflow-y-auto max-h-[700px] scrollbar-hide">
                    {activeTab === 'timeline' && (
                      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {plan.cuts.map((cut, idx) => (
                            <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 space-y-2 group hover:border-blue-400 transition-colors">
                               <div className="flex items-center space-x-2">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${cut.action.toLowerCase().includes('cut') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{cut.action}</span>
                                  <span className="text-xs font-mono font-bold text-slate-500">{cut.start} — {cut.end}</span>
                               </div>
                               <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">{cut.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'subtitles' && (
                      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                        {plan.captions.map((cap, idx) => (
                          <div key={idx} className="flex items-start space-x-6 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                             <div className="w-20 flex-shrink-0 pt-1">
                                <span className="bg-slate-100 dark:bg-slate-700 text-[10px] font-mono font-bold px-2 py-1 rounded text-slate-400 group-hover:text-blue-500 transition-colors">
                                  {cap.start}
                                </span>
                             </div>
                             <p className="text-xl text-slate-800 dark:text-slate-100 font-bold leading-tight tracking-tight">{cap.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'visuals' && (
                      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Dynamic Motion (Zooms)</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {plan.zooms.map((zoom, idx) => (
                                 <div key={idx} className="p-4 bg-cyan-50/30 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800 rounded-2xl flex items-center justify-between">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase">Timing</span>
                                       <span className="text-xs font-bold text-slate-500">{zoom.start} — {zoom.end}</span>
                                    </div>
                                    <div className="text-right">
                                       <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase block">Scale</span>
                                       <span className="text-lg font-black text-slate-800 dark:text-slate-100">{zoom.level}</span>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Text Pops & Graphics</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {plan.text_effects.map((effect, idx) => (
                                 <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm hover:border-pink-400 transition-colors group">
                                    <div className="space-y-1">
                                       <span className="text-[9px] font-black text-pink-500 uppercase tracking-widest">{effect.timestamp} • {effect.style}</span>
                                       <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{effect.text}</p>
                                    </div>
                                    <div className="text-xl group-hover:scale-125 transition-transform">💥</div>
                                 </div>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Expert B-Roll Suggestions</h5>
                            <div className="space-y-3">
                               {plan.b_roll.map((roll, idx) => (
                                 <div key={idx} className="p-5 rounded-3xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 flex items-start space-x-4 group hover:border-indigo-500 transition-colors">
                                    <div className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase min-w-[50px] text-center">{roll.timestamp}</div>
                                    <div className="flex-1 space-y-1">
                                       <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{roll.description}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Duration: {roll.duration}</p>
                                    </div>
                                    <div className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">🖼️</div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    )}

                    {activeTab === 'audio' && (
                      <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                         <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-800 flex items-center justify-between mb-8 shadow-inner transition-colors">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Recommended Soundtrack Mood</p>
                               <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{musicMood}</h3>
                            </div>
                            <div className="text-5xl animate-pulse">🎵</div>
                         </div>
                         <div className="space-y-3">
                            {plan.music.map((m, idx) => (
                              <div key={idx} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-400 transition-colors bg-slate-50/30 dark:bg-slate-800/30">
                                 <div className="flex items-center space-x-4">
                                    <span className="w-12 text-[10px] font-mono font-bold text-slate-400 group-hover:text-emerald-500">{m.timestamp}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{m.action}</span>
                                 </div>
                                 <div className="flex items-center space-x-3">
                                    <div className="w-20 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                       <div className="bg-emerald-500 h-full" style={{ width: m.volume }}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase w-8">{m.volume}</span>
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy Finalized • Viral Optimized</p>
                    <button 
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `viral-roadmap-${Date.now()}.json`;
                        a.click();
                      }}
                      className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center space-x-2"
                    >
                      <span>Export Master Script</span>
                      <span>🚀</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-40 opacity-30">
                  <div className="relative">
                    <div className="text-9xl grayscale blur-[1px]">📼</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-16 h-16 border-t-2 border-slate-400 rounded-full animate-spin"></div>
                    </div>
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <p className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Director's Roadmap Engine</p>
                    <p className="text-xs text-slate-500 leading-relaxed px-10 font-medium">
                      Fill out the creative brief on the left to activate our proprietary viral modeling engine. Gemini 3 Pro will then architect a frame-by-frame professional roadmap.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDirector;

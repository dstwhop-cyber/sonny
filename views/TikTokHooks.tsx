
import React, { useState, useEffect } from 'react';
import { generateTikTokHooks } from '../services/geminiService';
import { usageService } from '../services/usageService';

const TikTokHooks: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; grounding: any[] } | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    window.addEventListener('profileUpdated', updateUsage);
    return () => {
      window.removeEventListener('usageUpdated', updateUsage);
      window.removeEventListener('profileUpdated', updateUsage);
    };
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResult(null);
    try {
      let location = undefined;
      if (useMaps && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Location unavailable.");
        }
      }

      const data = await generateTikTokHooks({ 
        topic, tone, 
        useThinking, useSearch, useMaps, 
        location 
      });
      setResult(data);
      usageService.increment('text', 'hooks');
    } catch (err) {
      console.error(err);
      alert("Failed to generate TikTok hooks.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0 && remaining !== Infinity;

  const groundingLinks = result?.grounding?.map(chunk => {
    if (chunk.web) return { url: chunk.web.uri, title: chunk.web.title, type: 'web' };
    if (chunk.maps) return { url: chunk.maps.uri, title: chunk.maps.title, type: 'maps' };
    return null;
  }).filter(Boolean) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors relative overflow-hidden">
          <div className="flex justify-between items-center relative z-10">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tight italic">
              <span className="mr-3">🎵</span> Hook Strategy
            </h3>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-sm ${remaining > 0 || remaining === Infinity ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400' : 'bg-red-100 text-red-600'}`}>
              {remaining === Infinity ? 'Unlimited' : `${remaining} Uses Left`}
            </span>
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Video Topic</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Life hacks for busy students"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 transition-all resize-none h-24 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Vibe Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] outline-none dark:text-slate-100 font-bold text-xs"
              >
                <option>High Energy</option>
                <option>Controversial</option>
                <option>Storytelling</option>
                <option>Educational</option>
                <option>Humorous</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 relative z-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intelligence Boosters</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Deep Reasoning', sub: 'Gemini 3 Pro Logic', icon: '🧠', state: useThinking, setter: setUseThinking },
                { label: 'Search Grounding', sub: 'Live Web Data', icon: '🌍', state: useSearch, setter: setUseSearch },
                { label: 'Place Context', sub: 'Google Maps', icon: '📍', state: useMaps, setter: setUseMaps },
              ].map((tool, i) => (
                <label key={i} className={`flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer group ${tool.state ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-slate-50/50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <div className="flex items-center">
                    <span className={`mr-4 text-2xl group-hover:scale-110 transition-transform ${tool.state ? 'grayscale-0' : 'grayscale opacity-50'}`}>{tool.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{tool.label}</span>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{tool.sub}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${tool.state ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${tool.state ? 'right-1' : 'left-1'}`}></div>
                    <input type="checkbox" checked={tool.state} onChange={e => tool.setter(e.target.checked)} className="hidden" />
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading || !topic.trim() || isLimitReached}
            className={`w-full py-5 rounded-3xl font-black text-white shadow-xl transition-all active:scale-95 text-lg uppercase tracking-widest relative z-10 ${loading ? 'bg-slate-400' : isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-pink-500'}`}
          >
            {loading ? 'Analyzing...' : isLimitReached ? 'Upgrade Required' : 'Generate Hooks'}
          </button>

          {/* Aesthetic background glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-400/10 blur-[100px] rounded-full"></div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[600px] flex flex-col transition-colors overflow-hidden relative">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest italic">Hook Laboratory</h3>
            {result && <button onClick={() => {
              navigator.clipboard.writeText(result.text);
              alert('Hooks copied!');
            }} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">Copy All</button>}
          </div>
          <div className="p-10 flex-1 relative overflow-y-auto">
            {result ? (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="p-10 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-inner">
                  <p className="text-2xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-bold tracking-tight">
                    {result.text}
                  </p>
                </div>

                {groundingLinks.length > 0 && (
                  <div className="space-y-5 pt-10 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3 mb-2">
                       <span className="animate-pulse w-2 h-2 rounded-full bg-green-500"></span>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Grounding Data</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {groundingLinks.map((link, idx) => (
                        <a key={idx} href={link?.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] hover:border-cyan-400 transition-all group shadow-sm">
                          <span className="text-3xl mr-4 group-hover:scale-110 transition-transform">{link?.type === 'web' ? '🌐' : '📍'}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-cyan-500 transition-colors uppercase tracking-tight">{link?.title || 'External Source'}</span>
                            <span className="text-[8px] text-slate-500 truncate font-mono mt-0.5">{link?.url}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20 py-20">
                <div className="relative">
                   <div className="text-9xl group-hover:scale-110 transition-transform duration-1000 grayscale">🎬</div>
                   <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
                </div>
                <div className="max-w-sm">
                  <p className="text-3xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Input Brief Ready</p>
                  <p className="text-sm font-medium mt-2 text-slate-500">Describe your topic in the strategy panel to launch the viral modeling engine.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Aesthetic background glow */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400/5 blur-[150px] rounded-full pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default TikTokHooks;

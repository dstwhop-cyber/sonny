
import React, { useState, useEffect } from 'react';
import { generateSocialScripts } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ScriptVariation, ViewType } from '../types';

const ScriptWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [duration, setDuration] = useState('60s');
  const [cta, setCta] = useState('Follow for more');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ variations: ScriptVariation[]; grounding: any[] } | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));
  
  const user = usageService.getCurrentUser();
  const isPro = user?.plan === 'pro' || user?.plan === 'agency';

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
        } catch (e) {}
      }

      const data = await generateSocialScripts({ 
        topic: `${topic}. CTA: ${cta}`, 
        tone, 
        duration,
        useThinking, useSearch, useMaps,
        location
      });
      setResult(data);
      usageService.increment('text', 'scripts');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate scripts.");
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📜</span> Viral Scripting
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 || remaining === Infinity ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining === Infinity ? 'Unlimited' : `${remaining} Uses Left`}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Topic or Hook</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What is this video about?"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tone</label>
                <select 
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold dark:text-slate-200"
                >
                  <option>High Energy</option>
                  <option>Educational</option>
                  <option>Storytelling</option>
                  <option>Aggressive</option>
                  <option>Aesthetic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Duration</label>
                <select 
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold dark:text-slate-200"
                >
                  <option>15s</option>
                  <option>30s</option>
                  <option>60s</option>
                  <option>90s</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Target CTA</label>
              <select 
                value={cta}
                onChange={e => setCta(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-xs font-bold dark:text-slate-200"
              >
                <option>Follow for more</option>
                <option>Link in bio</option>
                <option>Comment below</option>
                <option>Share this video</option>
                <option>Register now</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Enhanced Tools</label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center">
                    <span className="mr-3 text-lg">🧠</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Deep Reasoning</span>
                      <span className="text-[8px] uppercase font-black text-slate-400">Gemini 3 Pro</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <div className="flex items-center">
                    <span className="mr-3 text-lg">🌍</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Search Grounding</span>
                      <span className="text-[8px] uppercase font-black text-slate-400">Real-time Web</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                   <div className="flex items-center">
                    <span className="mr-3 text-lg">📍</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Place Context</span>
                      <span className="text-[8px] uppercase font-black text-slate-400">Google Maps</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading || !topic.trim() || isLimitReached} 
            className={`w-full py-5 rounded-3xl font-black text-white text-lg shadow-xl transition-all active:scale-95 ${loading ? 'bg-slate-400' : isLimitReached ? 'bg-red-500' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}
          >
            {loading ? 'Synthesizing...' : isLimitReached ? 'Daily Limit Hit' : 'Write Viral Scripts'}
          </button>
          
          {isLimitReached && (
            <p className="text-[10px] text-center font-bold text-red-400 uppercase tracking-widest animate-pulse">
              Upgrade to Pro for Unlimited Scripts
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {result ? (
          <div className="space-y-6">
            {result.variations.map((v, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                   <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase italic tracking-tight">{v.variation_title}</h4>
                   </div>
                   <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`HOOK: ${v.hook}\n\nBODY:\n${v.body}\n\nCTA: ${v.cta}`);
                      alert('Script copied to clipboard!');
                    }} 
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-1.5 rounded-full text-[10px] font-black text-blue-600 hover:scale-105 transition-all shadow-sm"
                   >
                    COPY SCRIPT
                   </button>
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">The Hook</span>
                    <p className="text-2xl font-black text-slate-800 dark:text-white leading-tight tracking-tighter">{v.hook}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Content</span>
                    <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{v.body}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                     {v.hashtags.map((tag, idx) => (
                       <span key={idx} className="text-[10px] font-bold text-blue-600 dark:text-blue-400">#{tag}</span>
                     ))}
                  </div>
                </div>
              </div>
            ))}

            {groundingLinks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center"><span className="mr-2">🌍</span> AI Fact Check & Grounding</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groundingLinks.map((link, idx) => (
                    <a key={idx} href={link?.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-400 transition-all group">
                      <span className="text-2xl mr-4 group-hover:scale-110 transition-transform">{link?.type === 'web' ? '🌐' : '📍'}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-500">{link?.title || 'Source'}</span>
                        <span className="text-[9px] text-slate-400 truncate mt-0.5">{link?.url}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col items-center justify-center transition-colors">
            <div className="text-center space-y-6 opacity-20 group">
              <div className="text-9xl mb-4 group-hover:scale-110 transition-transform duration-500 grayscale">📜</div>
              <div className="space-y-2">
                <p className="text-2xl font-black uppercase tracking-tighter text-slate-800 dark:text-slate-100">Script Board Empty</p>
                <p className="text-sm font-medium text-slate-500">Inputs are active. Enter your topic to generate viral variations.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;

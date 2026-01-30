
import React, { useState, useEffect } from 'react';
import { generateSocialScripts } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ScriptVariation, ViewType } from '../types';

const ScriptWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('High Energy');
  const [duration, setDuration] = useState('60s');
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
    return () => window.removeEventListener('usageUpdated', updateUsage);
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
        topic, tone, duration,
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

  const isLimitReached = remaining <= 0;

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
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Topic or Hook</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="What is this video about?"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Enhanced Tools</label>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <span className="text-xs font-bold dark:text-slate-300">Deep Reasoning</span>
                  <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <span className="text-xs font-bold dark:text-slate-300">Search Grounding</span>
                  <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer">
                  <span className="text-xs font-bold dark:text-slate-300">Place Context</span>
                  <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
                </label>
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !topic.trim() || isLimitReached} className={`w-full py-5 rounded-3xl font-black text-white text-lg shadow-xl ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-600 to-blue-700'}`}>
            {loading ? 'Thinking...' : 'Write Scripts'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 space-y-6">
        {result ? (
          <div className="space-y-6">
            {result.variations.map((v, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between">
                   <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase italic">{v.variation_title}</h4>
                   <button onClick={() => navigator.clipboard.writeText(`${v.hook}\n\n${v.body}`)} className="text-[10px] font-black text-blue-600">Copy</button>
                </div>
                <div className="p-8 space-y-4">
                  <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{v.hook}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{v.body}</p>
                </div>
              </div>
            ))}

            {groundingLinks.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center"><span className="mr-2">🌍</span> Verified Sources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groundingLinks.map((link, idx) => (
                    <a key={idx} href={link?.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-400 transition-all">
                      <span className="mr-3">{link?.type === 'web' ? '🌐' : '📍'}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{link?.title || 'Source'}</span>
                        <span className="text-[9px] text-slate-400 truncate">{link?.url}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col items-center justify-center opacity-30">
            <div className="text-9xl mb-4">📜</div>
            <p className="text-2xl font-black">Script Board Empty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptWriter;

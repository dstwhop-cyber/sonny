
import React, { useState, useEffect } from 'react';
import { generateDescription } from '../services/geminiService';
import { usageService } from '../services/usageService';

const DescriptionMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; grounding: any[] } | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('text')) return;
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

      const data = await generateDescription({ 
        topic, platform, tone, audience,
        useThinking, useSearch, useMaps,
        location
      });
      setResult(data);
      usageService.increment('text', 'descriptions');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate description.");
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📜</span> Content Specs
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100">
                <option>YouTube</option><option>Pinterest</option><option>Blog Post</option><option>Podcast</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Topic</label>
              <textarea value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isLimitReached} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-24 dark:text-slate-100" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Tools</h4>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                <span className="text-xs font-bold dark:text-slate-300">Deep Reasoning</span>
                <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                <span className="text-xs font-bold dark:text-slate-300">Search Grounding</span>
                <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer">
                <span className="text-xs font-bold dark:text-slate-300">Place Context</span>
                <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              </label>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading || !topic} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-blue-600'}`}>
            {loading ? 'Drafting...' : 'Generate Description'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[500px] flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Optimized Description</h3>
            {result && <button onClick={() => navigator.clipboard.writeText(result.text)} className="text-xs font-bold text-blue-600">Copy All</button>}
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="text-lg text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium font-serif">{result.text}</p>
                </div>
                {groundingLinks.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">Sources Found</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groundingLinks.map((link, idx) => (
                        <a key={idx} href={link?.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400">
                          <span className="text-xl mr-3">{link?.type === 'web' ? '🌐' : '📍'}</span>
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
              <div className="h-full flex flex-col items-center justify-center opacity-20"><div className="text-8xl">📄</div></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionMaker;

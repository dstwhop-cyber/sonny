
import React, { useState, useEffect } from 'react';
import { generateCaption } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { collectionService } from '../services/collectionService';

const CaptionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; grounding: any[] } | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));
  const [copySuccess, setCopySuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const userProfile = usageService.getCurrentUser();
  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'agency';

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('text')) return;
    setLoading(true);
    setResult(null);
    setCopySuccess(false);
    setSaveStatus('idle');
    try {
      let location = undefined;
      if (useMaps && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) => 
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
          );
          location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        } catch (e) {
          console.warn("Location permission denied or unavailable. Proceeding without coordinates.");
        }
      }

      const data = await generateCaption({ 
        topic, tone, audience, 
        useThinking, useSearch, useMaps, 
        location 
      });
      setResult(data);
      usageService.increment('text', 'captions');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate caption. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSave = async () => {
    if (!result || !userProfile || !isPro) return;
    setSaveStatus('saving');
    try {
      await collectionService.saveItem({
        userId: userProfile.id,
        type: 'caption',
        topic: topic,
        content: result.text,
        metadata: { tone, audience, thinking: useThinking }
      });
      setSaveStatus('saved');
    } catch (e) {
      alert("Failed to save to collection.");
      setSaveStatus('idle');
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
              <span className="mr-2">✨</span> Professional Creator
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">What's the topic?</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="Describe your photo or video content..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50 h-28 resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isLimitReached}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat"
                >
                  <option>Professional</option>
                  <option>Witty & Bold</option>
                  <option>Minimalist</option>
                  <option>Educational</option>
                  <option>Storyteller</option>
                  <option>Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Audience</label>
                <input 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={isLimitReached}
                  placeholder="e.g. Founders, Gen Z"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Tools</h4>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">🧠</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Deep Reasoning</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Gemini 3 Pro Logic</span>
                  </div>
                </div>
                <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} disabled={isLimitReached} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
              
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">🌍</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Search Grounding</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Live Web Data</span>
                  </div>
                </div>
                <input type="checkbox" checked={useSearch} onChange={e => setUseSearch(e.target.checked)} disabled={isLimitReached} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">📍</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Place Context</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Google Maps</span>
                  </div>
                </div>
                <input type="checkbox" checked={useMaps} onChange={e => setUseMaps(e.target.checked)} disabled={isLimitReached} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
            </div>
          </div>

          <div className="pt-4">
            {isLimitReached ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-center space-y-3">
                <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-tight">You've hit your daily free limit for text generation.</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Upgrade to Unlimited
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{useThinking ? 'Thinking Deeply...' : 'Writing Caption...'}</span>
                  </>
                ) : 'Draft Instagram Post'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Output Preview</span>
            </div>
            {result && (
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded uppercase tracking-tighter">
                  Creator-Ready
                </span>
              </div>
            )}
          </div>
          
          <div className="p-8 flex-1 flex flex-col">
            {result ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 relative group transition-all shadow-inner flex-1">
                  <p className="text-2xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-semibold tracking-tight">
                    {result.text}
                  </p>
                  
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    {isPro && (
                      <button 
                        onClick={handleSave}
                        disabled={saveStatus !== 'idle'}
                        className={`p-3 rounded-xl shadow-md border transition-all flex items-center space-x-2 ${
                          saveStatus === 'saved' ? 'bg-green-500 text-white border-green-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <span>{saveStatus === 'saved' ? '✅' : '💾'}</span>
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {saveStatus === 'idle' ? 'Archive' : saveStatus === 'saving' ? 'Archiving...' : 'Saved'}
                        </span>
                      </button>
                    )}

                    {copySuccess && (
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 animate-in fade-in slide-in-from-right-2">
                        Copied!
                      </span>
                    )}
                    <button 
                      onClick={handleCopy}
                      className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 hover:scale-105 active:scale-95 transition-all dark:text-slate-200 flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span className="text-xs font-bold uppercase tracking-widest">Copy</span>
                    </button>
                  </div>
                </div>

                {groundingLinks.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <span className="mr-2">🌍</span> Verified Sources & Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {groundingLinks.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group shadow-sm"
                        >
                          <span className="text-xl mr-3 group-hover:scale-110 transition-transform">
                            {link?.type === 'web' ? '🌐' : '📍'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {link?.title || 'External Source'}
                            </span>
                            <span className="text-[9px] text-slate-400 truncate tracking-tight">{link?.url}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex-1 flex flex-col items-center justify-center text-center space-y-6 text-slate-300 dark:text-slate-700 py-12">
                <div className="relative">
                  <div className="text-9xl opacity-20 animate-pulse">✍️</div>
                  <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
                </div>
                <div className="max-w-xs">
                  <p className="font-black text-slate-500 dark:text-slate-400 text-xl tracking-tight uppercase">Ready to Create?</p>
                  <p className="text-sm mt-1 leading-relaxed">Fill in the details on the left to generate professional-grade content.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;

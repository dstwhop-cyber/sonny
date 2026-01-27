
import React, { useState, useEffect } from 'react';
import { generateShortCaptions } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ShortCaption } from '../types';

const ShortCaptions: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const [tone, setTone] = useState('Viral');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShortCaption[]>([]);
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
      const data = await generateShortCaptions(transcript, tone);
      setResults(data);
      usageService.increment('text', 'short_captions');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate captions.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">🔥</span> Viral Captions
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Generate high-energy, scroll-stopping subtitles for your Reels, TikToks, and Shorts. 
            Paste your transcript below.
          </p>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Script / Transcript</label>
            <textarea 
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. You won't believe what happened today in the studio. We found a hidden compartment..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-48 outline-none focus:ring-2 focus:ring-orange-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 tracking-tight">Style Tone</label>
            <select 
              value={tone}
              onChange={e => setTone(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 dark:text-slate-100 disabled:opacity-50"
            >
              <option>Viral (High Energy + Emojis)</option>
              <option>Minimalist (Clean + Professional)</option>
              <option>Bold (Heavy Emphasis)</option>
              <option>Storyteller (Natural Flow)</option>
            </select>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3">Limit reached for today.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !transcript.trim()}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-orange-500/20'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating Captions...</span>
                </>
              ) : 'Create Subtitles'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption Timeline</h4>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded">
                {results.length} Segments
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-4">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((cap, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-start space-x-4 transition-all hover:border-orange-400 group"
                  >
                    <div className="flex-shrink-0 pt-1">
                      <div className="bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {cap.timestamp_start}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg text-slate-800 dark:text-slate-100 leading-snug tracking-tight font-medium">
                        {/* We use a simple regex to bold text between ** ** manually if Gemini included it */}
                        {cap.caption_text.split(/(\*\*.*?\*\*)/).map((part, i) => 
                          part.startsWith('**') && part.endsWith('**') ? 
                          <span key={i} className="font-black text-orange-600 dark:text-orange-400">{part.slice(2, -2)}</span> : 
                          <span key={i}>{part}</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">📱</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">No Captions Yet</p>
                  <p className="text-xs text-slate-500 mt-2">Generate subtitles for your short-form content to see them synchronized here.</p>
                </div>
              </div>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
               <button 
                 onClick={() => {
                   const text = results.map(r => `[${r.timestamp_start}] ${r.caption_text}`).join('\n');
                   navigator.clipboard.writeText(text);
                   alert('Copied to clipboard!');
                 }}
                 className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
               >
                 Copy All as Text
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortCaptions;


import React, { useState, useEffect } from 'react';
import { generateSocialScripts } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { ScriptVariation } from '../types';

const ScriptWriter: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Energetic & Relatable');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScriptVariation[]>([]);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !usageService.canUse('text')) return;
    setLoading(true);
    setResults([]);
    try {
      const data = await generateSocialScripts({ topic, tone });
      setResults(data);
      usageService.increment('text', 'scripts');
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate scripts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (script: ScriptVariation, index: number) => {
    const text = `
Title: ${script.variation_title}
Hook: ${script.hook}
Script: ${script.body}
CTA: ${script.cta}
Hashtags: ${script.hashtags.join(' ')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">📜</span> Script Writer
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Uses Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Generate 3 viral-ready script variations for TikTok, Reels, and Shorts. 
            Perfect for 30-60 second high-retention videos.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Topic / Niche</label>
              <textarea 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={isLimitReached}
                placeholder="e.g. Life hacks for developers, 3 secret spots in Paris..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50 resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Preferred Tone</label>
              <select 
                value={tone}
                onChange={e => setTone(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 disabled:opacity-50 font-bold"
              >
                <option>Energetic & Relatable</option>
                <option>Witty & Sarcastic</option>
                <option>Professional & Educational</option>
                <option>Bold & Controversial</option>
                <option>Calm & Storytelling</option>
              </select>
            </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl text-center">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-3 text-center">Free Scriptwriting quota used.</p>
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
              disabled={loading || !topic.trim()}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/20'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Drafting Variations...</span>
                </>
              ) : 'Produce Viral Scripts'}
            </button>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col shadow-sm transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variation Previews</h4>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                3 Unique Drafts
              </span>
            )}
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[700px] space-y-8">
            {results.length > 0 ? (
              <div className="space-y-8">
                {results.map((script, idx) => (
                  <div 
                    key={idx}
                    className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 flex flex-col space-y-4 transition-all hover:border-blue-400 group relative"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                        Variation #{idx + 1}: {script.variation_title}
                      </h5>
                      <button 
                        onClick={() => copyToClipboard(script, idx)}
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all ${copiedIndex === idx ? 'bg-green-500 text-white border-green-500' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:scale-105'}`}
                      >
                        {copiedIndex === idx ? '✓ Copied' : '📋 Copy Script'}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">The Hook (Scroll Stopper):</p>
                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
                          {script.hook}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Content Body:</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                          {script.body}
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Call to Action (CTA):</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {script.cta}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {script.hashtags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[10px] font-bold text-slate-500 dark:text-slate-500">
                            #{tag.replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 opacity-30">
                <div className="text-8xl">📜</div>
                <div className="max-w-xs mx-auto">
                  <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Script Pad Empty</p>
                  <p className="text-xs text-slate-500 mt-2">Enter a topic and tone to generate high-performing scripts optimized for modern viewer retention patterns.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScriptWriter;

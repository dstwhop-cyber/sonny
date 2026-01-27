
import React, { useState, useEffect } from 'react';
import { generateDescription } from '../services/geminiService';
import { usageService } from '../services/usageService';

const DescriptionMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('text'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('text')) return;
    setLoading(true);
    try {
      const data = await generateDescription({ topic, platform, tone, audience });
      setResult(data);
      usageService.increment('text', 'descriptions');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate description.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

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

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Platform</label>
            <select 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
            >
              <option>YouTube</option>
              <option>Pinterest</option>
              <option>Blog Post</option>
              <option>Podcast</option>
              <option>E-commerce Product</option>
              <option>Real Estate Listing</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Topic / Product</label>
            <textarea 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. My new 2025 tech setup tour video"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50 h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tone</label>
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>Professional</option>
                <option>Enthusiastic</option>
                <option>Informative</option>
                <option>Salesy</option>
                <option>Friendly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Audience</label>
              <input 
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                disabled={isLimitReached}
                placeholder="Techies"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="pt-4">
            {isLimitReached ? (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-center space-y-3">
                <p className="text-xs font-bold text-red-700 dark:text-red-400">Daily Limit Reached</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black rounded-lg uppercase tracking-widest hover:scale-105 transition-transform"
                >
                  Go Pro
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'}`}
              >
                {loading ? 'Drafting Content...' : 'Generate Description'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[500px] flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Optimized Description</h3>
            {result && (
              <button 
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-xs font-bold text-blue-600 hover:underline px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40"
              >
                📋 Copy All
              </button>
            )}
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
                <p className="text-lg text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium font-serif">
                  {result}
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 dark:text-slate-600">
                <div className="text-6xl">📄</div>
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">SEO-ready descriptions await.</p>
                  <p className="text-sm">Great for YouTube, Blogs, and more.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionMaker;


import React, { useState, useEffect } from 'react';
import { generateContentIdeas } from '../services/geminiService';
import { usageService } from '../services/usageService';

const ContentIdeas: React.FC = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
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
      const data = await generateContentIdeas({ platform, topic, audience });
      setResult(data);
      usageService.increment('text');
    } catch (err) {
      console.error(err);
      alert("Failed to generate content ideas.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">💡</span> Idea Lab
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Left
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
              <option>Instagram</option>
              <option>TikTok</option>
              <option>LinkedIn</option>
              <option>YouTube Shorts</option>
              <option>Twitter / X</option>
              <option>Facebook</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Topic / Niche</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Remote work productivity"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Audience</label>
            <input 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Solo entrepreneurs"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          
          {isLimitReached ? (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl text-center space-y-3">
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Inspiration Limit Hit</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg uppercase hover:bg-indigo-700 transition-colors"
              >
                Go Pro for Unlimited Ideas
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic || !audience}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'}`}
            >
              {loading ? 'Thinking...' : 'Generate 5 Ideas'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[400px] flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Content Roadmap</h3>
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative group transition-colors">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                      {result}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="absolute top-4 right-4 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-200"
                  >
                    📋 Copy Ideas
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 dark:text-slate-600">
                <div className="text-6xl">🌪️</div>
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Never run out of inspiration.</p>
                  <p className="text-sm">Strategic content ideas at the click of a button.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentIdeas;

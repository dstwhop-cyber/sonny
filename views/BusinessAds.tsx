
import React, { useState, useEffect } from 'react';
import { generateBusinessAd } from '../services/geminiService';
import { usageService } from '../services/usageService';

const BusinessAds: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional');
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
      const data = await generateBusinessAd({ topic, audience, tone });
      setResult(data);
      usageService.increment('text');
    } catch (err) {
      console.error(err);
      alert("Failed to generate advertisement.");
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
              <span className="mr-2">📢</span> Ad Campaign
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Left Today
            </span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Product / Service</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Eco-friendly sneakers"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Target Audience</label>
            <input 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Sustainable fashion seekers"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
            >
              <option>Professional</option>
              <option>Witty</option>
              <option>Inspirational</option>
              <option>Persuasive</option>
              <option>Urgent</option>
            </select>
          </div>
          
          {isLimitReached ? (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl text-center space-y-3">
              <p className="text-xs font-bold text-orange-700 dark:text-orange-400">Limit Reached</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-2 bg-orange-600 text-white text-xs font-bold rounded-lg uppercase hover:bg-orange-700 transition-colors"
              >
                Get Pro for Unlimited Ads
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic || !audience}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'}`}
            >
              {loading ? 'Designing...' : 'Craft Advertisement'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[400px] flex flex-col transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Ad Copy</h3>
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 relative group transition-colors">
                  <p className="text-xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">{result}</p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="absolute top-4 right-4 bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-200"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-400 dark:text-slate-600">
                <div className="text-6xl">📈</div>
                <div>
                  <p className="font-medium text-slate-500 dark:text-slate-400">Boost your sales with AI copy.</p>
                  <p className="text-sm">Describe your product to see the magic.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAds;

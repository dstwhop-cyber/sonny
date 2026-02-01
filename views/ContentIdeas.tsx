
import React, { useState, useEffect } from 'react';
import { generateContentIdeas } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { collectionService } from '../services/collectionService';

const ContentIdeas: React.FC = () => {
  const [platform, setPlatform] = useState('Instagram');
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; grounding: any[] } | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('text'));
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
    setSaveStatus('idle');
    try {
      const data = await generateContentIdeas({ platform, topic, audience });
      setResult(data);
      usageService.increment('text', 'content_ideas');
    } catch (err) {
      console.error(err);
      alert("Failed to generate content ideas.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !userProfile || !isPro) return;
    setSaveStatus('saving');
    try {
      await collectionService.saveItem({
        userId: userProfile.id,
        type: 'idea',
        topic: `${platform}: ${topic}`,
        content: result.text,
        metadata: { platform, audience }
      });
      setSaveStatus('saved');
    } catch (e) {
      alert("Failed to save to collection.");
      setSaveStatus('idle');
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
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
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Platform</label>
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
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Topic / Niche</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Remote work productivity"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Audience</label>
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
              className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-indigo-500/20'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Thinking...</span>
                </>
              ) : 'Generate 5 Ideas'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[500px] flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Content Roadmap</h3>
            {result && isPro && (
               <button 
                 onClick={handleSave}
                 disabled={saveStatus !== 'idle'}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center space-x-2 ${
                   saveStatus === 'saved' ? 'bg-green-500 text-white border-green-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                 }`}
               >
                 <span>{saveStatus === 'saved' ? '✅' : '💾'}</span>
                 <span>{saveStatus === 'idle' ? 'Save Ideas' : saveStatus === 'saving' ? 'Saving...' : 'Saved to Archive'}</span>
               </button>
            )}
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 relative group transition-colors shadow-inner">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                      {result.text}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result.text);
                      alert('Copied!');
                    }}
                    className="absolute top-4 right-4 bg-white dark:bg-slate-700 px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-200 text-[10px] font-black uppercase tracking-widest"
                  >
                    📋 Copy All
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-300 dark:text-slate-700 py-20">
                <div className="text-8xl opacity-20">🌪️</div>
                <div>
                  <p className="font-black text-slate-500 dark:text-slate-400 text-xl uppercase tracking-tighter">Creative Block?</p>
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

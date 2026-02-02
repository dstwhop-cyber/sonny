
import React, { useState, useEffect } from 'react';
import { generateCaption } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { collectionService } from '../services/collectionService';

const CaptionGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General');
  const [useThinking, setUseThinking] = useState(false);
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
    window.addEventListener('profileUpdated', updateUsage);
    return () => {
      window.removeEventListener('usageUpdated', updateUsage);
      window.removeEventListener('profileUpdated', updateUsage);
    };
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('text')) return;
    setLoading(true);
    setResult(null);
    setCopySuccess(false);
    setSaveStatus('idle');
    try {
      const data = await generateCaption({ topic, tone, audience });
      setResult(data);
      usageService.increment('text', 'captions');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate caption.");
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

  const isLimitReached = remaining <= 0 && remaining !== Infinity;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <span className="mr-2">✨</span> HF Post Writer
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining === Infinity ? 'Unlimited' : `${remaining} Uses Left`}
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
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50 h-28 resize-none transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Brand Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  disabled={isLimitReached}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M7%2010L12%2015L17%2010%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:1.25rem] bg-[right_0.75rem_center] bg-no-repeat text-xs font-bold"
                >
                  <option>Professional</option>
                  <option>Witty & Bold</option>
                  <option>Minimalist</option>
                  <option>Educational</option>
                  <option>Storyteller</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Target Audience</label>
                <input 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  disabled={isLimitReached}
                  placeholder="e.g. Gen Z"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enhanced Inference</h4>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center">
                  <span className="mr-3">🧠</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Detailed Reasoning</span>
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Llama 3 Instruct 8B</span>
                  </div>
                </div>
                <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} disabled={isLimitReached} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic || isLimitReached}
              className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
            >
              {loading ? 'Synthesizing...' : 'Draft Post Content'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px] flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">HF Inference Output</span>
            </div>
          </div>
          
          <div className="p-8 flex-1 flex flex-col">
            {result ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col">
                <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 relative group transition-all shadow-inner flex-1">
                  <p className="text-2xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-semibold tracking-tight">
                    {result.text}
                  </p>
                  
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <button 
                      onClick={handleCopy}
                      className="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-md border border-slate-200 dark:border-slate-600 hover:scale-105 active:scale-95 transition-all dark:text-slate-200 flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span className="text-xs font-bold uppercase tracking-widest">Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex-1 flex flex-col items-center justify-center text-center space-y-6 text-slate-300 dark:text-slate-700 py-12">
                <div className="text-9xl opacity-20">✍️</div>
                <div className="max-w-xs">
                  <p className="font-black text-slate-500 dark:text-slate-400 text-xl tracking-tight uppercase">Ready to Sync?</p>
                  <p className="text-sm mt-1 leading-relaxed">Fill in the brief to generate high-performing content via Hugging Face.</p>
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

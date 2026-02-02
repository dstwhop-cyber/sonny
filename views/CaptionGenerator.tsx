
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
    if (!topic.trim() || !usageService.canUse('text')) return;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500 p-4 md:p-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center tracking-tighter">
              <span className="mr-2">✨</span> Post Writer
            </h3>
            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter ${remaining > 0 || remaining === Infinity ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-red-100 text-red-600'}`}>
              {remaining === Infinity ? 'Unlimited' : `${remaining} Uses Left`}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Project Brief</label>
              <textarea 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe your photo or video content..."
                className="w-full p-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 transition-all h-32 resize-none text-sm font-medium leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Brand Tone</label>
                <select 
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none dark:text-slate-100 text-xs font-bold appearance-none cursor-pointer"
                >
                  <option>Professional</option>
                  <option>Witty & Bold</option>
                  <option>Minimalist</option>
                  <option>Educational</option>
                  <option>Storyteller</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Audience</label>
                <input 
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Gen Z"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none dark:text-slate-100 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Advanced Reasoning</h4>
            <div className="grid grid-cols-1 gap-2">
              <label className={`flex items-center justify-between p-4 rounded-3xl border transition-all cursor-pointer ${useThinking ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-slate-50/50 dark:bg-slate-800/50 border-transparent hover:bg-slate-100'}`}>
                <div className="flex items-center">
                  <span className="mr-3 text-xl">🧠</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Detailed Synthesis</span>
                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Powered by Gemini 3 Pro</span>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${useThinking ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useThinking ? 'right-1' : 'left-1'}`}></div>
                  <input type="checkbox" checked={useThinking} onChange={e => setUseThinking(e.target.checked)} className="hidden" />
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic.trim() || isLimitReached}
              className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3 text-lg uppercase tracking-widest ${loading ? 'bg-slate-400' : isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Synthesizing...</span>
                </>
              ) : isLimitReached ? 'Daily Limit Hit' : 'Draft Post Content'}
            </button>
            {isLimitReached && <p className="text-[10px] text-center font-black text-red-500 uppercase tracking-[0.2em] mt-3">Join Pro for Unlimited Drafts</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col transition-colors overflow-hidden relative">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synaptic Output Terminal</span>
            </div>
            {result && isPro && (
              <button onClick={handleSave} className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                {saveStatus === 'saved' ? 'Archived ✅' : 'Archive to Library 📂'}
              </button>
            )}
          </div>
          
          <div className="p-10 flex-1 flex flex-col relative z-10 overflow-y-auto">
            {result ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col">
                <div className="p-12 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border border-slate-200 dark:border-slate-700 relative group transition-all shadow-inner flex-1 flex flex-col justify-center">
                  <p className="text-3xl text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-black tracking-tight italic">
                    {result.text}
                  </p>
                  
                  <div className="absolute top-6 right-6 flex items-center space-x-2">
                    <button 
                      onClick={handleCopy}
                      className="bg-white dark:bg-slate-700 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 hover:scale-110 active:scale-90 transition-all dark:text-slate-200 flex items-center space-x-3"
                    >
                      <span className="text-xl">📋</span>
                      <span className="text-xs font-black uppercase tracking-widest">{copySuccess ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex-1 flex flex-col items-center justify-center text-center space-y-8 text-slate-300 dark:text-slate-700 py-12">
                <div className="text-[10rem] opacity-10 grayscale group-hover:grayscale-0 transition-all duration-1000">✍️</div>
                <div className="max-w-sm">
                  <p className="font-black text-slate-500 dark:text-slate-400 text-2xl tracking-tighter uppercase italic">Engine Initialized</p>
                  <p className="text-sm mt-2 leading-relaxed font-medium">Complete the brief in the control console to synthesize high-performance social content.</p>
                </div>
              </div>
            )}
          </div>

          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default CaptionGenerator;

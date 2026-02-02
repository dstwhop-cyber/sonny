
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { usageService } from '../services/usageService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  
  const user = usageService.getCurrentUser();
  const isPro = user?.plan === 'pro' || user?.plan === 'agency';

  const handleGenerate = async () => {
    if (!isPro) return;

    setLoading(true);
    setStatus('Requesting HF Inference Node...');
    try {
      const url = await generateVideo({ prompt });
      setResult(url);
      usageService.increment('pro', 'videos');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Video generation failed. Text-to-Video inference is highly resource intensive.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl space-y-8">
          <div className="text-9xl">🎬</div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">HF Motion Studio</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              Generative video synthesis requires high-end Hugging Face Inference credits.
            </p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-xl"
          >
            Upgrade Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Motion Lab</h3>
            <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded uppercase tracking-widest">Inference Ready</span>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Sequence Description</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the movement: 'A slow motion shot of a waterfall in a digital forest...'"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-40 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors resize-none text-sm"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all uppercase tracking-widest ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-600 to-blue-700'}`}
          >
            {loading ? 'Rendering...' : 'Synthesize Motion'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[600px] transition-colors relative overflow-hidden">
          {loading ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-black text-indigo-600 dark:text-indigo-400 animate-pulse text-xl uppercase tracking-tighter">{status}</p>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center">
              <video src={result} controls autoPlay loop className="max-w-full max-h-[600px] rounded-[2rem] shadow-2xl bg-black" />
              <div className="mt-6">
                <a href={result} download="hf-motion.mp4" className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-widest text-xs">Download MP4</a>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-30">
              <span className="text-9xl block mb-4">📽️</span>
              <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Timeline Empty</p>
              <p className="text-xs">Powered by HF Open Source Video Models.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;

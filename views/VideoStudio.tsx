
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { usageService } from '../services/usageService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  
  const user = usageService.getCurrentUser();
  const isPro = user?.plan === 'pro' || user?.plan === 'agency';

  // Mandatory API Key selection check for Veo models as per guidelines.
  const handleGenerate = async () => {
    if (!isPro) return;

    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }

    setLoading(true);
    setStatus('Initializing Veo Engine...');
    try {
      const url = await generateVideo({ prompt, aspectRatio });
      setResult(url);
      usageService.increment('pro', 'videos');
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found.")) {
        await (window as any).aistudio.openSelectKey();
      }
      alert(err.message || "Video generation failed.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-3xl font-black uppercase text-[10px] tracking-[0.2em]">
            Pro Exclusive
          </div>
          
          <div className="relative inline-block">
             <div className="text-9xl mb-4">🎬</div>
             <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce">💎</div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">Veo Studio</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              Cinematic video generation is powered by Google's most advanced motion engine and requires high-end LPU processing.
            </p>
          </div>

          <div className="pt-6 space-y-4">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
            >
              Upgrade to Creator Pro
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unlimited 720p cinematic renders included</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 md:p-10 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎬</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter italic">Veo Studio</h3>
            </div>
            <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded uppercase tracking-widest">Active</span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Generate stunning 720p cinematic video clips using Google's most advanced generative motion engine.
          </p>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motion Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe the action: 'A drone shot flying through a neon-lit cyberpunk market in the rain...'"
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-40 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors resize-none text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Frame Orientation</label>
            <div className="flex space-x-3">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 p-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300'}`}
              >
                Landscape
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 p-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300'}`}
              >
                Portrait
              </button>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-3 ${loading ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-600 to-blue-700 hover:shadow-indigo-500/30'}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rendering Cinematic...</span>
              </>
            ) : (
              <>
                <span>Direct Scene</span>
                <span>✨</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[600px] transition-colors relative overflow-hidden group">
          {loading ? (
            <div className="text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <p className="font-black text-indigo-600 dark:text-indigo-400 animate-pulse tracking-tight text-xl">{status}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Veo Generative Engine Active</p>
              </div>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center animate-in zoom-in duration-500">
              <video 
                src={result} 
                controls 
                autoPlay 
                loop 
                className="max-w-full max-h-[600px] rounded-[2rem] shadow-2xl bg-black ring-1 ring-slate-200 dark:ring-slate-800"
              />
              <div className="mt-6 flex space-x-4">
                <a 
                  href={result} 
                  download="veo-cinematic.mp4"
                  className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center space-x-2"
                >
                  <span>Download MP4</span>
                  <span>📥</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-30 group-hover:opacity-50 transition-opacity">
              <span className="text-9xl mb-4 block grayscale italic">📽️</span>
              <p className="text-xl font-black text-slate-400 uppercase tracking-tighter">Veo Timeline Idle</p>
              <p className="text-xs text-slate-500 font-medium">Describe your vision to generate a 720p cinematic sequence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;

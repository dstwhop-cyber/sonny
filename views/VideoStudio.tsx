
import React, { useState, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';
import { usageService } from '../services/usageService';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [remaining, setRemaining] = useState(usageService.getRemaining('pro'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('pro'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  // Fix: Added mandatory API Key selection check for Veo models as per guidelines.
  const handleGenerate = async () => {
    if (!usageService.canUse('pro')) return;

    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
      // Proceed assuming success per race condition guideline.
    }

    setLoading(true);
    setStatus('Initializing Veo Engine...');
    try {
      const interval = setInterval(() => {
        const statuses = [
          'Processing cinematic motion...',
          'Refining frames...',
          'Applying neural lighting...',
          'Finalizing high-res output...'
        ];
        setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 8000);

      const url = await generateVideo({ prompt, aspectRatio });
      clearInterval(interval);
      setResult(url);
      usageService.increment('pro');
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

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎬</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Veo Studio</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Trials Left
            </span>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Generate stunning 720p cinematic video clips using Google's most advanced motion engine.
          </p>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Video Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isLimitReached}
              placeholder="A high-speed neon cat driving a cyberpunk motorcycle through Tokyo..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-purple-500 dark:text-slate-100 transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Orientation</label>
            <div className="flex space-x-4">
              <button 
                onClick={() => setAspectRatio('16:9')}
                disabled={isLimitReached}
                className={`flex-1 p-3 rounded-xl border font-bold transition-all ${aspectRatio === '16:9' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300'} disabled:opacity-50`}
              >
                Landscape
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                disabled={isLimitReached}
                className={`flex-1 p-3 rounded-xl border font-bold transition-all ${aspectRatio === '9:16' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-300'} disabled:opacity-50`}
              >
                Portrait
              </button>
            </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center space-y-4">
              <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Free Trials Used</p>
              <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">Video generation requires high-end LPU processing. Upgrade to Pro for unlimited clips.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors active:scale-95"
              >
                Go Pro Now
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
            >
              {loading ? '🎬 Generating...' : 'Direct Scene with Veo'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[500px] transition-colors relative overflow-hidden">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="font-bold text-purple-600 dark:text-purple-400 animate-pulse">{status}</p>
              <p className="text-xs text-slate-400">High-quality video generation can take 1-3 minutes.</p>
            </div>
          ) : result ? (
            <div className="w-full h-full flex flex-col items-center">
              <video 
                src={result} 
                controls 
                autoPlay 
                loop 
                className="max-w-full max-h-[600px] rounded-2xl shadow-2xl bg-black"
              />
              <div className="mt-4">
                <a 
                  href={result} 
                  download="veo-cinematic.mp4"
                  className="px-6 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Download MP4
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-300 dark:text-slate-700">
              <span className="text-8xl mb-4 block">📽️</span>
              <p className="text-lg font-medium">Your cinematic motion will play here.</p>
              <p className="text-sm">Driven by the Google Veo AI model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;

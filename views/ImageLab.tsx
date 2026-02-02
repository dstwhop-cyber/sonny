
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { usageService } from '../services/usageService';

const ImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('pro'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('pro'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleGenerate = async () => {
    if (!usageService.canUse('pro')) return;

    setLoading(true);
    try {
      const url = await generateImage({ prompt });
      setResult(url);
      usageService.increment('pro');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Image generation failed. Ensure your Hugging Face API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tighter">FLUX Studio</h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} HF Credits
            </span>
          </div>
          
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motion-Ready Visual</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isLimitReached}
              placeholder="High-fidelity cinematic visual description..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engine</p>
               <p className="text-xs font-bold text-slate-800 dark:text-slate-200">HF Black Forest Labs / FLUX.1</p>
             </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center space-y-4">
              <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Credits Exhausted</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg"
              >
                Top up Studio
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all uppercase tracking-widest ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
            >
              {loading ? '🎨 Drawing...' : 'Synthesize Visual'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[500px] transition-colors overflow-hidden">
          {result ? (
            <div className="relative group w-full h-full flex flex-col items-center">
              <img src={result} className="max-w-full max-h-[600px] rounded-2xl shadow-2xl object-contain" alt="Generated visual" />
              <div className="mt-6">
                <a 
                  href={result} 
                  download="hf-generated-image.png"
                  className="bg-slate-900 dark:bg-slate-100 px-8 py-3 rounded-xl shadow-lg text-xs font-black uppercase tracking-widest text-white dark:text-slate-900"
                >
                  📥 Download Master
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-300 dark:text-slate-700 space-y-4">
              <span className="text-8xl mb-4 block">📸</span>
              <p className="text-lg font-black uppercase tracking-tighter">Studio Canvas Empty</p>
              <p className="text-xs">Powered by Hugging Face FLUX Architecture.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLab;

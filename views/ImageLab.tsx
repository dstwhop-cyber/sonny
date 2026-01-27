
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
      const url = await generateImage({ prompt, aspectRatio, imageSize });
      setResult(url);
      usageService.increment('pro');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Image generation failed.");
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
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Image Studio</h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Trials Left
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Creative Prompt</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isLimitReached}
              placeholder="A futuristic cybernetic garden at twilight, cinematic lighting..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>1:1</option>
                <option>4:3</option>
                <option>16:9</option>
                <option>9:16</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Resolution</label>
              <select 
                value={imageSize}
                onChange={e => setImageSize(e.target.value)}
                disabled={isLimitReached}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
              >
                <option>1K</option>
                <option>2K</option>
                <option>4K</option>
              </select>
            </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center space-y-4">
              <p className="text-sm font-bold text-purple-800 dark:text-purple-300">Trials Exhausted</p>
              <p className="text-xs text-purple-700 dark:text-purple-400 leading-relaxed">High-fidelity 4K image generation is a Pro feature. Upgrade to continue creating.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors active:scale-95"
              >
                Get Creator Pro
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'}`}
            >
              {loading ? '🎨 Painting Canvas...' : 'Generate 4K Visual'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[500px] transition-colors overflow-hidden">
          {result ? (
            <div className="relative group w-full h-full flex items-center justify-center">
              <img src={result} className="max-w-full max-h-[600px] rounded-2xl shadow-2xl object-contain" alt="Generated visual" />
              <div className="absolute top-4 right-4 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={result} 
                  download="generated-ai-image.png"
                  className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100"
                >
                  📥 Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-300 dark:text-slate-700">
              <span className="text-8xl mb-4 block">📸</span>
              <p className="text-lg font-medium">Your masterpiece will appear here.</p>
              <p className="text-sm">Powered by Gemini Pro Image Engine.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageLab;

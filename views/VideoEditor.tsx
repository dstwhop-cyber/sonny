
import React, { useState, useEffect } from 'react';
import { editVideo } from '../services/geminiService';
import { usageService } from '../services/usageService';

const VideoEditor: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [startImage, setStartImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [endImage, setEndImage] = useState<{ data: string; mimeType: string } | null>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        if (type === 'start') setStartImage({ data: base64, mimeType: file.type });
        else setEndImage({ data: base64, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!usageService.canUse('pro')) return;
    setLoading(true);
    setStatus('Preparing keyframes...');
    try {
      const interval = setInterval(() => {
        const statuses = [
          'Analyzing spatial context...',
          'Synthesizing motion vectors...',
          'Applying neural interpolation...',
          'Finalizing cinematic sequence...'
        ];
        setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }, 8000);

      const url = await editVideo({ 
        prompt, 
        startImage: startImage || undefined, 
        endImage: endImage || undefined,
        aspectRatio 
      });
      
      clearInterval(interval);
      setResult(url);
      usageService.increment('pro', 'video_edits');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Video editing failed.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎞️</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI Video Editor</h3>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Trials
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Edit scenes by providing start/end frames or transform static images into cinematic motion.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Frame</label>
                <div 
                  onClick={() => !isLimitReached && document.getElementById('start-img')?.click()}
                  className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-blue-500 transition-colors relative group`}
                >
                  {startImage ? (
                    <img src={`data:${startImage.mimeType};base64,${startImage.data}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">🖼️</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase">Change</span>
                  </div>
                </div>
                <input id="start-img" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'start')} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Frame (Opt)</label>
                <div 
                  onClick={() => !isLimitReached && document.getElementById('end-img')?.click()}
                  className={`aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-blue-500 transition-colors relative group`}
                >
                  {endImage ? (
                    <img src={`data:${endImage.mimeType};base64,${endImage.data}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl opacity-40">🏁</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase">Change</span>
                  </div>
                </div>
                <input id="end-img" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'end')} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Motion Prompt</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                disabled={isLimitReached}
                placeholder="Describe the movement, camera pan, or transformation..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-purple-500 dark:text-slate-100 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 p-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === '16:9' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
              >
                16:9
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 p-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === '9:16' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
              >
                9:16
              </button>
            </div>
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl text-center space-y-4">
              <p className="text-xs text-purple-700 dark:text-purple-400">AI Video Editing requires Pro processing credits.</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors"
              >
                Go Pro
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all ${loading ? 'bg-slate-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'}`}
            >
              {loading ? '📽️ Rendering...' : 'Process Video AI'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center min-h-[500px] transition-colors relative overflow-hidden group">
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
                className="max-w-full max-h-[600px] rounded-2xl shadow-2xl bg-black ring-1 ring-slate-200 dark:ring-slate-800"
              />
              <div className="mt-6 flex space-x-4">
                <a 
                  href={result} 
                  download="ai-video-edit.mp4"
                  className="px-8 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  Download Master
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4 opacity-30 group-hover:opacity-50 transition-opacity">
              <span className="text-9xl mb-4 block">📼</span>
              <p className="text-xl font-bold text-slate-400">Generative Timeline Empty</p>
              <p className="text-sm">Upload images and describe motion to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;

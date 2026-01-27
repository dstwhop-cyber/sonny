
import React, { useState, useEffect } from 'react';
import { analyzeMedia } from '../services/geminiService';
import { usageService } from '../services/usageService';

const MediaAnalysis: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Analyze this content and suggest 3 viral hooks for an Instagram post.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('pro'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('pro'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !file || !usageService.canUse('pro')) return;
    setLoading(true);
    try {
      const base64 = preview.split(',')[1];
      const data = await analyzeMedia({ prompt, mediaData: base64, mimeType: file.type });
      setResult(data || '');
      usageService.increment('pro');
    } catch (err) {
      console.error(err);
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Media Understanding</h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Trials Left
            </span>
          </div>

          <div 
            onClick={() => !isLimitReached && document.getElementById('analysis-upload')?.click()}
            className={`border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 bg-slate-50 dark:bg-slate-800 transition-all flex flex-col items-center justify-center min-h-[300px] ${isLimitReached ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer'}`}
          >
            {preview ? (
              file?.type.startsWith('video') ? (
                <video src={preview} className="max-h-[250px] rounded-xl shadow-lg" />
              ) : (
                <img src={preview} className="max-h-[250px] rounded-xl shadow-lg" />
              )
            ) : (
              <div className="text-center">
                <span className="text-6xl mb-4 block">📁</span>
                <p className="font-bold text-slate-700 dark:text-slate-300">Drop your file here</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Supports photos and video clips</p>
              </div>
            )}
            {!isLimitReached && <input id="analysis-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,video/*" />}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Analysis Goal</label>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-100 transition-colors disabled:opacity-50"
            />
          </div>

          {isLimitReached ? (
            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl text-center space-y-3">
              <p className="text-sm font-bold text-indigo-800 dark:text-indigo-300">Analysis Limit Reached</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold rounded-xl"
              >
                Unlock Pro Insights
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAnalyze}
              disabled={loading || !preview}
              className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-400' : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700'}`}
            >
              {loading ? '🔍 Analyzing Intelligence...' : 'Run Analysis'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Insight Report</h3>
        <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 overflow-y-auto transition-colors">
          {result ? (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{result}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 text-center">
              <span className="text-5xl mb-4">📊</span>
              <p className="dark:text-slate-600">Upload a file to generate a <br/>comprehensive analysis report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaAnalysis;

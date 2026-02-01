
import React, { useState, useEffect } from 'react';
import { generateWhatsAppPromo } from '../services/geminiService';
import { usageService } from '../services/usageService';
import { collectionService } from '../services/collectionService';

const WhatsAppPromo: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Friendly');
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
      const data = await generateWhatsAppPromo({ topic, audience, tone });
      setResult(data);
      usageService.increment('text', 'whatsapp_promo');
    } catch (err) {
      console.error(err);
      alert("Failed to generate WhatsApp message.");
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
        type: 'promo',
        topic: topic,
        content: result.text,
        metadata: { tone, audience }
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
              <span className="mr-2">💬</span> WhatsApp Copy
            </h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${remaining > 0 ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Left
            </span>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product / Offer</label>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. 20% off Weekend Flash Sale"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Audience</label>
            <input 
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              disabled={isLimitReached}
              placeholder="e.g. Existing VIP customers"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tone</label>
            <select 
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              disabled={isLimitReached}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none dark:text-slate-100 disabled:opacity-50"
            >
              <option>Friendly</option>
              <option>Professional</option>
              <option>Casual</option>
              <option>Urgent</option>
            </select>
          </div>

          {isLimitReached ? (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl text-center space-y-3">
              <p className="text-xs font-bold text-green-700 dark:text-green-400">Free Copywriting Limit</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg uppercase hover:bg-green-700 transition-colors"
              >
                Get Unlimited Copy
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGenerate}
              disabled={loading || !topic || !audience}
              className={`w-full py-4 rounded-xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-2 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-green-500/20'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Writing...</span>
                </>
              ) : 'Generate WhatsApp Message'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 h-full min-h-[500px] flex flex-col transition-colors overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">WhatsApp Preview</h3>
            {result && isPro && (
               <button 
                 onClick={handleSave}
                 disabled={saveStatus !== 'idle'}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center space-x-2 ${
                   saveStatus === 'saved' ? 'bg-green-500 text-white border-green-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                 }`}
               >
                 <span>{saveStatus === 'saved' ? '✅' : '💾'}</span>
                 <span>{saveStatus === 'idle' ? 'Archive Message' : saveStatus === 'saving' ? 'Archiving...' : 'Saved to Studio'}</span>
               </button>
            )}
          </div>
          <div className="p-8 flex-1">
            {result ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="max-w-xs mx-auto p-6 bg-[#E1FFC7] dark:bg-green-900/30 rounded-3xl shadow-md border border-green-200 dark:border-green-800 relative group transition-colors">
                  <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-medium">
                    {result.text}
                  </p>
                  <div className="text-[9px] text-slate-500 text-right mt-3 font-bold uppercase tracking-widest">
                    AI Creator Studio • Just now
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(result.text);
                      alert('Message copied!');
                    }}
                    className="absolute -top-12 right-0 bg-white dark:bg-slate-700 px-3 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity dark:text-slate-200 text-[10px] font-black uppercase tracking-widest"
                  >
                    📋 Copy Text
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-300 dark:text-slate-700 py-20">
                <div className="text-8xl opacity-20">📱</div>
                <div>
                  <p className="font-black text-slate-500 dark:text-slate-400 text-xl uppercase tracking-tighter">Direct Connect</p>
                  <p className="text-sm">Personalized, punchy, and profitable messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPromo;

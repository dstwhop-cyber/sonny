
import React, { useState, useRef, useEffect } from 'react';
import { textToSpeech } from '../services/geminiService';
import { usageService } from '../services/usageService';

const VoiceStudio: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [remaining, setRemaining] = useState(usageService.getRemaining('pro'));

  useEffect(() => {
    const updateUsage = () => setRemaining(usageService.getRemaining('pro'));
    window.addEventListener('usageUpdated', updateUsage);
    return () => window.removeEventListener('usageUpdated', updateUsage);
  }, []);

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleSpeak = async () => {
    if (!text || !usageService.canUse('pro')) return;
    setLoading(true);
    try {
      const base64Audio = await textToSpeech(text);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      
      setIsPlaying(true);
      source.start();
      usageService.increment('pro');
    } catch (err) {
      console.error(err);
      alert("TTS failed.");
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = remaining <= 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors space-y-8">
        <div className="text-center relative">
          <div className="absolute top-0 right-0">
             <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${remaining > 0 ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-red-100 text-red-600'}`}>
              {remaining} Trials Left
            </span>
          </div>
          <div className="text-8xl mb-6">🎙️</div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tight">Voice Pro Studio</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Convert your scripts into high-fidelity AI-generated human speech using Gemini's native audio engine.
          </p>
        </div>

        <div className="space-y-4">
          <textarea 
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={isLimitReached}
            placeholder="Type your script here... 'Hello creators, welcome to the future of sound.'"
            className="w-full p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl h-48 outline-none focus:ring-2 focus:ring-teal-500 dark:text-slate-100 text-xl font-medium transition-colors disabled:opacity-50"
          />
          
          <div className="flex justify-center">
            {isLimitReached ? (
              <div className="max-w-md w-full p-8 bg-teal-50 dark:bg-teal-900/20 rounded-3xl border border-teal-100 dark:border-teal-800 text-center space-y-6">
                <p className="text-teal-800 dark:text-teal-300 font-bold">Free Trial Ended</p>
                <p className="text-sm text-teal-700 dark:text-teal-400">Professional Voice Synthesis is available to Pro members. Upgrade for unlimited audio.</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
                  className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl hover:bg-teal-700 transition-all active:scale-95"
                >
                  Join Creator Pro
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSpeak}
                disabled={loading || isPlaying || !text}
                className={`px-12 py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all transform active:scale-95 flex items-center space-x-3 ${loading || isPlaying ? 'bg-slate-400' : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'}`}
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Vocalizing...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <span className="animate-pulse">🔊 Speaking...</span>
                  </>
                ) : (
                  <>
                    <span>▶️ Synthesize Speech</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start space-x-4">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-300 font-bold mb-1">Pro Tip</p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Add emotional markers in your text like "(cheerfully)" or "(seriously)" to influence the AI's vocal delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStudio;

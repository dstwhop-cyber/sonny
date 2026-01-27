
import React, { useState, useRef, useEffect } from 'react';
import { usageService } from '../services/usageService';
import { GoogleGenAI } from "@google/genai";

interface VideoLayer {
  id: string;
  type: 'video' | 'text' | 'audio';
  content: string;
  startTime: number;
  duration: number;
  color: string;
  thumbnail?: string;
}

const VideoStudioPro: React.FC = () => {
  const [layers, setLayers] = useState<VideoLayer[]>([
    { id: '1', type: 'video', content: 'Cinematic Landscape', startTime: 0, duration: 120, color: 'bg-blue-600', thumbnail: '🏔️' },
    { id: '2', type: 'video', content: 'Urban Transition', startTime: 120, duration: 80, color: 'bg-indigo-600', thumbnail: '🏙️' },
    { id: '3', type: 'text', content: 'ADVENTURE 2025', startTime: 10, duration: 60, color: 'bg-pink-500' },
    { id: '4', type: 'audio', content: 'Lo-fi Chill Beat', startTime: 0, duration: 300, color: 'bg-teal-500' },
  ]);
  
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'video' | 'audio' | 'color'>('video');
  const [aiCommand, setAiCommand] = useState('');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>('1');
  const [aiMateResponse, setAiMateResponse] = useState<string>("Hi there! I'm AI Mate, your smart editing partner. Ready to experiment with video effects, music, and color grading? Let's have some fun!");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const TIMELINE_DURATION = 300; // in seconds

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayhead(prev => (prev < TIMELINE_DURATION ? prev + 1 : 0));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const newPlayhead = (x / rect.width) * TIMELINE_DURATION;
      setPlayhead(Math.max(0, Math.min(newPlayhead, TIMELINE_DURATION)));
    }
  };

  const handleAiMateCommand = async () => {
    if (!aiCommand.trim()) return;
    setIsAiProcessing(true);
    // Simulate AI thinking and action
    setTimeout(() => {
      setAiMateResponse(`Got it! I've analyzed your request: "${aiCommand}". I'm applying those adjustments to the selected clip now.`);
      setIsAiProcessing(false);
      setAiCommand('');
    }, 1500);
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#121212] text-[#e0e0e0] overflow-hidden font-sans">
      {/* Professional Toolbar (Top) */}
      <div className="h-14 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-4">
        <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
          {[
            { icon: '📁', label: 'Media' },
            { icon: '🖼️', label: 'Stock Media' },
            { icon: '🎵', label: 'Audio' },
            { icon: '📝', label: 'Titles' },
            { icon: '🎞️', label: 'Transitions' },
            { icon: '✨', label: 'Effects' },
            { icon: '🎭', label: 'Filters' },
            { icon: '🏷️', label: 'Stickers' },
            { icon: '📋', label: 'Templates' },
          ].map((item, idx) => (
            <button key={idx} className="flex flex-col items-center justify-center px-3 py-1 hover:bg-[#2a2a2a] rounded-lg transition-colors group">
              <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-[#252525] rounded-lg p-1 px-3 border border-[#333]">
             <span className="text-yellow-500 text-xs">👑</span>
             <span className="text-[10px] font-bold">Purchase</span>
          </div>
          <button className="bg-[#00c2a8] hover:bg-[#00a892] text-black px-5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center space-x-2">
            <span>Export</span>
            <span className="text-[10px]">▼</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold border border-white/10">W</div>
        </div>
      </div>

      {/* Main Workspace: AI Mate | Preview | Inspector */}
      <div className="flex-1 flex min-h-0">
        {/* Left: AI Mate Panel */}
        <div className="w-80 border-r border-[#2a2a2a] bg-[#1a1a1a] flex flex-col">
          <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center">
              <span className="text-cyan-400 mr-2">✨</span> AI Mate
            </h4>
            <div className="flex space-x-2 text-xs text-slate-500">
               <span>⭐</span>
               <span>👤</span>
               <span>✕</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-[#252525] rounded-2xl p-4 border border-[#333] shadow-lg">
              <p className="text-xs font-bold text-white mb-2">Miguel Tests 👋</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {aiMateResponse}
              </p>
              
              <div className="mt-4 space-y-2">
                <button className="w-full text-left p-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl text-[10px] flex items-center justify-between group">
                  <span className="flex items-center"><span className="mr-2">🪄</span> Add resources</span>
                  <span className="text-slate-600 group-hover:text-slate-400">Change a group</span>
                </button>
                
                <div className="p-2.5 bg-[#1a1a1a]/50 rounded-xl border border-dashed border-[#444] text-[9px] text-slate-500">
                  Select a clip before sending the task
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                 {[
                   { icon: '🔊', label: 'Audio Adj.' },
                   { icon: '🖼️', label: 'Pic Adj.' },
                   { icon: '🎞️', label: 'Format' },
                 ].map((tool, i) => (
                   <button key={i} className="flex flex-col items-center p-2 bg-[#1a1a1a] border border-[#333] rounded-lg hover:border-cyan-500/50 transition-colors">
                     <span className="text-xs">{tool.icon}</span>
                     <span className="text-[8px] mt-1 text-slate-400">{tool.label}</span>
                   </button>
                 ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#1a1a1a] border-t border-[#2a2a2a]">
             <div className="relative">
               <input 
                 value={aiCommand}
                 onChange={e => setAiCommand(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleAiMateCommand()}
                 placeholder="Enter your command here"
                 className="w-full bg-[#252525] border border-[#333] rounded-xl py-3 px-4 pr-12 text-xs focus:ring-1 focus:ring-cyan-500 outline-none"
               />
               <button 
                 onClick={handleAiMateCommand}
                 disabled={isAiProcessing || !aiCommand.trim()}
                 className="absolute right-2 top-1.5 p-1.5 text-cyan-400 hover:text-cyan-300 disabled:opacity-30"
               >
                 {isAiProcessing ? '...' : '🚀'}
               </button>
             </div>
             <p className="text-[9px] text-slate-500 mt-2 text-center">Free trial: 5 <span className="text-cyan-600 font-bold ml-1 cursor-pointer">Try Free</span></p>
          </div>
        </div>

        {/* Center: Preview Area */}
        <div className="flex-1 flex flex-col bg-[#0d0d0d] items-center justify-center p-6 relative">
          <div className="h-10 w-full absolute top-0 left-0 bg-[#1a1a1a]/40 border-b border-[#2a2a2a] flex items-center px-4 justify-between">
             <div className="text-[10px] text-slate-500 flex items-center">
                <span className="mr-2">Player:</span>
                <span className="bg-[#252525] px-2 py-0.5 rounded border border-[#333] text-white">Full Quality ▼</span>
             </div>
             <div className="flex space-x-4">
                <span>🖥️</span>
                <span>🎞️</span>
                <span>⚙️</span>
             </div>
          </div>

          <div className="w-full flex-1 flex items-center justify-center py-8">
            <div className="aspect-video w-full max-w-[800px] bg-black rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5 overflow-hidden relative group">
              {/* Split Screen Preview like in the screenshot */}
              <div className="grid grid-cols-4 h-full gap-1 p-1">
                 <div className="bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=800&fit=crop')] bg-cover bg-center rounded-sm"></div>
                 <div className="bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=800&fit=crop')] bg-cover bg-center rounded-sm"></div>
                 <div className="bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=800&fit=crop')] bg-cover bg-center rounded-sm"></div>
                 <div className="bg-[url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=800&fit=crop')] bg-cover bg-center rounded-sm"></div>
              </div>
              
              {/* Playback Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="text-6xl text-white drop-shadow-lg">
                   {isPlaying ? '⏸️' : '▶️'}
                 </button>
              </div>

              {/* Mini Scrub Bar */}
              <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full">
                 <div className="h-full bg-[#00c2a8] rounded-full" style={{ width: `${(playhead/TIMELINE_DURATION)*100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="h-16 w-full flex items-center justify-center space-x-8 px-4">
             <div className="flex items-center space-x-6">
                <button className="text-lg opacity-60 hover:opacity-100">⏮️</button>
                <button className="text-lg opacity-60 hover:opacity-100">⏪</button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-white rounded-full text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                <button className="text-lg opacity-60 hover:opacity-100">⏩</button>
                <button className="text-lg opacity-60 hover:opacity-100">⏭️</button>
             </div>
             <div className="text-[11px] font-mono text-slate-400 bg-[#1a1a1a] px-3 py-1 rounded-lg border border-[#333]">
                00:00:11:14 / 00:00:30:14
             </div>
             <div className="flex space-x-4 opacity-60">
                <span>🔇</span>
                <span>📸</span>
                <span>⏹️</span>
             </div>
          </div>
        </div>

        {/* Right: Inspector / Properties */}
        <div className="w-72 border-l border-[#2a2a2a] bg-[#1a1a1a] flex flex-col">
          <div className="flex h-10 border-b border-[#2a2a2a]">
            {['Text', 'Video', 'Audio', 'Color'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`flex-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab.toLowerCase() ? 'text-white border-b border-white bg-[#252525]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {selectedLayer ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div>
                   <label className="text-[9px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Paragraph 1 text</label>
                   <textarea 
                    value={selectedLayer.content}
                    onChange={(e) => {
                      const newLayers = [...layers];
                      const idx = newLayers.findIndex(l => l.id === selectedLayerId);
                      newLayers[idx].content = e.target.value;
                      setLayers(newLayers);
                    }}
                    className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-3 text-[11px] text-[#e0e0e0] min-h-[100px] outline-none focus:border-cyan-500/50"
                   />
                 </div>
                 
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Font Size</span>
                      <span className="text-[10px] text-white">24px</span>
                   </div>
                   <input type="range" className="w-full accent-cyan-500 h-1" />
                   
                   <div className="grid grid-cols-2 gap-2 pt-2">
                      <button className="bg-[#252525] p-2 rounded text-[10px] border border-[#333]">BOLD</button>
                      <button className="bg-[#252525] p-2 rounded text-[10px] border border-[#333]">ITALIC</button>
                   </div>
                 </div>

                 <div className="pt-6 border-t border-[#2a2a2a]">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase mb-4 tracking-widest">Transform</h5>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <span className="text-[9px] text-slate-500">Scale</span>
                          <input type="number" value="100" className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded p-1.5 text-[10px]" />
                       </div>
                       <div className="space-y-1">
                          <span className="text-[9px] text-slate-500">Opacity</span>
                          <input type="number" value="100" className="w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded p-1.5 text-[10px]" />
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
                <span className="text-4xl mb-4">⚙️</span>
                <p className="text-xs">Select a clip to edit properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Timeline (Bottom) */}
      <div className="h-72 border-t border-[#2a2a2a] bg-[#1a1a1a] flex flex-col select-none">
        {/* Track Controls & Time Rulers */}
        <div className="h-10 border-b border-[#2a2a2a] flex items-center justify-between bg-[#151515]">
           <div className="flex items-center space-x-4 px-4 h-full">
              <div className="flex space-x-2 border-r border-[#2a2a2a] pr-4 h-6 items-center">
                 <button className="text-xs opacity-50 hover:opacity-100">↩️</button>
                 <button className="text-xs opacity-50 hover:opacity-100">↪️</button>
                 <button className="text-xs opacity-50 hover:opacity-100">✂️</button>
                 <button className="text-xs opacity-50 hover:opacity-100">🗑️</button>
              </div>
              <div className="flex space-x-4 items-center">
                 <span className="text-[10px] text-slate-500">Video 1</span>
                 <span className="text-cyan-500">👁️</span>
                 <span className="text-slate-500">🔒</span>
              </div>
           </div>
           
           <div className="flex-1 h-full relative overflow-hidden">
             {/* Time Ruler */}
              <div className="flex h-full items-end pb-1 border-l border-[#2a2a2a]">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className={`min-w-[40px] flex flex-col items-start border-l ${i % 5 === 0 ? 'border-slate-500 h-3' : 'border-slate-800 h-1.5'}`}>
                    {i % 5 === 0 && <span className="text-[8px] text-slate-600 -ml-1 -mt-3">00:00:{i.toString().padStart(2, '0')}:00</span>}
                  </div>
                ))}
              </div>
           </div>

           <div className="w-64 flex items-center px-4 justify-end space-x-3 h-full">
              <span className="text-[10px] text-slate-500">🔍</span>
              <div className="w-24 bg-[#252525] h-1 rounded-full overflow-hidden">
                 <div className="bg-cyan-500 w-1/2 h-full"></div>
              </div>
           </div>
        </div>

        {/* Tracks Content */}
        <div className="flex-1 flex overflow-hidden">
           {/* Fixed sidebar for track headers */}
           <div className="w-20 bg-[#151515] border-r border-[#2a2a2a] flex flex-col space-y-1 py-1">
              <div className="h-12 flex items-center justify-center text-[10px] font-bold text-slate-600 border-b border-[#222]">V1</div>
              <div className="h-12 flex items-center justify-center text-[10px] font-bold text-slate-600 border-b border-[#222]">V2</div>
              <div className="h-10 flex items-center justify-center text-[10px] font-bold text-slate-600 border-b border-[#222]">A1</div>
           </div>

           {/* Scrollable Tracks Area */}
           <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-hide bg-[#111] relative">
              <div ref={timelineRef} onClick={handleTimelineClick} className="relative h-full min-w-[3000px] py-1 space-y-1">
                 {/* Playhead Marker (Red Vertical Line) */}
                 <div 
                   className="absolute top-0 bottom-0 w-px bg-red-600 z-50 pointer-events-none"
                   style={{ left: `${(playhead / TIMELINE_DURATION) * 100}%` }}
                 >
                    <div className="w-2 h-2 bg-red-600 rounded-full -ml-[3.5px] -mt-[4px] relative border border-white/20"></div>
                 </div>

                 {/* Video Track 1 */}
                 <div className="h-12 w-full flex items-center relative bg-[#1a1a1a]/40 group">
                    {layers.filter(l => l.type === 'video' && l.id === '1').map(layer => (
                      <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                        className={`absolute h-10 rounded border transition-all ${selectedLayerId === layer.id ? 'bg-[#00c2a8]/20 border-[#00c2a8] ring-1 ring-[#00c2a8]/50' : 'bg-blue-600/40 border-blue-500/50 hover:bg-blue-600/60'} flex overflow-hidden`}
                        style={{ 
                          left: `${(layer.startTime / TIMELINE_DURATION) * 100}%`,
                          width: `${(layer.duration / TIMELINE_DURATION) * 100}%`
                        }}
                      >
                         <div className="flex items-center h-full space-x-1 px-1">
                            <span className="text-[10px] font-bold drop-shadow-md whitespace-nowrap">{layer.thumbnail} {layer.content}</span>
                         </div>
                         <div className="flex-1 h-full flex opacity-30 pointer-events-none">
                            <div className="w-10 border-r border-black/10"></div>
                            <div className="w-10 border-r border-black/10"></div>
                            <div className="w-10 border-r border-black/10"></div>
                         </div>
                      </div>
                    ))}
                 </div>

                 {/* Video Track 2 */}
                 <div className="h-12 w-full flex items-center relative bg-[#1a1a1a]/40 group">
                    {layers.filter(l => l.type === 'video' && l.id === '2').map(layer => (
                      <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                        className={`absolute h-10 rounded border transition-all ${selectedLayerId === layer.id ? 'bg-[#00c2a8]/20 border-[#00c2a8]' : 'bg-indigo-600/40 border-indigo-500/50'} flex overflow-hidden`}
                        style={{ 
                          left: `${(layer.startTime / TIMELINE_DURATION) * 100}%`,
                          width: `${(layer.duration / TIMELINE_DURATION) * 100}%`
                        }}
                      >
                         <span className="text-[10px] font-bold p-2 truncate">{layer.thumbnail} {layer.content}</span>
                      </div>
                    ))}
                 </div>

                 {/* Overlay / Text Track */}
                 <div className="h-8 w-full flex items-center relative bg-transparent group">
                    {layers.filter(l => l.type === 'text').map(layer => (
                      <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                        className={`absolute h-6 rounded border transition-all ${selectedLayerId === layer.id ? 'bg-[#00c2a8]/20 border-[#00c2a8]' : 'bg-pink-600/40 border-pink-500/50'} flex items-center px-2`}
                        style={{ 
                          left: `${(layer.startTime / TIMELINE_DURATION) * 100}%`,
                          width: `${(layer.duration / TIMELINE_DURATION) * 100}%`
                        }}
                      >
                         <span className="text-[9px] font-black italic truncate">T {layer.content}</span>
                      </div>
                    ))}
                 </div>

                 {/* Audio Track */}
                 <div className="h-10 w-full flex items-center relative bg-[#1a1a1a]/40 group mt-2">
                    {layers.filter(l => l.type === 'audio').map(layer => (
                      <div
                        key={layer.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedLayerId(layer.id); }}
                        className={`absolute h-8 rounded border transition-all ${selectedLayerId === layer.id ? 'bg-[#00c2a8]/20 border-[#00c2a8]' : 'bg-teal-600/40 border-teal-500/50'} flex flex-col justify-center overflow-hidden`}
                        style={{ 
                          left: `${(layer.startTime / TIMELINE_DURATION) * 100}%`,
                          width: `${(layer.duration / TIMELINE_DURATION) * 100}%`
                        }}
                      >
                         <div className="flex h-full items-center px-3 opacity-40">
                            {Array.from({ length: 40 }).map((_, j) => (
                              <div key={j} className="w-[1px] bg-white rounded-full mx-[1px]" style={{ height: `${Math.random()*100}%` }}></div>
                            ))}
                         </div>
                         <span className="absolute left-2 text-[8px] font-bold drop-shadow-md">🎵 {layer.content}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudioPro;

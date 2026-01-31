
import React, { useState, useEffect } from 'react';
import { collectionService } from '../services/collectionService';
import { usageService } from '../services/usageService';
import { SavedItem } from '../types';

const SavedCollections: React.FC = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const userProfile = usageService.getCurrentUser();
  const isPro = userProfile?.plan === 'pro' || userProfile?.plan === 'agency';

  const loadCollection = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const data = await collectionService.getItems(userProfile.id);
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollection();
  }, [userProfile?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this creation from your studio library?")) return;
    try {
      await collectionService.deleteItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (e) {
      alert("Failed to delete.");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 space-y-6">
        <div className="text-8xl opacity-20">📂</div>
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">Studio Archive</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Saving your viral creations to a persistent cloud library is a Pro Exclusive feature. Archive your scripts, ads, and captions forever.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('changeView', { detail: 'pricing' }))}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">Studio Library</h2>
          <p className="text-slate-500 font-medium">{items.length} Archived Generations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
             <span className="absolute left-3 top-3 opacity-30">🔍</span>
             <input 
               type="text" 
               placeholder="Search archive..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
             />
          </div>
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-bold uppercase tracking-widest"
          >
            <option value="all">All Content</option>
            <option value="caption">Captions</option>
            <option value="hook">TikTok Hooks</option>
            <option value="script">Scripts</option>
            <option value="ad">Business Ads</option>
            <option value="promo">WhatsApp</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded tracking-widest ${
                    item.type === 'caption' ? 'bg-blue-100 text-blue-600' :
                    item.type === 'hook' ? 'bg-cyan-100 text-cyan-600' :
                    item.type === 'script' ? 'bg-purple-100 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{new Date(item.created_at).toLocaleDateString()}</span>
               </div>
               
               <div className="mb-4">
                 <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Context</h4>
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{item.topic}</p>
               </div>

               <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-6">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-6 font-medium whitespace-pre-wrap">
                    {item.content}
                  </p>
               </div>

               <div className="flex items-center space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => handleCopy(item.content)}
                    className="flex-1 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black rounded-lg uppercase hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 flex flex-col items-center justify-center opacity-30 text-center space-y-4">
           <div className="text-9xl grayscale">📦</div>
           <div className="max-w-xs">
              <p className="text-xl font-black uppercase tracking-tighter">Collection Empty</p>
              <p className="text-sm">Start generating and archiving content to see your library grow.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default SavedCollections;

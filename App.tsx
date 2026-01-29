import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { ViewType } from './types';
import { authService } from './services/authService';
import { usageService } from './services/usageService';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
// Fix: Added missing import for Dashboard view
import Dashboard from './views/Dashboard';
import CaptionGenerator from './views/CaptionGenerator';
import DescriptionMaker from './views/DescriptionMaker';
import TikTokHooks from './views/TikTokHooks';
import ScriptWriter from './views/ScriptWriter';
import VideoPlanner from './views/VideoPlanner';
import BusinessAds from './views/BusinessAds';
import WhatsAppPromo from './views/WhatsAppPromo';
import ContentIdeas from './views/ContentIdeas';
import ImageLab from './views/ImageLab';
import VoiceStudio from './views/VoiceStudio';
import MediaAnalysis from './views/MediaAnalysis';
import Pricing from './views/Pricing';
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';
import VideoStudio from './views/VideoStudio';
import VideoEditor from './views/VideoEditor';
import SmartCut from './views/SmartCut';
import ShortCaptions from './views/ShortCaptions';
import TikTokEditPlan from './views/TikTokEditPlan';
import BRollGenerator from './views/BRollGenerator';
import MusicSync from './views/MusicSync';
import ZoomEffects from './views/ZoomEffects';
import VideoTemplates from './views/VideoTemplates';
import VideoDirector from './views/VideoDirector';

const ConfigError: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center space-y-8">
    <div className="text-8xl animate-bounce">🛠️</div>
    <div className="max-w-md space-y-4">
      <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Supabase Required</h1>
      <p className="text-slate-400 font-medium text-lg leading-relaxed">
        To launch Sonny Studio, you need to provide your Supabase API Key.
      </p>
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left space-y-4">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Configuration Status:</p>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-slate-300">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            URL: Detected
          </li>
          <li className="flex items-center text-sm text-slate-300">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
            ANON_KEY: Missing
          </li>
        </ul>
        <p className="text-[10px] text-slate-500 italic mt-4 font-medium">
          Add SUPABASE_ANON_KEY to your environment variables to activate authentication and database features.
        </p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.LOGIN);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sm_pro_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('sm_pro_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Handle Supabase Auth State
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const authenticated = !!session;
        setIsAuth(authenticated);
        
        if (authenticated) {
          await usageService.refreshProfile();
          // Fix: Initial auth check now redirects to Dashboard instead of Caption Gen
          setActiveView(ViewType.DASHBOARD);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const authenticated = !!session;
      setIsAuth(authenticated);
      
      if (event === 'SIGNED_IN') {
        await usageService.refreshProfile();
        // Fix: Sign in event now correctly redirects to the Dashboard view
        setActiveView(ViewType.DASHBOARD);
      } else if (event === 'SIGNED_OUT') {
        setActiveView(ViewType.LOGIN);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleViewChange = (e: any) => { if (e.detail) setActiveView(e.detail as ViewType); };
    window.addEventListener('changeView', handleViewChange);
    return () => window.removeEventListener('changeView', handleViewChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If environment variables are missing, show the setup instructions
  if (!isSupabaseConfigured || !supabase) {
    return <ConfigError />;
  }

  const renderView = () => {
    const publicViews = [ViewType.LOGIN, ViewType.REGISTER];
    if (!isAuth && !publicViews.includes(activeView)) return <Login onViewChange={setActiveView} />;

    switch (activeView) {
      case ViewType.LOGIN: return <Login onViewChange={setActiveView} />;
      case ViewType.REGISTER: return <Register onViewChange={setActiveView} />;
      // Fix: Added case for DASHBOARD in the view switch
      case ViewType.DASHBOARD: return <Dashboard />;
      case ViewType.PRICING: return <Pricing />;
      case ViewType.CAPTION_GEN: return <CaptionGenerator />;
      case ViewType.DESCRIPTION_GEN: return <DescriptionMaker />;
      case ViewType.TIKTOK_HOOKS: return <TikTokHooks />;
      case ViewType.SCRIPT_WRITER: return <ScriptWriter />;
      case ViewType.VIDEO_PLANNER: return <VideoPlanner />;
      case ViewType.BUSINESS_ADS: return <BusinessAds />;
      case ViewType.WHATSAPP_PROMO: return <WhatsAppPromo />;
      case ViewType.CONTENT_IDEAS: return <ContentIdeas />;
      case ViewType.IMAGE_LAB: return <ImageLab />;
      // Fix: Changed ViewType.VOICE_STUDIO to ViewType.VOICE_LIVE to match types.ts
      case ViewType.VOICE_LIVE: return <VoiceStudio />;
      case ViewType.ANALYSIS: return <MediaAnalysis />;
      case ViewType.VIDEO_STUDIO: return <VideoStudio />;
      case ViewType.VIDEO_EDITOR: return <VideoEditor />;
      case ViewType.SMART_CUT: return <SmartCut />;
      case ViewType.SHORT_CAPTIONS: return <ShortCaptions />;
      case ViewType.TIKTOK_EDIT_PLAN: return <TikTokEditPlan />;
      case ViewType.B_ROLL_GEN: return <BRollGenerator />;
      case ViewType.MUSIC_SYNC: return <MusicSync />;
      case ViewType.ZOOM_EFFECTS: return <ZoomEffects />;
      case ViewType.VIDEO_TEMPLATES: return <VideoTemplates />;
      case ViewType.VIDEO_DIRECTOR: return <VideoDirector />;
      default: return <CaptionGenerator />;
    }
  };

  const standaloneViews = [ViewType.LOGIN, ViewType.REGISTER];
  if (standaloneViews.includes(activeView)) return renderView();

  return (
    <Layout activeView={activeView} onViewChange={setActiveView} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}>
      {renderView()}
    </Layout>
  );
};

export default App;
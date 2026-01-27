
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { ViewType } from './types';
import { authService } from './services/authService';
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
import Dashboard from './views/Dashboard';
import Login from './views/Auth/Login';
import Register from './views/Auth/Register';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    return authService.isAuthenticated() ? ViewType.DASHBOARD : ViewType.LOGIN;
  });
  const [isAuth, setIsAuth] = useState(authService.isAuthenticated());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sm_pro_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('sm_pro_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleViewChange = (e: any) => { if (e.detail) setActiveView(e.detail as ViewType); };
    window.addEventListener('changeView', handleViewChange);
    return () => window.removeEventListener('changeView', handleViewChange);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuth(authenticated);
      const publicViews = [ViewType.LOGIN, ViewType.REGISTER];
      if (!authenticated && !publicViews.includes(activeView)) setActiveView(ViewType.LOGIN);
    };
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, [activeView]);

  const renderView = () => {
    const publicViews = [ViewType.LOGIN, ViewType.REGISTER];
    if (!isAuth && !publicViews.includes(activeView)) return <Login onViewChange={setActiveView} />;

    switch (activeView) {
      case ViewType.LOGIN: return <Login onViewChange={setActiveView} />;
      case ViewType.REGISTER: return <Register onViewChange={setActiveView} />;
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
      case ViewType.VOICE_LIVE: return <VoiceStudio />;
      case ViewType.ANALYSIS: return <MediaAnalysis />;
      default: return <Dashboard />;
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

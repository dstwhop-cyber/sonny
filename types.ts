
export enum ViewType {
  DASHBOARD = 'dashboard',
  CAPTION_GEN = 'caption_gen',
  DESCRIPTION_GEN = 'description_gen',
  TIKTOK_HOOKS = 'tiktok_hooks',
  SCRIPT_WRITER = 'script_writer',
  VIDEO_PLANNER = 'video_planner',
  BUSINESS_ADS = 'business_ads',
  WHATSAPP_PROMO = 'whatsapp_promo',
  CONTENT_IDEAS = 'content_ideas',
  IMAGE_LAB = 'image_lab',
  VOICE_LIVE = 'voice_live',
  ANALYSIS = 'analysis',
  PRICING = 'pricing',
  SAVED_COLLECTION = 'saved_collection',
  TERMS = 'terms',
  PRIVACY = 'privacy',
  // New Tool Views
  VIDEO_STUDIO = 'video_studio',
  VIDEO_EDITOR = 'video_editor',
  TIMELINE_EDITOR = 'timeline_editor',
  SMART_CUT = 'smart_cut',
  SHORT_CAPTIONS = 'short_captions',
  TIKTOK_EDIT_PLAN = 'tiktok_edit_plan',
  B_ROLL_GEN = 'b_roll_gen',
  MUSIC_SYNC = 'music_sync',
  ZOOM_EFFECTS = 'zoom_effects',
  VIDEO_TEMPLATES = 'video_templates',
  VIDEO_DIRECTOR = 'video_director',
  // Auth Views
  LOGIN = 'login',
  REGISTER = 'register'
}

declare global {
  /* Define AIStudio interface to match the expected type from the host environment */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Add readonly modifier to match the property's existing definition in the global scope
    readonly aistudio: AIStudio;
  }
  
  /* Augment NodeJS namespace to provide types for process.env without redeclaring the block-scoped variable 'process' */
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
  }
}

export type PlanType = 'free' | 'pro' | 'agency';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'none';

export interface SavedItem {
  id: string;
  user_id: string;
  type: string; // e.g., 'caption', 'hook', 'script'
  topic: string;
  content: string;
  metadata?: any;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  passwordHash: string;
  plan: PlanType;
  subStatus: SubscriptionStatus;
  subId?: string;
  paddleId?: string;
  isBanned: boolean;
  createdAt: string;
  usage: {
    textCount: number;
    proCount: number;
    stats: {
      captions: number;
      hooks: number;
      videos: number;
      images: number;
      ideas: number;
      voice: number;
      analysis: number;
      video_director: number;
      video_planner: number;
    };
  };
}

export interface VideoScene {
  scene_id: number;
  duration_seconds: number;
  narration: string;
  visuals: string;
  camera: string;
  background: string;
  on_screen_text: string;
  audio: string;
}

export interface VideoGenerationPlan {
  total_duration_seconds: number;
  scenes: VideoScene[];
}

export interface GlobalConfig {
  featuresEnabled: {
    text: boolean;
    media: boolean;
    voice: boolean;
  };
  maintenanceMode: boolean;
}

export interface SystemLog {
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  message: string;
  userId?: string;
}

export interface ScriptVariation {
  variation_title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

export interface EditDecision {
  action: 'cut' | 'keep';
  start_time: string;
  end_time: string;
  reason: string;
}

export interface ShortCaption {
  timestamp_start: string;
  caption_text: string;
}

export interface EditPlanItem {
  timestamp: string;
  action: string;
  visual: string;
  reasoning: string;
  text_overlay?: string;
}

export interface BRollSuggestion {
  timestamp: string;
  duration: string;
  description: string;
}

export interface MusicSyncItem {
  timestamp: string;
  action: string;
  volume_level: string;
}

export interface ZoomEffect {
  timestamp_start: string;
  timestamp_end: string;
  zoom_level: string;
}

export interface VideoTemplate {
  cut_pacing: string;
  caption_style: string;
  music_usage: string;
  effects_style: string;
}

export interface FullEditPlan {
  style_preset: {
    pacing: string;
    vibe: string;
    font_suggestion: string;
  };
  cuts: { start: string; end: string; action: string; reason: string }[];
  captions: { start: string; text: string }[];
  zooms: { start: string; end: string; level: string }[];
  text_effects: { timestamp: string; text: string; style: string }[];
  b_roll: { timestamp: string; description: string; duration: string }[];
  music: { timestamp: string; action: string; volume: string }[];
}


// Use correct Google GenAI SDK imports
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { 
  VideoGenerationPlan, 
  EditDecision, 
  ShortCaption, 
  EditPlanItem, 
  BRollSuggestion, 
  MusicSyncItem, 
  ZoomEffect, 
  VideoTemplate, 
  FullEditPlan,
  ScriptVariation
} from "../types";

/**
 * Initialize a new GoogleGenAI instance right before making an API call 
 * as per the "API Key Selection" guidelines for Veo/Imagen models.
 */
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to extract text and grounding from a generateContent response
 */
const processResponse = (response: GenerateContentResponse) => {
  return {
    text: response.text || "",
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// --- SCHEMA DEFINITIONS ---

const VideoGenerationPlanSchema = {
  type: Type.OBJECT,
  properties: {
    total_duration_seconds: { type: Type.NUMBER },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scene_id: { type: Type.NUMBER },
          duration_seconds: { type: Type.NUMBER },
          narration: { type: Type.STRING },
          visuals: { type: Type.STRING },
          camera: { type: Type.STRING },
          background: { type: Type.STRING },
          on_screen_text: { type: Type.STRING },
          audio: { type: Type.STRING }
        },
        required: ['scene_id', 'duration_seconds', 'narration', 'visuals', 'camera', 'background', 'on_screen_text', 'audio']
      }
    }
  },
  required: ['total_duration_seconds', 'scenes']
};

const ScriptVariationSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      variation_title: { type: Type.STRING },
      hook: { type: Type.STRING },
      body: { type: Type.STRING },
      cta: { type: Type.STRING },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['variation_title', 'hook', 'body', 'cta', 'hashtags']
  }
};

const EditDecisionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING },
      start_time: { type: Type.STRING },
      end_time: { type: Type.STRING },
      reason: { type: Type.STRING }
    },
    required: ['action', 'start_time', 'end_time', 'reason']
  }
};

const ShortCaptionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp_start: { type: Type.STRING },
      caption_text: { type: Type.STRING }
    },
    required: ['timestamp_start', 'caption_text']
  }
};

const EditPlanItemSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp: { type: Type.STRING },
      action: { type: Type.STRING },
      visual: { type: Type.STRING },
      reasoning: { type: Type.STRING },
      text_overlay: { type: Type.STRING }
    },
    required: ['timestamp', 'action', 'visual', 'reasoning']
  }
};

const BRollSuggestionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp: { type: Type.STRING },
      duration: { type: Type.STRING },
      description: { type: Type.STRING }
    },
    required: ['timestamp', 'duration', 'description']
  }
};

const MusicSyncItemSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp: { type: Type.STRING },
      action: { type: Type.STRING },
      volume_level: { type: Type.STRING }
    },
    required: ['timestamp', 'action', 'volume_level']
  }
};

const ZoomEffectSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp_start: { type: Type.STRING },
      timestamp_end: { type: Type.STRING },
      zoom_level: { type: Type.STRING }
    },
    required: ['timestamp_start', 'timestamp_end', 'zoom_level']
  }
};

const VideoTemplateSchema = {
  type: Type.OBJECT,
  properties: {
    cut_pacing: { type: Type.STRING },
    caption_style: { type: Type.STRING },
    music_usage: { type: Type.STRING },
    effects_style: { type: Type.STRING }
  },
  required: ['cut_pacing', 'caption_style', 'music_usage', 'effects_style']
};

const FullEditPlanSchema = {
  type: Type.OBJECT,
  properties: {
    style_preset: {
      type: Type.OBJECT,
      properties: {
        pacing: { type: Type.STRING },
        vibe: { type: Type.STRING },
        font_suggestion: { type: Type.STRING }
      },
      required: ['pacing', 'vibe', 'font_suggestion']
    },
    cuts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { start: { type: Type.STRING }, end: { type: Type.STRING }, action: { type: Type.STRING }, reason: { type: Type.STRING } } } },
    captions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { start: { type: Type.STRING }, text: { type: Type.STRING } } } },
    zooms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { start: { type: Type.STRING }, end: { type: Type.STRING }, level: { type: Type.STRING } } } },
    text_effects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING }, text: { type: Type.STRING }, style: { type: Type.STRING } } } },
    b_roll: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING }, description: { type: Type.STRING }, duration: { type: Type.STRING } } } },
    music: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { timestamp: { type: Type.STRING }, action: { type: Type.STRING }, volume: { type: Type.STRING } } } }
  },
  required: ['style_preset', 'cuts', 'captions', 'zooms', 'text_effects', 'b_roll', 'music']
};

// --- SERVICE IMPLEMENTATIONS ---

/* Updated to fix TS error: ensure parameters are handled */
export const generateVideoPlan = async (config: {
  script: string;
  style: string;
}): Promise<VideoGenerationPlan | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Convert this script into a detailed video generation plan: "${config.script}". Style: ${config.style}.`,
    config: {
      systemInstruction: "You are an AI video production specialist. Split the script into short, engaging scenes.",
      responseMimeType: "application/json",
      responseSchema: VideoGenerationPlanSchema
    }
  });
  try {
    return JSON.parse(response.text || "null");
  } catch (e) {
    return null;
  }
};

/* Updated to fix TS error: added missing properties useThinking, useSearch, useMaps, and location */
export const generateDescription = async (config: {
  topic: string;
  platform: string;
  tone: string;
  audience: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAI();
  const tools: any[] = [];
  if (config.useSearch) tools.push({ googleSearch: {} });
  if (config.useMaps) tools.push({ googleMaps: {} });

  const response = await ai.models.generateContent({
    model: config.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: `Write a detailed description for a ${config.platform} post. Topic: ${config.topic}, Audience: ${config.audience}, Tone: ${config.tone}. Structure: Hook/Body/CTA. Max 200 words.`,
    config: {
      systemInstruction: "You are a professional social media manager.",
      tools: tools.length > 0 ? tools : undefined,
      toolConfig: config.location ? { retrievalConfig: { latLng: config.location } } : undefined,
      thinkingConfig: config.useThinking ? { thinkingBudget: 32768 } : undefined
    }
  });
  return processResponse(response);
};

export const generateCaption = async (config: {
  topic: string;
  tone: string;
  audience: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a high-performing Instagram caption for: ${config.topic}. Tone: ${config.tone}, Audience: ${config.audience}. Rules: Scroll-stopping hook, human story, clear CTA, max 60 words, NO hashtags.`,
    config: { systemInstruction: "You are a professional copywriter." }
  });
  return processResponse(response);
};

/* Updated to fix TS error: added missing properties useThinking, useSearch, useMaps, and location */
export const generateTikTokHooks = async (config: {
  topic: string;
  tone: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAI();
  const tools: any[] = [];
  if (config.useSearch) tools.push({ googleSearch: {} });
  if (config.useMaps) tools.push({ googleMaps: {} });

  const response = await ai.models.generateContent({
    model: config.useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
    contents: `Generate 3 viral TikTok hooks for: ${config.topic}. Tone: ${config.tone}. Focus on curiosity and high energy.`,
    config: {
      systemInstruction: "You are a viral content strategist.",
      tools: tools.length > 0 ? tools : undefined,
      toolConfig: config.location ? { retrievalConfig: { latLng: config.location } } : undefined,
      thinkingConfig: config.useThinking ? { thinkingBudget: 32768 } : undefined
    }
  });
  return processResponse(response);
};

/* Updated to fix TS error: added missing properties useThinking, useSearch, useMaps, and location */
export const generateSocialScripts = async (config: {
  topic: string;
  tone: string;
  duration: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}): Promise<{ variations: ScriptVariation[]; grounding: any[] }> => {
  const ai = getAI();
  const tools: any[] = [];
  if (config.useSearch) tools.push({ googleSearch: {} });
  if (config.useMaps) tools.push({ googleMaps: {} });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Always pro for complex multi-variation scripting
    contents: `Generate 3 unique script variations for the topic: "${config.topic}". Tone: ${config.tone}. Target Duration: ${config.duration}.`,
    config: {
      systemInstruction: "You are an AI social media script writer.",
      responseMimeType: "application/json",
      responseSchema: ScriptVariationSchema,
      tools: tools.length > 0 ? tools : undefined,
      toolConfig: config.location ? { retrievalConfig: { latLng: config.location } } : undefined,
      thinkingConfig: config.useThinking ? { thinkingBudget: 32768 } : undefined
    }
  });
  
  try {
    const variations = JSON.parse(response.text || "[]");
    return { variations, grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (e) {
    return { variations: [], grounding: [] };
  }
};

export const generateBusinessAd = async (config: {
  topic: string;
  audience: string;
  tone: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Direct-response ad for: ${config.topic}. Audience: ${config.audience}. Tone: ${config.tone}. Include a strong call to action.`,
    config: { systemInstruction: "You are a direct response marketer." }
  });
  return processResponse(response);
};

export const generateWhatsAppPromo = async (config: {
  topic: string;
  audience: string;
  tone: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `WhatsApp sales message for: ${config.topic}. Audience: ${config.audience}. Under 70 words, conversational.`,
    config: { systemInstruction: "You are a WhatsApp marketing expert." }
  });
  return processResponse(response);
};

export const generateContentIdeas = async (config: {
  platform: string;
  topic: string;
  audience: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate exactly 5 trending content ideas for ${config.platform} about ${config.topic}. Target audience: ${config.audience}.`,
    config: { systemInstruction: "You are a strategic content planner." }
  });
  return processResponse(response);
};

export const generateImage = async (params: {
  prompt: string;
}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: params.prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const candidates = response.candidates;
  if (candidates && candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
    for (const part of candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  throw new Error("No image data returned from Gemini.");
};

export const generateVideo = async (params: { prompt: string }) => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

/* Updated to fix TS error: added startImage, endImage, and aspectRatio properties */
export const editVideo = async (params: { 
  prompt: string; 
  startImage?: { data: string; mimeType: string };
  endImage?: { data: string; mimeType: string };
  aspectRatio?: '16:9' | '9:16';
}) => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    image: params.startImage ? {
      imageBytes: params.startImage.data,
      mimeType: params.startImage.mimeType
    } : undefined,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: params.aspectRatio || '16:9',
      lastFrame: params.endImage ? {
        imageBytes: params.endImage.data,
        mimeType: params.endImage.mimeType
      } : undefined
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const analyzeMedia = async (params: {
  prompt: string;
  mediaData: string;
  mimeType: string;
}) => {
  const ai = getAI();
  const mediaPart = {
    inlineData: {
      mimeType: params.mimeType,
      data: params.mediaData
    }
  };
  const textPart = { text: params.prompt };
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [mediaPart, textPart] }
  });
  return response.text || "Analysis complete.";
};

export const textToSpeech = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS failed to return audio.");
  return base64Audio;
};

export const generateEditDecisions = async (description: string): Promise<EditDecision[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this transcript for smart cuts: "${description}".`,
    config: {
      systemInstruction: "You are an AI video editor.",
      responseMimeType: "application/json",
      responseSchema: EditDecisionSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateShortCaptions = async (transcript: string, tone: string): Promise<ShortCaption[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate viral subtitles for this transcript: "${transcript}". Tone: ${tone}.`,
    config: {
      systemInstruction: "You are a captioning specialist.",
      responseMimeType: "application/json",
      responseSchema: ShortCaptionSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateTikTokEditPlan = async (topic: string, tone: string): Promise<EditPlanItem[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a viral editing plan for topic: "${topic}". Tone: ${tone}.`,
    config: {
      systemInstruction: "You are a TikTok director.",
      responseMimeType: "application/json",
      responseSchema: EditPlanItemSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateBRollSuggestions = async (topic: string, duration: string): Promise<BRollSuggestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest B-roll for: "${topic}" Duration: ${duration}.`,
    config: {
      systemInstruction: "You are a cinematographer.",
      responseMimeType: "application/json",
      responseSchema: BRollSuggestionSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateMusicSync = async (mood: string, duration: string): Promise<MusicSyncItem[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Music sync plan for mood: "${mood}" Duration: ${duration}.`,
    config: {
      systemInstruction: "You are a music supervisor.",
      responseMimeType: "application/json",
      responseSchema: MusicSyncItemSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateZoomEffects = async (transcript: string): Promise<ZoomEffect[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Plan zoom keyframes for: "${transcript}".`,
    config: {
      systemInstruction: "You are a video technician.",
      responseMimeType: "application/json",
      responseSchema: ZoomEffectSchema
    }
  });
  try {
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const generateVideoTemplate = async (type: string): Promise<VideoTemplate | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate video preset for genre: "${type}".`,
    config: {
      systemInstruction: "You are a production template designer.",
      responseMimeType: "application/json",
      responseSchema: VideoTemplateSchema
    }
  });
  try {
    return JSON.parse(response.text || "null");
  } catch (e) { return null; }
};

export const generateFullEditPlan = async (config: {
  topic: string;
  duration: string;
  tone: string;
  platform: string;
  music_mood: string;
  caption_style: string;
}): Promise<FullEditPlan | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Create comprehensive edit plan for: "${config.topic}". Duration: ${config.duration}, Tone: ${config.tone}, Platform: ${config.platform}.`,
    config: {
      systemInstruction: "You are an expert video director.",
      responseMimeType: "application/json",
      responseSchema: FullEditPlanSchema
    }
  });
  try {
    return JSON.parse(response.text || "null");
  } catch (e) { return null; }
};

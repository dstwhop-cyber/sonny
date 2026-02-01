
import { GoogleGenAI, Type, Modality } from "@google/genai";
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

/* Helper to select model and config based on enhanced tools */
const getModelAndConfig = (config: { useThinking?: boolean; useSearch?: boolean; useMaps?: boolean }) => {
  let model = 'gemini-3-flash-preview';
  if (config.useMaps) model = 'gemini-2.5-flash';
  else if (config.useThinking) model = 'gemini-3-pro-preview';

  const tools: any[] = [];
  if (config.useSearch) tools.push({ googleSearch: {} });
  if (config.useMaps) tools.push({ googleMaps: {} });

  return { model, tools };
};

// Fixed: Removed 'as string' cast to strictly adhere to initialization guidelines using process.env.API_KEY directly.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateVideoPlan = async (config: {
  script: string;
  style: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}): Promise<VideoGenerationPlan | null> => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);

  const response = await ai.models.generateContent({
    model: model as any,
    contents: `Convert this script into a detailed video generation plan: "${config.script}". Style: ${config.style}`,
    config: {
      systemInstruction: `You are an AI video production specialist. Split the script into short, engaging scenes. Output ONLY valid JSON. Total duration MUST be calculated accurately based on natural reading speed (~140 wpm).`,
      responseMimeType: "application/json",
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      }),
      responseSchema: {
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
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse video plan JSON", e);
    return null;
  }
};

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
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `You are a professional social media manager. Write a detailed description for a ${config.platform} post. Topic: ${config.topic}, Audience: ${config.audience}, Tone: ${config.tone}. Structure: Hook/Body/CTA. Max 200 words.`;

  const response = await ai.models.generateContent({
    model: model as any,
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateCaption = async (config: {
  topic: string;
  tone: string;
  audience: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `Write a high-performing Instagram caption for: ${config.topic}. Tone: ${config.tone}, Audience: ${config.audience}. Rules: Scroll-stopping hook, human story, clear CTA, max 60 words, NO hashtags.`;

  const response = await ai.models.generateContent({
    model: model as any,
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateTikTokHooks = async (config: {
  topic: string;
  tone: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `Generate 3 viral TikTok hooks for: ${config.topic}. Tone: ${config.tone}. Use real-world facts or trends where applicable.`;

  const response = await ai.models.generateContent({
    model: model as any,
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateSocialScripts = async (config: {
  topic: string;
  tone: string;
  duration: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}): Promise<{ variations: ScriptVariation[]; grounding: any[] }> => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);

  const response = await ai.models.generateContent({
    model: model as any,
    contents: `Generate 3 unique script variations for the topic: "${config.topic}". Tone: ${config.tone}. Target Duration: ${config.duration}.`,
    config: {
      systemInstruction: `You are an AI social media script writer. Response must be valid JSON. Include hook, body, CTA, and 3-5 hashtags.`,
      responseMimeType: "application/json",
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      }),
      responseSchema: {
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
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '[]');
    return {
      variations: data,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e) { return { variations: [], grounding: [] }; }
};

export const generateBusinessAd = async (config: {
  topic: string;
  audience: string;
  tone: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `Direct-response ad for: ${config.topic}. Audience: ${config.audience}. Tone: ${config.tone}. Include specific data or social proof if found.`;
  
  const response = await ai.models.generateContent({ 
    model: model as any, 
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateWhatsAppPromo = async (config: {
  topic: string;
  audience: string;
  tone: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `WhatsApp sales message for: ${config.topic}. Audience: ${config.audience}. Under 70 words, conversational.`;
  
  const response = await ai.models.generateContent({ 
    model: model as any, 
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateContentIdeas = async (config: {
  platform: string;
  topic: string;
  audience: string;
  useThinking?: boolean;
  useSearch?: boolean;
  useMaps?: boolean;
  location?: { latitude: number; longitude: number };
}) => {
  const ai = getAIClient();
  const { model, tools } = getModelAndConfig(config);
  
  const prompt = `Generate exactly 5 trending content ideas for ${config.platform} about ${config.topic}. Target audience: ${config.audience}.`;
  
  const response = await ai.models.generateContent({ 
    model: model as any, 
    contents: prompt,
    config: {
      ...(tools.length > 0 && { tools }),
      ...(config.useThinking && { thinkingConfig: { thinkingBudget: 32768 } }),
      ...(config.useMaps && config.location && {
        toolConfig: { retrievalConfig: { latLng: { latitude: config.location.latitude, longitude: config.location.longitude } } }
      })
    }
  });

  return {
    text: response.text || '',
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateImage = async (params: {
  prompt: string;
  aspectRatio: string;
  imageSize: string;
}) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: params.prompt }] },
    config: {
      imageConfig: { aspectRatio: params.aspectRatio as any, imageSize: params.imageSize as any }
    }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image data returned from Gemini");
};

// Fixed: Removed 'as string' cast to follow strict initialization guidelines.
export const generateVideo = async (params: { prompt: string; aspectRatio: '16:9' | '9:16' }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: params.aspectRatio
    }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Fixed: Removed 'as string' cast to follow strict initialization guidelines.
export const editVideo = async (params: { 
  prompt: string; 
  startImage?: { data: string; mimeType: string }; 
  endImage?: { data: string; mimeType: string };
  aspectRatio: '16:9' | '9:16' 
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
      aspectRatio: params.aspectRatio,
      lastFrame: params.endImage ? {
        imageBytes: params.endImage.data,
        mimeType: params.endImage.mimeType
      } : undefined,
    }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const analyzeMedia = async (params: {
  prompt: string;
  mediaData: string;
  mimeType: string;
}) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: params.mediaData, mimeType: params.mimeType } },
        { text: params.prompt }
      ]
    }
  });
  return response.text || '';
};

export const textToSpeech = async (text: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    }
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio returned");
  return base64Audio;
};

export const generateEditDecisions = async (description: string): Promise<EditDecision[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this video transcript/description for smart cuts: "${description}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: 'Action to take (cut or keep)' },
            start_time: { type: Type.STRING },
            end_time: { type: Type.STRING },
            reason: { type: Type.STRING }
          },
          required: ['action', 'start_time', 'end_time', 'reason']
        }
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateShortCaptions = async (transcript: string, tone: string): Promise<ShortCaption[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate viral subtitles for this transcript: "${transcript}". Tone: ${tone}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            timestamp_start: { type: Type.STRING },
            caption_text: { type: Type.STRING }
          },
          required: ['timestamp_start', 'caption_text']
        }
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateTikTokEditPlan = async (topic: string, tone: string): Promise<EditPlanItem[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a viral editing plan for topic: "${topic}". Tone: ${tone}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateBRollSuggestions = async (topic: string, duration: string): Promise<BRollSuggestion[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest cinematic B-roll for topic: "${topic}" and duration: ${duration}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateMusicSync = async (mood: string, duration: string): Promise<MusicSyncItem[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a music sync plan for mood: "${mood}" and duration: ${duration}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateZoomEffects = async (transcript: string): Promise<ZoomEffect[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Plan dynamic zoom-in and zoom-out keyframes for this transcript: "${transcript}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
};

export const generateVideoTemplate = async (type: string): Promise<VideoTemplate | null> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed video production template/preset for genre: "${type}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          cut_pacing: { type: Type.STRING },
          caption_style: { type: Type.STRING },
          music_usage: { type: Type.STRING },
          effects_style: { type: Type.STRING }
        },
        required: ['cut_pacing', 'caption_style', 'music_usage', 'effects_style']
      }
    }
  });
  try { return JSON.parse(response.text || 'null'); } catch (e) { return null; }
};

export const generateFullEditPlan = async (config: {
  topic: string;
  duration: string;
  tone: string;
  platform: string;
  music_mood: string;
  caption_style: string;
}): Promise<FullEditPlan | null> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a comprehensive expert edit plan for topic: "${config.topic}". Duration: ${config.duration}, Tone: ${config.tone}, Platform: ${config.platform}, Music: ${config.music_mood}, Captions: ${config.caption_style}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
          cuts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                action: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ['start', 'end', 'action', 'reason']
            }
          },
          captions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ['start', 'text']
            }
          },
          zooms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                start: { type: Type.STRING },
                end: { type: Type.STRING },
                level: { type: Type.STRING }
              },
              required: ['start', 'end', 'level']
            }
          },
          text_effects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                text: { type: Type.STRING },
                style: { type: Type.STRING }
              },
              required: ['timestamp', 'text', 'style']
            }
          },
          b_roll: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                description: { type: Type.STRING },
                duration: { type: Type.STRING }
              },
              required: ['timestamp', 'description', 'duration']
            }
          },
          music: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.STRING },
                action: { type: Type.STRING },
                volume: { type: Type.STRING }
              },
              required: ['timestamp', 'action', 'volume']
            }
          }
        },
        required: ['style_preset', 'cuts', 'captions', 'zooms', 'text_effects', 'b_roll', 'music']
      }
    }
  });
  try { return JSON.parse(response.text || 'null'); } catch (e) { return null; }
};

import { GoogleGenAI } from "@google/genai";
import { ENV } from "./_core/env";

interface InsightInput {
  signalId: string;
  signalTitle: string;
  signalTruth: string;
  role: string;
  industry: string;
  rawInput?: string; // New: Confessional input
}

export interface StoryboardScene {
  id: number;
  visual_prompt: string; // Description for background video generation
  text_overlay: string; // The "Script" text shown to user
  video_style: 'cinematic' | 'glitch' | 'data-flow' | 'abstract-tech';
  mood: 'dark' | 'bright' | 'urgent' | 'calm';
  video_url?: string; // Generated video URL (populated after video generation)
}

export interface InsightOutput {
  title: string;
  storyboard: StoryboardScene[];
  final_cta: string;
}

/**
 * Generate a bespoke strategic insight using Google Gemini API
 * This replaces the simulated scenario generator with real AI-powered analysis
 */
export async function generateInsight(input: InsightInput): Promise<InsightOutput> {
  const { signalId, signalTitle, signalTruth, role, industry, rawInput } = input;
  let insight: InsightOutput;

  const prompt = `You are a strategic AI consultant for Third Signal Labs. Generate a 5-scene "scrollytelling" storyboard script for a mobile experience based on the following context:

**Signal ID**: ${signalId}
**Signal**: ${signalTitle}
**Core Truth**: ${signalTruth}
**Client Role**: ${role}
**Industry**: ${industry}
**User Confession**: "${rawInput || 'No specific confession provided.'}"

Your task is to create a cinematic narrative journey. The output must be a JSON object containing a title, a final CTA, and a storyboard array of 5 scenes.

Each scene must have:
1. **visual_prompt**: A concise, vivid description for a background video loop (e.g., "Abstract data stream turning gold," "Cinematic drone shot of a futuristic city at night").
2. **text_overlay**: The script text displayed to the user. Keep it punchy, big typography style (max 10-15 words).
   - Scene 1: The Hook (Acknowledge the pain/context).
   - Scene 2: The Problem (Deepen the conflict).
   - Scene 3: The Shift (The "Aha" moment / Reframe).
   - Scene 4: The Future (The result/metric).
   - Scene 5: The Closing (Empowerment).
3. **video_style**: Choose from 'cinematic', 'glitch', 'data-flow', 'abstract-tech'.
4. **mood**: Choose from 'dark', 'bright', 'urgent', 'calm'.

Return ONLY valid JSON in this exact structure:
{
  "title": "string",
  "final_cta": "string",
  "storyboard": [
    { "id": 1, "visual_prompt": "...", "text_overlay": "...", "video_style": "...", "mood": "..." },
    { "id": 2, "visual_prompt": "...", "text_overlay": "...", "video_style": "...", "mood": "..." },
    { "id": 3, "visual_prompt": "...", "text_overlay": "...", "video_style": "...", "mood": "..." },
    { "id": 4, "visual_prompt": "...", "text_overlay": "...", "video_style": "...", "mood": "..." },
    { "id": 5, "visual_prompt": "...", "text_overlay": "...", "video_style": "...", "mood": "..." }
  ]
}

Make it feel like a high-end cinematic trailer for their future business success. Be bold.`;

  try {
    if (!ENV.geminiApiKey) {
      throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is not configured");
    }

    const ai = new GoogleGenAI({
      apiKey: ENV.geminiApiKey,
      apiVersion: "v1alpha",
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = response.text;

    if (!content) {
      throw new Error("No content returned from Gemini API");
    }

    insight = JSON.parse(content);

  } catch (error) {
    console.error("[Insight Generator] Text Generation Error:", error);

    // Fallback Storyboard
    insight = {
      title: `The ${industry} Paradox`,
      final_cta: "Deploy Intelligence",
      storyboard: [
        {
          id: 1,
          visual_prompt: "Dark, moody server room with flickering lights.",
          text_overlay: `In ${industry}, you're not fighting the market. You're fighting entropy.`,
          video_style: "cinematic",
          mood: "dark"
        },
        {
          id: 2,
          visual_prompt: "Glitching digital noise, static interference.",
          text_overlay: "Every manual process is a signal blocked by noise.",
          video_style: "glitch",
          mood: "urgent"
        },
        {
          id: 3,
          visual_prompt: "Golden light breaking through geometric structures.",
          text_overlay: "The shift: Don't manage the chaos. Automate the order.",
          video_style: "abstract-tech",
          mood: "bright"
        },
        {
          id: 4,
          visual_prompt: "Fast-moving data streams converging into a single beam.",
          text_overlay: "Result: Velocity +40%. Overhead -60%. Pure Signal.",
          video_style: "data-flow",
          mood: "urgent"
        },
        {
          id: 5,
          visual_prompt: "Calm, expansive horizon with a digital overlay.",
          text_overlay: "The future isn't waiting. It's compiling.",
          video_style: "cinematic",
          mood: "calm"
        }
      ]
    };
  }

  return insight;
}

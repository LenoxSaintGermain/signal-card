import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import {
  THIRD_MARK_LIVE_CONFIG,
  THIRD_MARK_LIVE_MODEL,
  THIRD_MARK_LIVE_REVEAL_THRESHOLD,
  THIRD_MARK_WELCOME_LINE,
  buildThirdMarkSystemInstruction,
} from "@shared/thirdMark";
import { ENV } from "./_core/env";
import { fetchSignalCardBriefing } from "./swarm";

export interface ThirdMarkLiveSessionInput {
  name?: string;
}

export interface ThirdMarkLiveSessionBootstrap {
  token: string;
  model: string;
  welcome: string;
  revealThreshold: number;
}

function getGeminiClient() {
  if (!ENV.geminiApiKey) {
    throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required for Third Mark Live sessions.");
  }

  return new GoogleGenAI({
    apiKey: ENV.geminiApiKey,
    apiVersion: "v1alpha",
  });
}

export async function createThirdMarkLiveSession(
  input: ThirdMarkLiveSessionInput
): Promise<ThirdMarkLiveSessionBootstrap> {
  const ai = getGeminiClient();
  const briefing = await fetchSignalCardBriefing(input.name);
  const systemInstruction = buildThirdMarkSystemInstruction(input.name, briefing);
  const now = Date.now();

  const token = await ai.authTokens.create({
    config: {
      uses: 1,
      newSessionExpireTime: new Date(now + 60_000).toISOString(),
      expireTime: new Date(now + 30 * 60_000).toISOString(),
      liveConnectConstraints: {
        model: THIRD_MARK_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          temperature: THIRD_MARK_LIVE_CONFIG.temperature,
          topP: THIRD_MARK_LIVE_CONFIG.topP,
          maxOutputTokens: THIRD_MARK_LIVE_CONFIG.maxOutputTokens,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: THIRD_MARK_LIVE_CONFIG.voiceName,
              },
            },
          },
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
          },
          systemInstruction,
        },
      },
      lockAdditionalFields: [],
    },
  });

  if (!token.name) {
    throw new Error("Gemini Live returned an empty ephemeral token.");
  }

  return {
    token: token.name,
    model: THIRD_MARK_LIVE_MODEL,
    welcome: THIRD_MARK_WELCOME_LINE,
    revealThreshold: THIRD_MARK_LIVE_REVEAL_THRESHOLD,
  };
}

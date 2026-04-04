import { GoogleGenAI, Modality, ThinkingLevel } from "@google/genai";
import {
  THIRD_MARK_LIVE_CONFIG,
  THIRD_MARK_LIVE_MODEL,
  THIRD_MARK_LIVE_REVEAL_THRESHOLD,
  THIRD_MARK_WELCOME_LINE,
  buildThirdMarkSystemInstruction,
} from "@shared/thirdMark";
import {
  DEFAULT_SIGNAL_CARD_AGENT_SETTINGS,
  resolveSignalCardLiveConfig,
  resolveSignalCardIdentity,
  type SignalCardResolvedLiveConfig,
} from "@shared/signalCardAgentSettings";
import { ENV } from "./_core/env";
import { fetchSignalCardAgentSettings, fetchSignalCardBriefing } from "./swarm";

export interface ThirdMarkLiveSessionInput {
  name?: string;
}

export interface ThirdMarkLiveSessionBootstrap {
  token: string;
  model: string;
  welcome: string;
  revealThreshold: number;
  identity: string;
  settingsVersion: string;
  liveConfig: SignalCardResolvedLiveConfig;
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
  const [briefing, agentSettings] = await Promise.all([
    fetchSignalCardBriefing(input.name),
    fetchSignalCardAgentSettings(),
  ]);
  const systemInstruction = buildThirdMarkSystemInstruction(input.name, briefing, agentSettings);
  const resolvedIdentity = resolveSignalCardIdentity(input.name, agentSettings ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS);
  const liveConfig = resolveSignalCardLiveConfig(agentSettings ?? DEFAULT_SIGNAL_CARD_AGENT_SETTINGS);
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
                voiceName: liveConfig.voiceName,
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
    identity: resolvedIdentity.identity,
    settingsVersion: agentSettings?.promptVersion ?? "signal-card-live-v1",
    liveConfig,
  };
}

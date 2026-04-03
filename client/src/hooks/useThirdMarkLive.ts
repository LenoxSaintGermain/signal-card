import {
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  ThinkingLevel,
  type Session,
} from "@google/genai";
import {
  THIRD_MARK_LIVE_CONFIG,
  THIRD_MARK_LIVE_MODEL,
} from "@shared/thirdMark";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ThirdMarkMessageRole = "guide" | "user" | "model";

export interface ThirdMarkMessage {
  id: string;
  role: ThirdMarkMessageRole;
  text: string;
  status: "complete" | "streaming";
}

export type ThirdMarkConnectionState =
  | "idle"
  | "booting"
  | "listening"
  | "connected"
  | "replying"
  | "error";

export type ThirdMarkVoiceState =
  | "checking"
  | "ready"
  | "recording"
  | "unsupported"
  | "denied";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeTranscript(previous: string, incoming: string) {
  const next = incoming.trim();
  if (!next) return previous;
  if (!previous) return next;
  if (next.startsWith(previous)) return next;
  if (previous.startsWith(next)) return previous;
  return `${previous} ${next}`.trim();
}

function getAudioContextCtor() {
  if (typeof window === "undefined") return null;
  return (
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ||
    null
  );
}

function float32To16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] ?? 0));
    output[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.byteLength; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function pcm16ToFloat32(buffer: ArrayBuffer) {
  const input = new Int16Array(buffer);
  const output = new Float32Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    output[index] = (input[index] ?? 0) / 0x8000;
  }
  return output;
}

function getSampleRateFromMimeType(mimeType?: string) {
  const match = mimeType?.match(/rate=(\d+)/);
  const parsed = match?.[1] ? Number(match[1]) : NaN;
  return Number.isFinite(parsed) ? parsed : 24_000;
}

type DraftRef = {
  current: string | null;
};

export function useThirdMarkLive({
  enabled,
  participantName,
  sessionKey,
}: {
  enabled: boolean;
  participantName?: string;
  sessionKey: number;
}) {
  const bootstrapSessionMutation = trpc.live.session.useMutation();
  const bootstrapSessionRef = useRef(bootstrapSessionMutation.mutateAsync);

  const sessionRef = useRef<Session | null>(null);
  const statusRef = useRef<ThirdMarkConnectionState>("idle");
  const voiceStateRef = useRef<ThirdMarkVoiceState>("checking");

  const inputDraftIdRef = useRef<string | null>(null);
  const modelDraftIdRef = useRef<string | null>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const inputGainRef = useRef<GainNode | null>(null);
  const inputProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextPlaybackTimeRef = useRef(0);
  const activeOutputSourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const [messages, setMessages] = useState<ThirdMarkMessage[]>([]);
  const [status, setStatus] = useState<ThirdMarkConnectionState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<ThirdMarkVoiceState>("checking");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    bootstrapSessionRef.current = bootstrapSessionMutation.mutateAsync;
  }, [bootstrapSessionMutation.mutateAsync]);

  useEffect(() => {
    const supported =
      typeof navigator !== "undefined" &&
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      !!getAudioContextCtor();

    setVoiceState(supported ? "ready" : "unsupported");
  }, []);

  const upsertDraftMessage = useCallback(
    (
      role: ThirdMarkMessageRole,
      idRef: DraftRef,
      text: string,
      finished: boolean
    ) => {
      const incoming = text.trim();
      if (!incoming && !finished) return;

      if (!idRef.current) {
        const id = createMessageId(role);
        idRef.current = id;
        setMessages(current => [
          ...current,
          {
            id,
            role,
            text: incoming,
            status: finished ? "complete" : "streaming",
          },
        ]);
      } else {
        const id = idRef.current;
        setMessages(current =>
          current.map(message =>
            message.id === id
              ? {
                  ...message,
                  text: mergeTranscript(message.text, incoming),
                  status: finished ? "complete" : "streaming",
                }
              : message
          )
        );
      }

      if (finished) {
        idRef.current = null;
      }
    },
    []
  );

  const flushAudioPlayback = useCallback(() => {
    const audioContext = outputAudioContextRef.current;
    activeOutputSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch {
        // no-op: source may already be stopped
      }
      source.disconnect();
    });
    activeOutputSourcesRef.current.clear();
    if (audioContext) {
      nextPlaybackTimeRef.current = audioContext.currentTime;
    } else {
      nextPlaybackTimeRef.current = 0;
    }
  }, []);

  const stopVoiceCapture = useCallback(
    async (options?: { suppressStatusUpdate?: boolean }) => {
      const wasRecording = voiceStateRef.current === "recording";

      try {
        inputProcessorRef.current?.disconnect();
        inputSourceRef.current?.disconnect();
        inputGainRef.current?.disconnect();
      } catch {
        // audio graph may already be torn down
      }

      inputProcessorRef.current = null;
      inputSourceRef.current = null;
      inputGainRef.current = null;

      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;

      if (sessionRef.current && wasRecording) {
        sessionRef.current.sendRealtimeInput({
          audioStreamEnd: true,
        });
      }

      if (inputAudioContextRef.current) {
        void inputAudioContextRef.current.close().catch(() => undefined);
        inputAudioContextRef.current = null;
      }

      setVoiceState(current =>
        current === "unsupported" || current === "denied" ? current : "ready"
      );

      if (wasRecording && !options?.suppressStatusUpdate) {
        setStatus(current => (current === "error" ? current : "replying"));
      }
    },
    []
  );

  const playOutputAudioChunk = useCallback(
    async (base64Audio: string, mimeType?: string) => {
      const AudioContextCtor = getAudioContextCtor();
      if (!AudioContextCtor) return;

      const audioContext =
        outputAudioContextRef.current ?? new AudioContextCtor();
      outputAudioContextRef.current = audioContext;
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const pcmBuffer = base64ToArrayBuffer(base64Audio);
      const float32 = pcm16ToFloat32(pcmBuffer);
      const sampleRate = getSampleRateFromMimeType(mimeType);
      const audioBuffer = audioContext.createBuffer(1, float32.length, sampleRate);
      audioBuffer.copyToChannel(float32, 0);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      const startTime = Math.max(
        audioContext.currentTime + 0.02,
        nextPlaybackTimeRef.current || audioContext.currentTime
      );
      source.start(startTime);
      nextPlaybackTimeRef.current = startTime + audioBuffer.duration;
      activeOutputSourcesRef.current.add(source);
      source.onended = () => {
        activeOutputSourcesRef.current.delete(source);
        source.disconnect();
      };
    },
    []
  );

  useEffect(() => {
    if (!enabled) {
      void stopVoiceCapture({ suppressStatusUpdate: true });
      flushAudioPlayback();
      setStatus("idle");
      sessionRef.current?.close();
      sessionRef.current = null;
      inputDraftIdRef.current = null;
      modelDraftIdRef.current = null;
      return;
    }

    let cancelled = false;
    setMessages([]);
    setError(null);
    setStatus("booting");
    inputDraftIdRef.current = null;
    modelDraftIdRef.current = null;

    const connect = async () => {
      try {
        const bootstrap = await bootstrapSessionRef.current({
          name: participantName?.trim() || undefined,
        });

        if (cancelled) return;

        const ai = new GoogleGenAI({
          apiKey: bootstrap.token,
          apiVersion: "v1alpha",
        });

        const nextSession = await ai.live.connect({
          model: bootstrap.model || THIRD_MARK_LIVE_MODEL,
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
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_LOW,
                prefixPaddingMs: 20,
                silenceDurationMs: 200,
              },
            },
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.MINIMAL,
            },
          },
          callbacks: {
            onopen: () => {
              setStatus("connected");
              setMessages([
                {
                  id: createMessageId("guide"),
                  role: "guide",
                  text: bootstrap.welcome,
                  status: "complete",
                },
              ]);
            },
            onmessage: event => {
              const content = event.serverContent;
              const parts = (content?.modelTurn?.parts ?? []) as Array<{
                text?: string;
                inlineData?: {
                  data?: string;
                  mimeType?: string;
                };
              }>;

              for (const part of parts) {
                if (part.inlineData?.data) {
                  void playOutputAudioChunk(
                    part.inlineData.data,
                    part.inlineData.mimeType
                  );
                }
              }

              const hasInlineAudio = parts.some(part => Boolean(part.inlineData?.data));

              if (content?.inputTranscription?.text || content?.inputTranscription?.finished) {
                upsertDraftMessage(
                  "user",
                  inputDraftIdRef,
                  content.inputTranscription?.text ?? "",
                  Boolean(content.inputTranscription?.finished)
                );
                setStatus(content.inputTranscription?.finished ? "replying" : "listening");
              }

              if (content?.outputTranscription?.text || content?.outputTranscription?.finished) {
                upsertDraftMessage(
                  "model",
                  modelDraftIdRef,
                  content.outputTranscription?.text ?? "",
                  Boolean(content.outputTranscription?.finished)
                );
              } else {
                for (const part of parts) {
                  if (hasInlineAudio) break;
                  if (part.text?.trim()) {
                    upsertDraftMessage("model", modelDraftIdRef, part.text, false);
                  }
                }
              }

              if (content?.interrupted) {
                flushAudioPlayback();
                modelDraftIdRef.current = null;
                setStatus(voiceStateRef.current === "recording" ? "listening" : "connected");
              }

              if (content?.turnComplete) {
                modelDraftIdRef.current = null;
                setStatus(voiceStateRef.current === "recording" ? "listening" : "connected");
              }
            },
            onerror: event => {
              console.error("[ThirdMarkLive] socket error", event.error);
              setError("The line broke for a moment. Start the session again.");
              setStatus("error");
            },
            onclose: () => {
              flushAudioPlayback();
              if (!cancelled && statusRef.current !== "error") {
                setStatus("idle");
              }
            },
          },
        });

        if (cancelled) {
          nextSession.close();
          return;
        }

        sessionRef.current = nextSession;
      } catch (cause) {
        console.error("[ThirdMarkLive] failed to bootstrap session", cause);
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to open the live session."
          );
          setStatus("error");
        }
      }
    };

    void connect();

    return () => {
      cancelled = true;
      flushAudioPlayback();
      void stopVoiceCapture({ suppressStatusUpdate: true });
      sessionRef.current?.close();
      sessionRef.current = null;
      inputDraftIdRef.current = null;
      modelDraftIdRef.current = null;
    };
  }, [
    enabled,
    flushAudioPlayback,
    participantName,
    playOutputAudioChunk,
    sessionKey,
    stopVoiceCapture,
    upsertDraftMessage,
  ]);

  const sendMessage = useCallback(
    (text: string) => {
      const normalized = text.trim();
      if (!normalized || !sessionRef.current) return false;

      flushAudioPlayback();
      void stopVoiceCapture({ suppressStatusUpdate: true });

      setMessages(current => [
        ...current,
        {
          id: createMessageId("user"),
          role: "user",
          text: normalized,
          status: "complete",
        },
      ]);

      setStatus("replying");
      sessionRef.current.sendRealtimeInput({
        text: normalized,
      });
      return true;
    },
    [flushAudioPlayback, stopVoiceCapture]
  );

  const startVoiceCapture = useCallback(async () => {
    if (!sessionRef.current || voiceStateRef.current === "unsupported") return false;

    try {
      flushAudioPlayback();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContextCtor = getAudioContextCtor();
      if (!AudioContextCtor) {
        setVoiceState("unsupported");
        return false;
      }

      const inputContext = new AudioContextCtor({ sampleRate: 16_000 });
      await inputContext.resume();

      const source = inputContext.createMediaStreamSource(stream);
      const processor = inputContext.createScriptProcessor(2048, 1, 1);
      const gain = inputContext.createGain();
      gain.gain.value = 0;

      source.connect(processor);
      processor.connect(gain);
      gain.connect(inputContext.destination);

      processor.onaudioprocess = event => {
        if (!sessionRef.current) return;
        const input = event.inputBuffer.getChannelData(0);
        const pcm16 = float32To16BitPCM(input);
        const audioData = arrayBufferToBase64(pcm16.buffer);
        sessionRef.current.sendRealtimeInput({
          audio: {
            data: audioData,
            mimeType: `audio/pcm;rate=${Math.round(inputContext.sampleRate)}`,
          } as Parameters<Session["sendRealtimeInput"]>[0]["audio"],
        });
      };

      inputAudioContextRef.current = inputContext;
      inputSourceRef.current = source;
      inputProcessorRef.current = processor;
      inputGainRef.current = gain;
      mediaStreamRef.current = stream;

      setVoiceState("recording");
      setStatus("listening");
      setError(null);
      return true;
    } catch (cause) {
      console.error("[ThirdMarkLive] voice capture unavailable", cause);
      setVoiceState("denied");
      setError("Mic access was blocked. You can keep going by typing.");
      setStatus("connected");
      return false;
    }
  }, [flushAudioPlayback]);

  const userTurns = useMemo(
    () => messages.filter(message => message.role === "user").length,
    [messages]
  );

  return {
    messages,
    status,
    error,
    sendMessage,
    startVoiceCapture,
    stopVoiceCapture,
    voiceState,
    userTurns,
  };
}

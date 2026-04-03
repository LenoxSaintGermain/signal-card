import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import {
  THIRD_SIGNAL_VOID_CATALOG_ID,
  ThirdSignalVoidRenderer,
  type ThirdSignalVoidAction,
  type ThirdSignalVoidSurface,
} from "@/components/third-mark/ThirdSignalVoidRenderer";
import { CinematicWordReveal } from "@/components/third-mark/CinematicWordReveal";
import { ScrollyTelling } from "@/components/ScrollyTelling";
import {
  type ThirdMarkConnectionState,
  type ThirdMarkMessage,
  useThirdMarkLive,
} from "@/hooks/useThirdMarkLive";
import { trpc } from "@/lib/trpc";
import {
  THIRD_MARK_LIVE_REVEAL_THRESHOLD,
  THIRD_MARK_STARTER_PROMPTS,
} from "@shared/thirdMark";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = "arrive" | "live" | "processing" | "immersive";

const VOID_NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";
const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function buildTranscript(messages: ThirdMarkMessage[]) {
  return messages
    .filter(message => message.role !== "guide")
    .map(message => `${message.role === "user" ? "User" : "Signal Card"}: ${message.text}`)
    .join("\n");
}

function trimText(text: string, limit = 88) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trim()}...`;
}

function getStatusWhisper(status: ThirdMarkConnectionState, voiceState: string) {
  if (status === "booting") return "The line is opening.";
  if (status === "listening") return "It is listening.";
  if (status === "replying") return "Something is forming in the dark.";
  if (status === "error") return "The line slipped. Stay with it.";
  if (voiceState === "denied") return "The mic is blocked. The void will take text instead.";
  if (voiceState === "unsupported") return "This room does not support voice. Type into the dark instead.";
  return "Speak first. Type only if you must.";
}

function getVoidStageState(
  status: ThirdMarkConnectionState,
  readyToReveal: boolean
): "idle" | "wake" | "listening" | "answering" | "reveal" {
  if (readyToReveal) return "reveal";
  if (status === "booting") return "wake";
  if (status === "listening") return "listening";
  if (status === "replying") return "answering";
  return "idle";
}

function getMarkMode(
  status: ThirdMarkConnectionState,
  readyToReveal: boolean
): "idle" | "wake" | "listen" | "answer" | "reveal" {
  if (readyToReveal) return "reveal";
  if (status === "booting") return "wake";
  if (status === "listening") return "listen";
  if (status === "replying") return "answer";
  return "idle";
}

function getHaloIntensity(
  status: ThirdMarkConnectionState,
  voiceState: string,
  readyToReveal: boolean
) {
  if (readyToReveal) return 0.9;
  if (status === "listening") return 0.84;
  if (status === "replying") return 0.58;
  if (status === "booting") return 0.42;
  if (status === "error") return 0.22;
  if (voiceState === "recording") return 0.74;
  return 0.18;
}

export default function ThirdMarkHome() {
  const [stage, setStage] = useState<Stage>("arrive");
  const [participantName, setParticipantName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [composerValue, setComposerValue] = useState("");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [storyboardData, setStoryboardData] = useState<any>(null);
  const [movieSlug, setMovieSlug] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const revealContextRef = useRef<{ transcript: string; messages: ThirdMarkMessage[] } | null>(null);
  const voiceBootstrapAttemptedRef = useRef(false);

  const {
    messages,
    status,
    error,
    sendMessage,
    startVoiceCapture,
    stopVoiceCapture,
    voiceState,
    userTurns,
  } = useThirdMarkLive({
    enabled: stage === "live",
    participantName,
    sessionKey,
  });

  const { data: savedMovie } = trpc.cinema.get.useQuery(
    { slug: movieSlug ?? "" },
    {
      enabled: !!movieSlug,
      refetchInterval: query => {
        const data = query.state.data;
        const scenes = (data?.storyboard as { storyboard?: Array<{ video_url?: string }> } | undefined)?.storyboard;
        if (!Array.isArray(scenes)) return 5000;
        return scenes.some((scene: { video_url?: string }) => !scene.video_url)
          ? 5000
          : false;
      },
    }
  );

  const savedStoryboard =
    (savedMovie?.storyboard as { storyboard?: Array<{ video_url?: string }> } | undefined) ??
    undefined;

  useEffect(() => {
    if (stage !== "live") {
      voiceBootstrapAttemptedRef.current = false;
      return;
    }

    if (voiceBootstrapAttemptedRef.current) return;
    if (status !== "connected") return;
    if (voiceState !== "ready") return;

    voiceBootstrapAttemptedRef.current = true;
    void startVoiceCapture();
  }, [stage, startVoiceCapture, status, voiceState]);

  useEffect(() => {
    if (voiceState === "unsupported" || voiceState === "denied") {
      setShowTextFallback(true);
    }
  }, [voiceState]);

  useEffect(() => {
    if (savedStoryboard) {
      setStoryboardData(savedStoryboard);
    }
  }, [savedStoryboard]);

  const saveToCinema = trpc.cinema.save.useMutation();
  const generateInsight = trpc.insights.generate.useMutation({
    onSuccess: async data => {
      const revealContext = revealContextRef.current;
      const payload = {
        ...data,
        raw_input: revealContext?.transcript ?? "",
        conversation: revealContext?.messages ?? [],
      };

      setStoryboardData(payload);
      setStage("immersive");

      try {
        const saveResult = await saveToCinema.mutateAsync({
          title: data.title,
          storyboard: payload,
          finalCta: data.final_cta,
          role: "Leader",
          industry: "General",
        });
        setMovieSlug(saveResult.slug);
      } catch (cause) {
        console.error("[ThirdMarkHome] failed to save cinema asset", cause);
      }
    },
    onError: cause => {
      console.error("[ThirdMarkHome] reveal failed", cause);
      setStage("live");
    },
  });

  const readyToReveal = userTurns >= THIRD_MARK_LIVE_REVEAL_THRESHOLD;
  const starterPrompts = useMemo(() => [...THIRD_MARK_STARTER_PROMPTS], []);
  const whisperMessage = useMemo(() => {
    const modelMessage = [...messages].reverse().find(message => message.role === "model");
    if (modelMessage) return modelMessage;
    return [...messages].reverse().find(message => message.role === "guide") ?? null;
  }, [messages]);
  const lastUserMessage = useMemo(
    () => [...messages].reverse().find(message => message.role === "user") ?? null,
    [messages]
  );
  const residueMessages = useMemo(() => {
    const currentWhisperId = whisperMessage?.id;
    return messages
      .filter(message => message.role !== "guide" && message.id !== currentWhisperId)
      .slice(-6);
  }, [messages, whisperMessage?.id]);

  const handleBegin = () => {
    setParticipantName(draftName.trim());
    setStage("live");
  };

  const handleSend = () => {
    if (!composerValue.trim()) return;
    const sent = sendMessage(composerValue);
    if (sent) {
      setComposerValue("");
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    const sent = sendMessage(prompt);
    if (!sent) {
      setComposerValue(prompt);
      setShowTextFallback(true);
    }
  };

  const handleReveal = () => {
    const transcript = buildTranscript(messages);
    revealContextRef.current = {
      transcript,
      messages,
    };

    setStage("processing");
    generateInsight.mutate({
      signalId: "third-mark-live",
      signalTitle: "The Third Mark Conversation",
      signalTruth: "What the room has been trying to say.",
      role: "Leader",
      industry: "General",
      rawInput: transcript,
    });
  };

  const handleRestart = () => {
    revealContextRef.current = null;
    voiceBootstrapAttemptedRef.current = false;
    setMovieSlug(null);
    setStoryboardData(null);
    setComposerValue("");
    setShowTextFallback(false);
    setSessionKey(current => current + 1);
    setStage("arrive");
  };

  const handleVoiceToggle = () => {
    if (voiceState === "recording") {
      void stopVoiceCapture();
      return;
    }
    void startVoiceCapture();
  };

  const centerWhisper =
    whisperMessage?.text?.trim() ||
    (stage === "live"
      ? getStatusWhisper(status, voiceState)
      : "Lenox opened a line. Say something true.");

  const liveSurface = useMemo<ThirdSignalVoidSurface>(() => {
    const stageState = getVoidStageState(status, readyToReveal);
    const children = ["halo", "mark", "whisper"];
    const components: ThirdSignalVoidSurface["components"] = [
      {
        id: "stage",
        component: "VoidStage",
        state: stageState,
        children,
      },
      {
        id: "halo",
        component: "SignalHalo",
        intensity: getHaloIntensity(status, voiceState, readyToReveal),
        pulseMode:
          status === "error"
            ? "error"
            : stageState === "answering"
              ? "answer"
              : stageState,
      },
      {
        id: "mark",
        component: "MarkCore",
        mode: getMarkMode(status, readyToReveal),
        size: readyToReveal ? "xl" : "lg",
        audioReactive: true,
      },
      {
        id: "whisper",
        component: "WhisperText",
        text: centerWhisper,
        mode: whisperMessage?.status === "streaming" ? "fragment" : whisperMessage ? "resolved" : "echo",
        placement: "lower-third",
        speaker: whisperMessage?.role ?? "guide",
        messageId: whisperMessage?.id,
        streaming: whisperMessage?.status === "streaming",
        echo:
          lastUserMessage && lastUserMessage.id !== whisperMessage?.id
            ? trimText(lastUserMessage.text)
            : undefined,
      },
    ];

    if (residueMessages.length > 0) {
      children.push("residue");
      components.push({
        id: "residue",
        component: "ResidueTrail",
        items: residueMessages.map(message => ({
          id: message.id,
          text: message.text,
          role: message.role === "user" ? "user" : "model",
        })),
        maxVisible: 6,
      });
    }

    if (readyToReveal) {
      children.push("portal");
      components.push({
        id: "portal",
        component: "RevealPortal",
        armed: true,
        title: "Summon The Reveal",
        action: { name: "summon_reveal" },
        disabled: status === "replying" || generateInsight.isPending,
      });
    } else {
      children.push("hold");
      components.push({
        id: "hold",
        component: "HoldToSpeakGlyph",
        label:
          voiceState === "recording" ? "The line is listening" : "Break The Silence",
        action: voiceState === "recording" ? { name: "stop_mic" } : { name: "open_mic" },
        active: voiceState === "recording",
        disabled:
          voiceState === "unsupported" || status === "booting" || generateInsight.isPending,
        secondaryLabel: showTextFallback ? undefined : "Type Instead",
        secondaryAction: showTextFallback ? undefined : { name: "switch_to_text" },
      });
    }

    if (messages.length <= 1) {
      children.push("sigils");
      components.push({
        id: "sigils",
        component: "ChoiceSigil",
        choices: starterPrompts.map(prompt => ({
          id: prompt,
          label: prompt,
          action: { name: "choose_route", value: prompt },
        })),
      });
    }

    if (error || voiceState === "denied" || voiceState === "unsupported") {
      children.push("interruption");
      components.push({
        id: "interruption",
        component: "InterruptionHint",
        text: error ?? getStatusWhisper(status, voiceState),
        tone: "warning",
        actionLabel: showTextFallback ? undefined : "Use Text",
        action: showTextFallback ? undefined : { name: "switch_to_text" },
      });
    }

    return {
      surfaceId: "void-main",
      catalogId: THIRD_SIGNAL_VOID_CATALOG_ID,
      components,
    };
  }, [
    centerWhisper,
    error,
    generateInsight.isPending,
    lastUserMessage,
    messages.length,
    readyToReveal,
    residueMessages,
    showTextFallback,
    starterPrompts,
    status,
    voiceState,
    whisperMessage,
  ]);

  const handleVoidAction = (action: ThirdSignalVoidAction) => {
    switch (action.name) {
      case "open_mic":
      case "stop_mic":
        handleVoiceToggle();
        break;
      case "switch_to_text":
        setShowTextFallback(true);
        break;
      case "choose_route":
        handleStarterPrompt(action.value);
        break;
      case "summon_reveal":
        handleReveal();
        break;
      case "dismiss_apparition":
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[#010204] text-[#E7F7FF]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(54,130,180,0.22),transparent_18%),radial-gradient(circle_at_50%_60%,rgba(19,52,73,0.28),transparent_36%),linear-gradient(180deg,#020304_0%,#000000_42%,#020409_100%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.045] mix-blend-soft-light"
        animate={{ opacity: [0.032, 0.05, 0.036] }}
        transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{ backgroundImage: `url("${VOID_NOISE_URL}")`, backgroundSize: "220px 220px" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.06] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0) 1px)",
          backgroundSize: "100% 4px",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        animate={{ opacity: [0.45, 0.68, 0.5] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(125, 237, 255, 0.08), transparent 0), radial-gradient(circle at center, rgba(125, 237, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 4px 4px",
          mixBlendMode: "screen",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.78)_100%)]" />

      <AnimatePresence mode="wait">
        {stage === "arrive" && (
          <motion.main
            key="arrive"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
            className="relative flex min-h-[100dvh] items-center justify-center px-6 py-12"
          >
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.24, 0.42, 0.24] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/12" />
              <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/10" />
              <div className="absolute left-1/2 top-1/2 h-[14rem] w-[14rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C3E7FF]/10" />
            </motion.div>

            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.76, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mb-6 text-[10px] uppercase tracking-[0.55em] text-[#8FDFFF]/72"
              >
                Private Line / Lenox / Third Signal
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: CINEMATIC_EASE }}
                className="relative mb-10 flex h-56 w-56 items-center justify-center"
              >
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#7DE0FF]/14"
                  animate={{
                    scale: [0.94, 1.08, 0.94],
                    opacity: [0.18, 0.56, 0.18],
                    boxShadow: [
                      "0 0 0 rgba(94,234,212,0)",
                      "0 0 42px rgba(94,234,212,0.12)",
                      "0 0 0 rgba(94,234,212,0)",
                    ],
                  }}
                  transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-[10%] rounded-full border border-[#7DE0FF]/10"
                  animate={{ scale: [1.02, 0.97, 1.02], opacity: [0.18, 0.4, 0.18] }}
                  transition={{ duration: 4.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
                <ThirdMarkGlyph expression="arrive" size={168} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, ease: CINEMATIC_EASE }}
                className="max-w-[46rem] text-4xl leading-[1.04] text-[#EAF9FF] sm:text-5xl md:text-6xl"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                <CinematicWordReveal
                  text="Do not expect a website. Expect an answer."
                  className="text-balance"
                  wordClassName="mr-[0.22em] inline-block align-baseline"
                  initialDelay={0.12}
                  stagger={0.08}
                  duration={0.26}
                  blur={6}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.72, y: 0 }}
                transition={{ delay: 0.28, ease: CINEMATIC_EASE }}
                className="mt-6 max-w-2xl text-base leading-8 text-[#C7DCEB] sm:text-lg"
              >
                <CinematicWordReveal
                  text="Signal Card stays quiet until you give it something real. Speak if the room allows it. Type only if you must. Everything else should emerge from the dark."
                  className="text-balance"
                  wordClassName="mr-[0.24em] inline-block align-baseline"
                  initialDelay={0.34}
                  stagger={0.028}
                  duration={0.22}
                  blur={4}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46, ease: CINEMATIC_EASE }}
                className="mt-12 flex w-full max-w-xl flex-col items-center gap-4"
              >
                <label className="w-full text-left text-[11px] uppercase tracking-[0.4em] text-[#9CC3D9]/48">
                  Optional name, if you want the line to know it
                </label>
                <input
                  value={draftName}
                  onChange={event => setDraftName(event.target.value)}
                  placeholder="Lenox"
                  className="h-14 w-full rounded-full border border-white/10 bg-white/[0.03] px-6 text-center text-base text-[#EAF9FF] outline-none backdrop-blur-sm transition placeholder:text-[#92A8B7]/40 focus:border-[#7DE0FF]/40 focus:shadow-[0_0_0_1px_rgba(94,234,212,0.3),0_0_28px_rgba(94,234,212,0.08)]"
                />
                <button
                  type="button"
                  onClick={handleBegin}
                  className="group mt-4 inline-flex items-center gap-3 rounded-full border border-[#7DE0FF]/18 bg-[#7DE0FF]/10 px-7 py-3 text-[11px] uppercase tracking-[0.45em] text-[#D7F6FF] transition hover:border-[#7DE0FF]/38 hover:bg-[#7DE0FF]/14"
                >
                  Open The Line
                  <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </motion.div>
            </div>
          </motion.main>
        )}

        {stage === "live" && (
          <motion.main
            key="live"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.2, ease: CINEMATIC_EASE }}
            className="relative min-h-[100dvh]"
          >
            <div className="pointer-events-none absolute left-6 top-6 z-20 max-w-[min(72vw,24rem)] px-1">
              <p className="text-[10px] uppercase tracking-[0.5em] text-[#87CFE8]/64">
                Signal Card / Private Line
              </p>
              <p className="mt-3 text-sm leading-7 text-[#9FC6D8]/70">
                {participantName ? `${participantName}, the line is yours.` : "The line is open."} {getStatusWhisper(status, voiceState)}
              </p>
            </div>

            <div className="absolute right-6 top-6 z-30 flex items-center gap-2">
              {showTextFallback && (
                <button
                  type="button"
                  onClick={() => setShowTextFallback(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-[#B6D9E8]/70 transition hover:border-[#7DE0FF]/24 hover:text-[#EAF9FF]"
                >
                  <X className="h-3.5 w-3.5" />
                  Hide Text
                </button>
              )}
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-[#B6D9E8]/70 transition hover:border-[#7DE0FF]/24 hover:text-[#EAF9FF]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <ThirdSignalVoidRenderer surface={liveSurface} onAction={handleVoidAction} />

            <AnimatePresence>
              {showTextFallback && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-x-0 bottom-5 z-40 flex justify-center px-4"
                >
                  <div className="w-[min(92vw,48rem)] rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <p className="text-[10px] uppercase tracking-[0.42em] text-[#8BCEE5]/58">
                        Typed residue
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.36em] text-[#7EAEC2]/46">
                        Cmd/Ctrl + Enter
                      </p>
                    </div>
                    <textarea
                      value={composerValue}
                      onChange={event => setComposerValue(event.target.value)}
                      onKeyDown={event => {
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                          event.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type into the dark."
                      className="min-h-[116px] w-full resize-none rounded-[1.4rem] border border-white/8 bg-black/24 px-5 py-4 text-base leading-7 text-[#EAF9FF] outline-none transition placeholder:text-[#88A6B8]/32 focus:border-[#7DE0FF]/26 focus:shadow-[0_0_0_1px_rgba(94,234,212,0.3),0_0_24px_rgba(94,234,212,0.08)]"
                    />
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-sm text-[#8EADC0]/54">
                        Text is the quiet fallback. Keep it spare.
                      </p>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={!composerValue.trim() || generateInsight.isPending}
                        className="inline-flex items-center gap-3 rounded-full border border-[#7DE0FF]/18 bg-[#7DE0FF]/10 px-5 py-2.5 text-[11px] uppercase tracking-[0.4em] text-[#EAF9FF] transition hover:border-[#7DE0FF]/34 hover:bg-[#7DE0FF]/14 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Send
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.main>
        )}

        {stage === "processing" && (
          <motion.main
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="relative flex min-h-[100dvh] items-center justify-center px-6"
          >
            <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/10" />
            <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/12" />
            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="mb-8"
              >
                <ThirdMarkGlyph expression="gift" size={132} />
              </motion.div>
              <p className="text-[10px] uppercase tracking-[0.52em] text-[#8FDFFF]/56">
                Distilling The Residue
              </p>
              <p
                className="mt-6 text-4xl leading-[1.08] text-[#EAF9FF] sm:text-5xl"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                The line is giving shape to what just surfaced.
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#A8C6D5]/66">
                Fragments become scenes. Pressure becomes image. What mattered is
                being pulled forward.
              </p>
            </div>
          </motion.main>
        )}

        {stage === "immersive" && storyboardData && (
          <motion.div
            key="immersive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 min-h-screen w-full bg-[#04040A]"
          >
            <ScrollyTelling
              storyboard={storyboardData.storyboard}
              finalCta={storyboardData.final_cta}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

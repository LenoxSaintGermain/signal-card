import { SignalCardTerminal, type SignalTerminalEntry, type SignalTerminalPrompt } from "@/components/third-mark/SignalCardTerminal";
import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { ScrollyTelling } from "@/components/ScrollyTelling";
import {
  type ThirdMarkConnectionState,
  type ThirdMarkMessage,
  useThirdMarkLive,
} from "@/hooks/useThirdMarkLive";
import { trpc } from "@/lib/trpc";
import { THIRD_MARK_LIVE_REVEAL_THRESHOLD } from "@shared/thirdMark";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Stage = "arrive" | "live" | "processing" | "immersive";
type FlowState = "onboarding" | "active";
type PromptState =
  | { type: "name" }
  | { type: "classify" }
  | { type: "input"; placeholder: string }
  | null;

type LocalLine = {
  id: string;
  speaker: "ghost" | "visitor";
  text: string;
};

const CLASSIFY_OPTIONS = [
  { id: "client", label: "Client", sub: "I have work." },
  { id: "partner", label: "Partner", sub: "There is alignment." },
  { id: "investor", label: "Investor", sub: "Give me the clean version." },
  { id: "operator", label: "Operator", sub: "I need clarity fast." },
  { id: "other", label: "Other", sub: "Something else." },
] as const;

const INPUT_PLACEHOLDERS: Record<(typeof CLASSIFY_OPTIONS)[number]["id"], string> = {
  client: "Tell it what is broken.",
  partner: "Say where the overlap is.",
  investor: "Ask for the version that matters.",
  operator: "Say what needs to move now.",
  other: "Type into the dark.",
};

const CLASSIFY_RESPONSES: Record<(typeof CLASSIFY_OPTIONS)[number]["id"], string> = {
  client: "Tell me the problem. I'll show you what already exists.",
  partner: "Tell me where the alignment is from your side.",
  investor: "Fine. I'll keep it clean.",
  operator: "Say what the room is resisting.",
  other: "Then say it plainly.",
};

const SURFACE_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildTranscript(messages: ThirdMarkMessage[]) {
  return messages
    .filter(message => message.role !== "guide")
    .map(message => `${message.role === "user" ? "User" : "Signal Card"}: ${message.text}`)
    .join("\n");
}

function getStatusLine(status: ThirdMarkConnectionState, voiceState: string) {
  if (status === "booting") return "The line is waking up.";
  if (status === "listening") return "It is listening.";
  if (status === "replying") return "It is answering.";
  if (status === "error") return "The line slipped. Stay with it.";
  if (voiceState === "denied") return "The mic is blocked. Text will do.";
  if (voiceState === "unsupported") return "This room cannot carry voice.";
  return "Say something real.";
}

function getOrbState(
  status: ThirdMarkConnectionState,
  voiceState: string,
  hasTypingGhost: boolean
): "idle" | "speaking" | "listening" | "processing" {
  if (voiceState === "recording" || status === "listening") return "listening";
  if (hasTypingGhost || status === "replying") return "speaking";
  if (status === "booting") return "processing";
  return "idle";
}

export default function ThirdMarkHome() {
  const [stage, setStage] = useState<Stage>("arrive");
  const [flowState, setFlowState] = useState<FlowState>("onboarding");
  const [nameDraft, setNameDraft] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [composerValue, setComposerValue] = useState("");
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [storyboardData, setStoryboardData] = useState<any>(null);
  const [movieSlug, setMovieSlug] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [promptState, setPromptState] = useState<PromptState>(null);
  const [localLines, setLocalLines] = useState<LocalLine[]>([]);
  const [typingGhost, setTypingGhost] = useState<LocalLine | null>(null);

  const revealContextRef = useRef<{ transcript: string; messages: ThirdMarkMessage[] } | null>(null);
  const ghostAfterRef = useRef<(() => void) | null>(null);
  const deferredVoiceStartRef = useRef(false);

  const {
    messages,
    status,
    error,
    sendMessage,
    primeAudioOutput,
    startVoiceCapture,
    stopVoiceCapture,
    voiceState,
    userTurns,
  } = useThirdMarkLive({
    enabled: stage === "live",
    participantName: undefined,
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
    if (savedStoryboard) {
      setStoryboardData(savedStoryboard);
    }
  }, [savedStoryboard]);

  useEffect(() => {
    if (stage !== "live") return;
    if (!deferredVoiceStartRef.current || status !== "connected") return;
    deferredVoiceStartRef.current = false;
    void startVoiceCapture();
  }, [stage, startVoiceCapture, status]);

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

  const speakGhost = useCallback((text: string, after?: () => void) => {
    ghostAfterRef.current = after ?? null;
    setTypingGhost({
      id: createLocalId("ghost"),
      speaker: "ghost",
      text,
    });
  }, []);

  const pushVisitorLine = useCallback((text: string) => {
    setLocalLines(current => [
      ...current,
      {
        id: createLocalId("visitor"),
        speaker: "visitor",
        text,
      },
    ]);
  }, []);

  const resetExperience = useCallback(() => {
    ghostAfterRef.current = null;
    deferredVoiceStartRef.current = false;
    revealContextRef.current = null;
    setMovieSlug(null);
    setStoryboardData(null);
    setFlowState("onboarding");
    setNameDraft("");
    setVisitorName("");
    setComposerValue("");
    setShowTextFallback(false);
    setPromptState(null);
    setLocalLines([]);
    setTypingGhost(null);
    setSessionKey(current => current + 1);
    setStage("arrive");
  }, []);

  const startConversation = useCallback(() => {
    void primeAudioOutput();
    ghostAfterRef.current = null;
    deferredVoiceStartRef.current = false;
    setFlowState("onboarding");
    setShowTextFallback(false);
    setPromptState(null);
    setLocalLines([]);
    setTypingGhost(null);
    setNameDraft("");
    setVisitorName("");
    setComposerValue("");
    setStage("live");

    window.setTimeout(() => {
      speakGhost("Lenox's line is open.", () => {
        window.setTimeout(() => {
          speakGhost("What should I call you?", () => {
            setPromptState({ type: "name" });
          });
        }, 180);
      });
    }, 120);
  }, [primeAudioOutput, speakGhost]);

  const handleTypingGhostDone = useCallback(
    (lineId: string) => {
      setTypingGhost(current => {
        if (!current || current.id !== lineId) return current;
        setLocalLines(lines => [...lines, current]);
        return null;
      });

      const after = ghostAfterRef.current;
      ghostAfterRef.current = null;
      if (after) {
        window.setTimeout(after, 150);
      }
    },
    []
  );

  const handleNameSubmit = useCallback(() => {
    const normalized = nameDraft.trim();
    const line = normalized || "No name.";

    pushVisitorLine(line);
    setVisitorName(normalized);
    setNameDraft("");
    setPromptState(null);

    speakGhost(normalized ? `${normalized}.` : "No name, then.", () => {
      window.setTimeout(() => {
        speakGhost("What brought you here?", () => {
          setPromptState({ type: "classify" });
        });
      }, 120);
    });
  }, [nameDraft, pushVisitorLine, speakGhost]);

  const handleChooseRoute = useCallback(
    (routeId: (typeof CLASSIFY_OPTIONS)[number]["id"]) => {
      const choice = CLASSIFY_OPTIONS.find(option => option.id === routeId);
      if (!choice) return;

      pushVisitorLine(choice.label);
      setPromptState(null);
      speakGhost(CLASSIFY_RESPONSES[routeId], () => {
        setPromptState({
          type: "input",
          placeholder: INPUT_PLACEHOLDERS[routeId],
        });
      });
    },
    [pushVisitorLine, speakGhost]
  );

  const handleTextSubmit = useCallback(() => {
    const normalized = composerValue.trim();
    if (!normalized) return;

    void primeAudioOutput();
    setFlowState("active");
    setPromptState(null);
    setShowTextFallback(false);

    const sent = sendMessage(normalized);
    if (sent) {
      setComposerValue("");
      return;
    }

    setShowTextFallback(true);
    setPromptState({
      type: "input",
      placeholder: "Type into the dark.",
    });
  }, [composerValue, primeAudioOutput, sendMessage]);

  const handleOpenTextFallback = useCallback(() => {
    setFlowState("active");
    setPromptState(null);
    setShowTextFallback(true);
  }, []);

  const handleVoiceToggle = useCallback(() => {
    void primeAudioOutput();

    if (voiceState === "recording") {
      void stopVoiceCapture();
      return;
    }

    setFlowState("active");
    setPromptState(null);
    setShowTextFallback(false);

    if (status === "connected") {
      void startVoiceCapture();
      return;
    }

    deferredVoiceStartRef.current = true;
    if (status === "idle" || status === "error") {
      setSessionKey(current => current + 1);
    }
  }, [primeAudioOutput, startVoiceCapture, status, stopVoiceCapture, voiceState]);

  const liveEntries = useMemo<SignalTerminalEntry[]>(() => {
    if (flowState !== "active") return [];

    return messages
      .filter(message => message.role !== "guide")
      .map(message => ({
        id: message.id,
        speaker: message.role === "user" ? "visitor" : "ghost",
        text: message.text,
        status: message.status,
      }));
  }, [flowState, messages]);

  const terminalEntries = useMemo<SignalTerminalEntry[]>(() => {
    const local = localLines.map(line => ({
      id: line.id,
      speaker: line.speaker,
      text: line.text,
      status: "complete" as const,
    }));

    return [...local, ...liveEntries];
  }, [liveEntries, localLines]);

  const transcriptMessages = useMemo<ThirdMarkMessage[]>(() => {
    const localMessageLines = localLines.map<ThirdMarkMessage>(line => ({
      id: line.id,
      role: line.speaker === "visitor" ? "user" : "guide",
      text: line.text,
      status: "complete",
    }));

    return [...localMessageLines, ...messages];
  }, [localLines, messages]);

  const readyToReveal = flowState === "active" && userTurns >= THIRD_MARK_LIVE_REVEAL_THRESHOLD;

  const handleReveal = () => {
    const transcript = buildTranscript(transcriptMessages);
    revealContextRef.current = {
      transcript,
      messages: transcriptMessages,
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

  const activePrompt = useMemo<SignalTerminalPrompt | null>(() => {
    if (promptState?.type === "name") {
      return {
        type: "name",
        value: nameDraft,
        placeholder: "If you want the line to know it.",
        submitLabel: "Continue",
        onChange: setNameDraft,
        onSubmit: handleNameSubmit,
      };
    }

    if (promptState?.type === "classify") {
      return {
        type: "choices",
        choices: CLASSIFY_OPTIONS.map(option => ({ ...option })),
        onChoose: id => handleChooseRoute(id as (typeof CLASSIFY_OPTIONS)[number]["id"]),
      };
    }

    if (promptState?.type === "input") {
      return {
        type: "input",
        value: composerValue,
        placeholder: promptState.placeholder,
        submitLabel: "Send",
        onChange: setComposerValue,
        onSubmit: handleTextSubmit,
        submitDisabled: !composerValue.trim() || generateInsight.isPending,
      };
    }

    return null;
  }, [composerValue, generateInsight.isPending, handleChooseRoute, handleNameSubmit, handleTextSubmit, nameDraft, promptState]);

  const orbState = getOrbState(status, voiceState, Boolean(typingGhost));

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-black text-[#E7F7FF]">
      {(voiceState === "unsupported" || voiceState === "denied") && !promptState && flowState === "active" && !showTextFallback ? (
        <div className="sr-only">Voice is unavailable. Text fallback is open.</div>
      ) : null}

      {stage === "arrive" && (
        <SignalCardTerminal
          stage="arrive"
          orbState="idle"
          entries={[]}
          typingGhost={null}
          activePrompt={null}
          textFallbackOpen={false}
          textFallbackValue=""
          voiceActive={false}
          readyToReveal={false}
          revealPending={false}
          onBegin={startConversation}
          onReset={resetExperience}
          onTypingGhostDone={handleTypingGhostDone}
          onVoiceToggle={handleVoiceToggle}
          onOpenTextFallback={handleOpenTextFallback}
          onTextFallbackChange={setComposerValue}
          onTextFallbackSubmit={handleTextSubmit}
          onReveal={handleReveal}
        />
      )}

      {stage === "live" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: SURFACE_EASE }}
        >
          <SignalCardTerminal
            stage="live"
            orbState={orbState}
            entries={terminalEntries}
            typingGhost={typingGhost}
            activePrompt={activePrompt}
            textFallbackOpen={showTextFallback && !promptState}
            textFallbackValue={composerValue}
            textFallbackDisabled={!composerValue.trim() || generateInsight.isPending}
            statusLine={getStatusLine(status, voiceState)}
            error={error}
            voiceActive={voiceState === "recording"}
            voiceDisabled={status === "booting" || generateInsight.isPending}
            readyToReveal={readyToReveal}
            revealPending={generateInsight.isPending}
            onBegin={startConversation}
            onReset={resetExperience}
            onTypingGhostDone={handleTypingGhostDone}
            onVoiceToggle={handleVoiceToggle}
            onOpenTextFallback={handleOpenTextFallback}
            onTextFallbackChange={setComposerValue}
            onTextFallbackSubmit={handleTextSubmit}
            onReveal={handleReveal}
          />
        </motion.div>
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
              Fragments become scenes. Pressure becomes image. What mattered is being pulled forward.
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
            onRestart={resetExperience}
          />
        </motion.div>
      )}
    </div>
  );
}

import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { ScrollyTelling } from "@/components/ScrollyTelling";
import {
  type ThirdMarkMessage,
  useThirdMarkLive,
} from "@/hooks/useThirdMarkLive";
import { trpc } from "@/lib/trpc";
import {
  THIRD_MARK_LIVE_MODEL,
  THIRD_MARK_LIVE_REVEAL_THRESHOLD,
  THIRD_MARK_STARTER_PROMPTS,
} from "@shared/thirdMark";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Film, Keyboard, Mic, RotateCcw, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

type Stage = "arrive" | "live" | "processing" | "immersive";

function mapStatusToExpression(status: "idle" | "booting" | "listening" | "connected" | "replying" | "error", readyToReveal: boolean) {
  if (readyToReveal) return "gift";
  if (status === "booting") return "think";
  if (status === "listening") return "listen";
  if (status === "replying") return "speak";
  if (status === "connected") return "listen";
  if (status === "error") return "doubt";
  return "arrive";
}

function buildTranscript(messages: ThirdMarkMessage[]) {
  return messages
    .filter(message => message.role !== "guide")
    .map(message => `${message.role === "user" ? "User" : "Signal Card"}: ${message.text}`)
    .join("\n");
}

function formatStatus(status: "idle" | "booting" | "listening" | "connected" | "replying" | "error") {
  if (status === "booting") return "Opening the line";
  if (status === "listening") return "Listening live";
  if (status === "connected") return "Line is open";
  if (status === "replying") return "Signal Card is answering";
  if (status === "error") return "Line interrupted";
  return "Standing by";
}

export default function ThirdMarkHome() {
  const [stage, setStage] = useState<Stage>("arrive");
  const [participantName, setParticipantName] = useState("");
  const [draftName, setDraftName] = useState("");
  const [composerValue, setComposerValue] = useState("");
  const [storyboardData, setStoryboardData] = useState<any>(null);
  const [movieSlug, setMovieSlug] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const revealContextRef = useRef<{ transcript: string; messages: ThirdMarkMessage[] } | null>(null);
  const transcriptListRef = useRef<HTMLDivElement | null>(null);
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
    if (!transcriptListRef.current) return;
    transcriptListRef.current.scrollTop = transcriptListRef.current.scrollHeight;
  }, [messages]);

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
  const canSend = stage === "live" && (status === "connected" || status === "replying");
  const expression = mapStatusToExpression(status, readyToReveal);

  const starterPrompts = useMemo(() => [...THIRD_MARK_STARTER_PROMPTS], []);

  const handleBegin = () => {
    setParticipantName(draftName.trim());
    setStage("live");
  };

  const handleSend = () => {
    if (!composerValue.trim()) return;
    const sent = sendMessage(composerValue);
    if (sent) setComposerValue("");
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
    setSessionKey(current => current + 1);
    setStage("arrive");
  };

  return (
    <div className="min-h-[100dvh] bg-[#04040A] text-[#F5F0E8] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,162,101,0.16),_transparent_40%),radial-gradient(circle_at_80%_20%,_rgba(196,180,154,0.12),_transparent_30%),linear-gradient(180deg,_#09080B_0%,_#04040A_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:64px_64px]" />

      <div className="relative z-10 min-h-[100dvh]">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="rounded-full border border-white/10 bg-white/5 p-2">
              <ThirdMarkGlyph expression={expression} size={36} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#C4B49A]/75">Signal Card</p>
              <p className="text-sm text-white/75">Front-line agent in Third Mark mode</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {stage === "live" && (
              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#E8D5A0] sm:block">
                {formatStatus(status)}
              </div>
            )}
            <Link
              href="/cinema"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white/80 transition hover:border-[#C4A265]/40 hover:text-white"
            >
              <Film className="h-3.5 w-3.5 text-[#C4A265]" />
              Cinema
            </Link>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {stage === "arrive" && (
            <motion.main
              key="arrive"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto grid min-h-[calc(100dvh-88px)] w-full max-w-7xl gap-10 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
            >
              <section className="space-y-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.4em] text-[#E8D5A0]">
                  Private invite from Lenox / Third Signal
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <ThirdMarkGlyph expression="arrive" size={96} />
                    <div className="h-px flex-1 bg-gradient-to-r from-[#C4A265]/40 to-transparent" />
                  </div>
                  <h1
                    className="max-w-4xl text-5xl leading-[0.95] text-[#F5F0E8] sm:text-6xl lg:text-8xl"
                    style={{ fontFamily: "\"Cormorant Garamond\", serif" }}
                  >
                    Lenox sent you here for a reason.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                    This is Signal Card: the private front line for Third Signal. It
                    assumes you arrived here through Lenox or a trusted VIP. Speak if
                    the room allows it. Type if it does not. Either way, it figures out
                    who you are, explains what matters, and routes you cleanly.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Voice first", "If you can talk, use the mic. The experience should feel like a private line, not a form."],
                    ["Adjust the talk track", "Speak differently to a layman, operator, partner, or executive while keeping one coherent story."],
                    ["Route cleanly", "Move the conversation toward the right proof surface, product path, or contact step."],
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
                    >
                      <p className="text-[11px] uppercase tracking-[0.32em] text-[#C4B49A]">
                        {title}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/72">{body}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
                <p className="text-[10px] uppercase tracking-[0.45em] text-[#C4B49A]/80">
                  Start here
                </p>
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-white/45">
                      Optional name
                    </label>
                    <input
                      value={draftName}
                      onChange={event => setDraftName(event.target.value)}
                      placeholder="Lenox"
                      className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 px-5 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#C4A265]/50"
                    />
                  </div>

                  <div className="rounded-[24px] border border-[#C4A265]/20 bg-[#0E0B09]/70 p-5">
                    <p
                      className="text-3xl leading-none text-[#F5F0E8]"
                      style={{ fontFamily: "\"Cormorant Garamond\", serif" }}
                    >
                      “Think red phone booth, not landing page.”
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBegin}
                    className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#C4A265] px-6 text-xs font-medium uppercase tracking-[0.4em] text-[#09080B] transition hover:bg-[#E8D5A0]"
                  >
                    Open the line
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </section>
            </motion.main>
          )}

          {stage === "live" && (
            <motion.main
              key="live"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto grid min-h-[calc(100dvh-88px)] w-full max-w-7xl gap-6 px-5 pb-8 pt-2 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]"
            >
              <section className="flex flex-col gap-5">
                <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.38em] text-[#C4B49A]">
                        Live status
                      </p>
                      <p
                        className="mt-3 text-4xl text-[#F5F0E8]"
                        style={{ fontFamily: "\"Cormorant Garamond\", serif" }}
                      >
                        {formatStatus(status)}
                      </p>
                    </div>
                    <ThirdMarkGlyph expression={expression} size={108} />
                  </div>

                  <div className="mt-6 space-y-3 text-sm leading-7 text-white/70">
                    <p>
                      {participantName
                        ? `Signal Card is live for ${participantName}.`
                        : "Signal Card is live."} Start direct. It will adjust the framing to match who is in the room.
                    </p>
                    <p>
                      This assumes a warm introduction. It should feel discreet, high-trust, and ruthlessly clear.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {starterPrompts.map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setComposerValue(prompt)}
                        className="rounded-full border border-white/10 px-4 py-2 text-left text-xs text-white/70 transition hover:border-[#C4A265]/40 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[10px] uppercase tracking-[0.38em] text-[#C4B49A]">
                    Voice first
                  </p>
                  <div className="mt-5 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (voiceState === "recording") {
                          stopVoiceCapture();
                          return;
                        }
                        void startVoiceCapture();
                      }}
                      disabled={voiceState === "unsupported" || status === "booting" || status === "replying"}
                      className={`inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-full border transition ${
                        voiceState === "recording"
                          ? "border-[#E8D5A0] bg-[#C4A265] text-[#09080B]"
                          : "border-[#C4A265]/35 bg-[#C4A265]/12 text-[#F5F0E8]"
                      }`}
                    >
                      {voiceState === "recording" ? (
                        <Square className="h-6 w-6 fill-current" />
                      ) : (
                        <Mic className="h-7 w-7" />
                      )}
                    </button>

                    <div className="space-y-2">
                      <p
                        className="text-3xl text-[#F5F0E8]"
                        style={{ fontFamily: "\"Cormorant Garamond\", serif" }}
                      >
                        {voiceState === "recording" ? "Listening now" : "Tap the mic first"}
                      </p>
                      <p className="text-sm leading-7 text-white/65">
                        If you can speak, use the mic. If you're in a loud room or need discretion, drop to typed mode below.
                      </p>
                      {voiceState === "unsupported" && (
                        <p className="text-sm text-[#F2C6B4]">
                          Voice is not available in this environment. Type mode stays open.
                        </p>
                      )}
                      {voiceState === "denied" && (
                        <p className="text-sm text-[#F2C6B4]">
                          Mic access was blocked. Type mode is ready instead.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6">
                  <p className="text-[10px] uppercase tracking-[0.38em] text-[#C4B49A]">
                    Reveal threshold
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-5xl text-[#F5F0E8]">{userTurns}</p>
                      <p className="mt-2 text-sm text-white/55">
                        exchanges logged
                      </p>
                    </div>
                    <div className="h-2 flex-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#C4A265] to-[#E8D5A0] transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            (userTurns / THIRD_MARK_LIVE_REVEAL_THRESHOLD) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!readyToReveal || status === "replying" || generateInsight.isPending}
                    onClick={handleReveal}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#C4A265]/35 bg-[#C4A265]/14 px-5 text-xs uppercase tracking-[0.35em] text-[#F5F0E8] transition disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[#C4A265]/20"
                  >
                    Reveal the cinematic asset
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {error && (
                    <p className="mt-4 text-sm text-[#F2C6B4]">{error}</p>
                  )}
                </div>
              </section>

              <section className="flex min-h-[60vh] flex-col rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-6">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.38em] text-[#C4B49A]">
                      Transcript
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                      Live session on {THIRD_MARK_LIVE_MODEL}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/65 transition hover:border-white/20 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>

                <div
                  ref={transcriptListRef}
                  className="mt-5 flex-1 space-y-4 overflow-y-auto pr-2"
                >
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`max-w-[92%] rounded-[24px] px-5 py-4 ${
                        message.role === "user"
                          ? "ml-auto border border-[#C4A265]/25 bg-[#C4A265]/12"
                          : message.role === "guide"
                            ? "border border-white/10 bg-white/[0.03]"
                            : "border border-white/10 bg-black/20"
                      }`}
                    >
                      <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-[#C4B49A]/80">
                        {message.role === "user"
                          ? "You"
                          : message.role === "guide"
                            ? "Threshold"
                            : "Signal Card"}
                      </p>
                      <p
                        className={`text-lg leading-8 ${
                          message.role === "user" ? "text-white" : "text-[#F5F0E8]"
                        }`}
                        style={{
                          fontFamily:
                            message.role === "user"
                              ? "\"Satoshi\", \"Inter\", sans-serif"
                              : "\"Cormorant Garamond\", serif",
                          fontStyle:
                            message.role === "user" ? "normal" : "italic",
                        }}
                      >
                        {message.text}
                        {message.status === "streaming" && (
                          <span className="ml-1 inline-block h-5 w-2 animate-pulse rounded-full bg-[#E8D5A0]/70 align-middle" />
                        )}
                      </p>
                    </div>
                  ))}

                  {messages.length === 0 && (
                    <div className="flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-black/10 px-8 text-center text-white/45">
                      Opening the line...
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/55">
                    <Keyboard className="h-3.5 w-3.5" />
                    Type fallback
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
                    placeholder="Can't speak here? Type instead."
                    className="min-h-[112px] w-full resize-none rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-base leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#C4A265]/45"
                  />
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-white/45">
                      Press <span className="text-[#E8D5A0]">Cmd/Ctrl + Enter</span> to send.
                    </p>
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!composerValue.trim() || !canSend || status === "replying"}
                      className="inline-flex h-12 items-center justify-center gap-3 rounded-full bg-[#C4A265] px-6 text-xs uppercase tracking-[0.36em] text-[#09080B] transition disabled:cursor-not-allowed disabled:opacity-35 hover:bg-[#E8D5A0]"
                    >
                      Send
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>
            </motion.main>
          )}

          {stage === "processing" && (
            <motion.main
              key="processing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35 }}
              className="mx-auto flex min-h-[calc(100dvh-88px)] w-full max-w-4xl items-center justify-center px-5 pb-16 pt-6 sm:px-8"
            >
              <div className="w-full rounded-[36px] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl sm:p-12">
                <div className="mx-auto flex w-fit rounded-full border border-[#C4A265]/25 bg-[#C4A265]/8 p-4">
                  <ThirdMarkGlyph expression="gift" size={72} />
                </div>
                <p className="mt-8 text-[10px] uppercase tracking-[0.42em] text-[#C4B49A]">
                  Distilling the mark
                </p>
                <p
                  className="mx-auto mt-5 max-w-2xl text-4xl text-[#F5F0E8] sm:text-5xl"
                  style={{ fontFamily: "\"Cormorant Garamond\", serif" }}
                >
                  We are turning the live thread into a cinematic reveal.
                </p>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/65">
                  The conversation is being condensed into scenes, pressure points,
                  and a final call to move.
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
    </div>
  );
}

import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type SignalTerminalMarkState = "idle" | "speaking" | "listening" | "processing";
export type SignalTerminalOrbState = SignalTerminalMarkState;

export interface SignalTerminalEntry {
  id: string;
  speaker: "ghost" | "visitor";
  text: string;
  status?: "complete" | "streaming";
}

export type SignalTerminalPrompt =
  | {
      type: "name";
      value: string;
      placeholder: string;
      submitLabel: string;
      onChange: (value: string) => void;
      onSubmit: () => void;
    }
  | {
      type: "choices";
      choices: Array<{ id: string; label: string; sub?: string }>;
      onChoose: (id: string) => void;
    }
  | {
      type: "input";
      value: string;
      placeholder: string;
      submitLabel: string;
      onChange: (value: string) => void;
      onSubmit: () => void;
      submitDisabled?: boolean;
    }
  | {
      type: "contact";
      reason: string;
      email: string;
      company: string;
      notes: string;
      submitLabel: string;
      onEmailChange: (value: string) => void;
      onCompanyChange: (value: string) => void;
      onNotesChange: (value: string) => void;
      onSubmit: () => void;
      onDismiss?: () => void;
      submitDisabled?: boolean;
    };

const GOLD = "#C4A265";
const GOLD_BRIGHT = "#E8D5A0";
const CONTAINER_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function useTypewriterText(
  messageId: string,
  text: string,
  speed = 26,
  enabled = true
) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const targetRef = useRef(text);
  const displayedRef = useRef(enabled ? "" : text);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled) {
      targetRef.current = text;
      displayedRef.current = text;
      setDisplayed(text);
      return;
    }

    targetRef.current = text;

    if (displayedRef.current.length > text.length) {
      displayedRef.current = "";
      setDisplayed("");
    }

    const tick = () => {
      const target = targetRef.current;
      const current = displayedRef.current;
      if (current.length >= target.length) {
        timerRef.current = null;
        return;
      }

      const next = target.slice(0, current.length + 1);
      displayedRef.current = next;
      setDisplayed(next);
      timerRef.current = window.setTimeout(tick, speed);
    };

    if (displayedRef.current.length < text.length) {
      timerRef.current = window.setTimeout(tick, speed);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, speed, text]);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled) {
      targetRef.current = text;
      displayedRef.current = text;
      setDisplayed(text);
      return;
    }

    targetRef.current = text;
    displayedRef.current = "";
    setDisplayed("");

    const tick = () => {
      const target = targetRef.current;
      const current = displayedRef.current;
      if (current.length >= target.length) {
        timerRef.current = null;
        return;
      }

      const next = target.slice(0, current.length + 1);
      displayedRef.current = next;
      setDisplayed(next);
      timerRef.current = window.setTimeout(tick, speed);
    };

    timerRef.current = window.setTimeout(tick, speed);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, messageId, speed, text]);

  return {
    displayed,
    complete: displayed.length >= text.length,
  };
}

function SignalMarkPresence({ state }: { state: SignalTerminalMarkState }) {
  const isSpeaking = state === "speaking" || state === "processing";
  const isListening = state === "listening";
  const expression = isListening
    ? "listen"
    : isSpeaking
      ? state === "processing"
        ? "gift"
        : "speak"
      : "rest";

  return (
    <div className="relative mx-auto flex h-24 w-28 items-center justify-center sm:h-28 sm:w-32">
      <motion.div
        aria-hidden
        className="absolute inset-x-4 top-1/2 h-16 -translate-y-1/2"
        animate={{
          opacity: isListening ? [0.08, 0.18, 0.08] : isSpeaking ? [0.06, 0.16, 0.06] : [0.04, 0.12, 0.04],
          filter: isListening
            ? ["blur(18px)", "blur(28px)", "blur(18px)"]
            : ["blur(16px)", "blur(24px)", "blur(16px)"],
        }}
        transition={{
          duration: isListening ? 3 : isSpeaking ? 3.4 : 4.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(196,162,101,0.22) 0%, rgba(196,162,101,0.1) 26%, rgba(196,162,101,0.03) 48%, rgba(0,0,0,0) 78%)",
        }}
      />

      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(196,162,101,0.1) 18%, rgba(232,213,160,0.5) 50%, rgba(196,162,101,0.1) 82%, transparent 100%)`,
        }}
        animate={{
          opacity: isSpeaking ? [0.22, 0.75, 0.22] : [0.12, 0.28, 0.12],
          scaleX: isSpeaking ? [0.92, 1.06, 0.94] : [0.96, 1, 0.96],
        }}
        transition={{
          duration: isSpeaking ? 2.6 : 4.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {isSpeaking ? (
        <motion.div
          aria-hidden
          className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2"
          style={{ background: `linear-gradient(90deg, transparent, ${GOLD_BRIGHT}80, transparent)` }}
          animate={{ opacity: [0, 0.9, 0], y: [-22, 0, 22] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      ) : null}

      <motion.div
        className="relative"
        animate={{
          opacity: isListening ? [0.7, 1, 0.7] : isSpeaking ? [0.76, 1, 0.78] : [0.58, 0.92, 0.58],
        }}
        transition={{
          duration: isListening ? 3 : isSpeaking ? 3.4 : 4.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <ThirdMarkGlyph expression={expression} size={76} />
      </motion.div>
    </div>
  );
}

function VoiceOption({
  active,
  disabled,
  onClick,
  label,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-[#7de0ff]/76 transition hover:text-[#dff7ff] disabled:cursor-not-allowed disabled:opacity-40"
    >
      <motion.span
        className="inline-block h-2 w-2 rounded-full bg-[#7de0ff]"
        animate={
          active
            ? {
                scale: [1, 1.24, 1],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 0 rgba(125,224,255,0)",
                  "0 0 10px rgba(125,224,255,0.42)",
                  "0 0 0 rgba(125,224,255,0)",
                ],
              }
            : {
                scale: [1, 1.12, 1],
                opacity: [0.45, 0.88, 0.45],
                boxShadow: [
                  "0 0 0 rgba(125,224,255,0)",
                  "0 0 5px rgba(125,224,255,0.2)",
                  "0 0 0 rgba(125,224,255,0)",
                ],
              }
        }
        transition={{
          duration: active ? 1.1 : 2.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <span>{label}</span>
    </button>
  );
}

function GhostLine({
  entry,
  onDone,
}: {
  entry: SignalTerminalEntry;
  onDone?: (id: string) => void;
}) {
  const isStreaming = entry.status === "streaming";
  const { displayed, complete } = useTypewriterText(entry.id, entry.text, 8, true);
  const doneForIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (onDone && complete && !isStreaming && doneForIdRef.current !== entry.id) {
      doneForIdRef.current = entry.id;
      onDone(entry.id);
    }
  }, [complete, entry.id, isStreaming, onDone]);

  return (
    <div className="max-w-[74%] text-left sm:max-w-[70%]">
      <p className="whitespace-pre-wrap font-mono text-[12px] leading-[1.82] tracking-[0.025em] text-[rgba(245,240,232,0.88)] sm:text-[13px]">
        {displayed}
        {(!complete || isStreaming) && (
          <motion.span
            className="ml-0.5 inline-block h-[1em] w-[2px] align-[-0.12em]"
            style={{ background: GOLD_BRIGHT }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.08, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}
      </p>
    </div>
  );
}

function VisitorLine({ entry }: { entry: SignalTerminalEntry }) {
  return (
    <div className="ml-auto max-w-[68%] text-right sm:max-w-[64%]">
      <p
        className="whitespace-pre-wrap text-[0.98rem] leading-[1.72] text-white/36 sm:text-[1.02rem]"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
      >
        {entry.text}
      </p>
    </div>
  );
}

function SignalGraphicBreak({ variant }: { variant: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: "blur(10px)" }}
      animate={{ opacity: 0.92, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: CONTAINER_EASE }}
      className="pointer-events-none relative mx-auto my-4 h-24 w-full max-w-[18rem] overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,162,101,0.12)_0%,rgba(196,162,101,0.04)_32%,rgba(0,0,0,0)_72%)]" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(232,213,160,0.2) 0, rgba(255,255,255,0) 1px), linear-gradient(90deg, rgba(232,213,160,0.08) 0, rgba(255,255,255,0) 1px)",
          backgroundSize: "100% 8px, 18px 100%",
        }}
      />
      <motion.div
        className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD}66, transparent)` }}
        animate={{ opacity: [0.2, 0.62, 0.2], scaleX: [0.9, 1.03, 0.92] }}
        transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      {variant === 0 ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 96" fill="none">
          <path d="M26 68L92 26H152L202 52H294" stroke="rgba(196,162,101,0.22)" strokeWidth="1" />
          <path d="M44 78H126L164 38H240" stroke="rgba(232,213,160,0.18)" strokeWidth="1" />
          <circle cx="92" cy="26" r="2" fill="rgba(232,213,160,0.58)" />
          <circle cx="202" cy="52" r="2" fill="rgba(196,162,101,0.48)" />
          <circle cx="164" cy="38" r="2" fill="rgba(232,213,160,0.44)" />
        </svg>
      ) : variant === 1 ? (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 96" fill="none">
          <path d="M18 56C44 56 46 22 74 22C101 22 102 76 132 76C162 76 168 36 194 36C220 36 228 64 260 64C280 64 288 52 302 52" stroke="rgba(196,162,101,0.22)" strokeWidth="1" />
          <path d="M26 68C54 68 54 42 82 42C110 42 110 60 136 60C162 60 174 22 202 22C230 22 238 76 270 76" stroke="rgba(232,213,160,0.16)" strokeWidth="1" />
        </svg>
      ) : (
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 96" fill="none">
          <path d="M42 24H276" stroke="rgba(196,162,101,0.12)" strokeWidth="1" />
          <path d="M72 72H248" stroke="rgba(232,213,160,0.16)" strokeWidth="1" />
          <path d="M98 24V72" stroke="rgba(196,162,101,0.18)" strokeWidth="1" />
          <path d="M160 24V72" stroke="rgba(232,213,160,0.12)" strokeWidth="1" />
          <path d="M222 24V72" stroke="rgba(196,162,101,0.18)" strokeWidth="1" />
        </svg>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <ThirdMarkGlyph expression={variant === 1 ? "think" : "certain"} size={44} />
      </div>
    </motion.div>
  );
}

function PromptShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.992, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -4, scale: 0.996, filter: "blur(8px)" }}
      transition={{ duration: 0.52, ease: CONTAINER_EASE }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function NamePrompt({
  value,
  placeholder,
  submitLabel,
  onChange,
  onSubmit,
  onVoice,
  voiceActive,
  voiceDisabled,
}: {
  value: string;
  placeholder: string;
  submitLabel: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoice: () => void;
  voiceActive: boolean;
  voiceDisabled?: boolean;
}) {
  return (
    <PromptShell>
      <div className="space-y-4">
        <input
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={placeholder}
          className="h-12 w-full border-b border-white/10 bg-transparent px-0 text-[1rem] text-[rgba(245,240,232,0.9)] outline-none transition placeholder:text-white/14 focus:border-[rgba(196,162,101,0.42)]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSubmit}
            className="text-[10px] uppercase tracking-[0.34em] transition hover:text-[#f4dfbc]"
            style={{ color: `${GOLD}D0` }}
          >
            {submitLabel}
          </button>
          <VoiceOption
            active={voiceActive}
            disabled={voiceDisabled}
            onClick={onVoice}
            label={voiceActive ? "Stop listening" : "Speak instead"}
          />
        </div>
      </div>
    </PromptShell>
  );
}

function ChoicePrompt({
  choices,
  onChoose,
  onVoice,
  voiceActive,
  voiceDisabled,
}: {
  choices: Array<{ id: string; label: string; sub?: string }>;
  onChoose: (id: string) => void;
  onVoice: () => void;
  voiceActive: boolean;
  voiceDisabled?: boolean;
}) {
  return (
    <PromptShell>
      <div className="space-y-3">
        {choices.map(choice => (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoose(choice.id)}
            className="flex w-full items-start justify-between gap-4 border-b border-white/8 py-3 text-left transition hover:border-[rgba(196,162,101,0.24)]"
          >
            <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/72">
              {choice.label}
            </span>
            {choice.sub ? (
              <span className="text-right text-[11px] text-white/26">{choice.sub}</span>
            ) : null}
          </button>
        ))}
        <div className="pt-2">
          <VoiceOption
            active={voiceActive}
            disabled={voiceDisabled}
            onClick={onVoice}
            label={voiceActive ? "Stop listening" : "Speak instead"}
          />
        </div>
      </div>
    </PromptShell>
  );
}

function TextPrompt({
  value,
  placeholder,
  submitLabel,
  submitDisabled,
  onChange,
  onSubmit,
  onVoice,
  voiceActive,
  voiceDisabled,
}: {
  value: string;
  placeholder: string;
  submitLabel: string;
  submitDisabled?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onVoice: () => void;
  voiceActive: boolean;
  voiceDisabled?: boolean;
}) {
  return (
    <PromptShell>
      <div className="space-y-4">
        <textarea
          value={value}
          onChange={event => onChange(event.target.value)}
          onKeyDown={event => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          rows={3}
          placeholder={placeholder}
          className="min-h-[7rem] w-full resize-none border-b border-white/10 bg-transparent px-0 py-2 text-[1rem] leading-7 text-[rgba(245,240,232,0.88)] outline-none transition placeholder:text-white/16 focus:border-[rgba(196,162,101,0.34)]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="text-[10px] uppercase tracking-[0.34em] transition hover:text-[#f4dfbc] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: `${GOLD}D0` }}
          >
            {submitLabel}
          </button>
          <VoiceOption
            active={voiceActive}
            disabled={voiceDisabled}
            onClick={onVoice}
            label={voiceActive ? "Stop listening" : "Speak instead"}
          />
        </div>
      </div>
    </PromptShell>
  );
}

function ContactPrompt({
  reason,
  email,
  company,
  notes,
  submitLabel,
  submitDisabled,
  onEmailChange,
  onCompanyChange,
  onNotesChange,
  onSubmit,
  onDismiss,
  onVoice,
  voiceActive,
  voiceDisabled,
}: {
  reason: string;
  email: string;
  company: string;
  notes: string;
  submitLabel: string;
  submitDisabled?: boolean;
  onEmailChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onDismiss?: () => void;
  onVoice: () => void;
  voiceActive: boolean;
  voiceDisabled?: boolean;
}) {
  return (
    <PromptShell>
      <div className="space-y-4">
        <p className="max-w-[92%] font-mono text-[11px] leading-[1.7] tracking-[0.03em] text-white/38">
          {reason}
        </p>
        <input
          value={email}
          onChange={event => onEmailChange(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          type="email"
          placeholder="Email"
          className="h-12 w-full border-b border-white/10 bg-transparent px-0 text-[0.98rem] text-[rgba(245,240,232,0.9)] outline-none transition placeholder:text-white/14 focus:border-[rgba(196,162,101,0.42)]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <input
          value={company}
          onChange={event => onCompanyChange(event.target.value)}
          placeholder="Company (optional)"
          className="h-12 w-full border-b border-white/10 bg-transparent px-0 text-[0.98rem] text-[rgba(245,240,232,0.74)] outline-none transition placeholder:text-white/12 focus:border-[rgba(196,162,101,0.34)]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <textarea
          value={notes}
          onChange={event => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Anything the team should know? (optional)"
          className="min-h-[6rem] w-full resize-none border-b border-white/10 bg-transparent px-0 py-2 text-[0.98rem] leading-7 text-[rgba(245,240,232,0.74)] outline-none transition placeholder:text-white/12 focus:border-[rgba(196,162,101,0.34)]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onSubmit}
              disabled={submitDisabled}
              className="text-[10px] uppercase tracking-[0.34em] transition hover:text-[#f4dfbc] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: `${GOLD}D0` }}
            >
              {submitLabel}
            </button>
            {onDismiss ? (
              <button
                type="button"
                onClick={onDismiss}
                className="text-[10px] uppercase tracking-[0.28em] text-white/24 transition hover:text-white/46"
              >
                Not now
              </button>
            ) : null}
          </div>
          <VoiceOption
            active={voiceActive}
            disabled={voiceDisabled}
            onClick={onVoice}
            label={voiceActive ? "Stop listening" : "Speak instead"}
          />
        </div>
      </div>
    </PromptShell>
  );
}

export function SignalCardTerminal({
  stage,
  orbState,
  entries,
  typingGhost,
  activePrompt,
  textFallbackOpen,
  textFallbackValue,
  textFallbackDisabled,
  statusLine,
  error,
  voiceActive,
  voiceDisabled,
  readyToReveal,
  revealPending,
  onBegin,
  onReset,
  onTypingGhostDone,
  onVoiceToggle,
  onOpenTextFallback,
  onTextFallbackChange,
  onTextFallbackSubmit,
  onReveal,
}: {
  stage: "arrive" | "live";
  orbState: SignalTerminalMarkState;
  entries: SignalTerminalEntry[];
  typingGhost: SignalTerminalEntry | null;
  activePrompt: SignalTerminalPrompt | null;
  textFallbackOpen: boolean;
  textFallbackValue: string;
  textFallbackDisabled?: boolean;
  statusLine?: string;
  error?: string | null;
  voiceActive: boolean;
  voiceDisabled?: boolean;
  readyToReveal: boolean;
  revealPending: boolean;
  onBegin: () => void;
  onReset: () => void;
  onTypingGhostDone: (id: string) => void;
  onVoiceToggle: () => void;
  onOpenTextFallback: () => void;
  onTextFallbackChange: (value: string) => void;
  onTextFallbackSubmit: () => void;
  onReveal: () => void;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const visibleEntries = useMemo(() => entries.slice(-5), [entries]);

  const breakAfterIds = useMemo(() => {
    const ids = new Map<string, number>();
    let ghostCount = 0;

    visibleEntries.forEach((entry, index) => {
      if (entry.speaker !== "ghost") return;
      ghostCount += 1;
      if (ghostCount % 2 === 0 && index < visibleEntries.length - 1) {
        ids.set(entry.id, ghostCount % 3);
      }
    });

    return ids;
  }, [visibleEntries]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: typingGhost ? "smooth" : "auto",
      block: "end",
    });
  }, [activePrompt, readyToReveal, textFallbackOpen, typingGhost?.id, typingGhost?.text, visibleEntries.length]);

  if (stage === "arrive") {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0A0A0F_0%,#000_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen" style={{ backgroundImage: "linear-gradient(180deg, rgba(232,213,160,0.12) 0, rgba(255,255,255,0) 1px)", backgroundSize: "100% 4px" }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(0,0,0,0.78)_100%)]" />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: CONTAINER_EASE }}
          >
            <SignalMarkPresence state="idle" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
            animate={{ opacity: 0.95, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.16, ease: CONTAINER_EASE }}
            className="mt-8 text-[2rem] leading-[1.02] text-[rgba(245,240,232,0.96)] sm:text-[2.25rem]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
          >
            We’ll make this useful.
          </motion.p>
          <button
            type="button"
            onClick={onBegin}
            className="mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.38em] text-[#7de0ff]/72 transition hover:text-[#dff7ff]"
          >
            <motion.span
              className="inline-block h-2.5 w-2.5 rounded-full bg-[#7de0ff]"
              animate={{ scale: [1, 1.16, 1], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            Open the line
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-5 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0A0A0F_0%,#000_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(232,213,160,0.12) 0, rgba(255,255,255,0) 1px)",
          backgroundSize: "100% 4px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.84)_100%)]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.09]" viewBox="0 0 430 900" fill="none" preserveAspectRatio="none" aria-hidden>
        <path d="M-20 220C108 136 182 136 310 220C368 258 426 312 478 382" stroke="rgba(196,162,101,0.11)" strokeWidth="1" />
        <path d="M-28 548C126 442 230 448 396 566" stroke="rgba(196,162,101,0.08)" strokeWidth="1" />
        <path d="M66 0V900" stroke="rgba(196,162,101,0.03)" strokeWidth="1" />
        <path d="M366 0V900" stroke="rgba(196,162,101,0.03)" strokeWidth="1" />
      </svg>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[26rem] flex-col">
        <div className="relative flex min-h-[6rem] items-start justify-center">
          <div className="pt-1">
            <SignalMarkPresence state={orbState} />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="absolute right-0 top-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.32em] text-white/22 transition hover:text-white/48"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div
          className="mt-4 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 8%, black 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 8%, black 70%, transparent 100%)",
          }}
        >
          <div className="space-y-5 pb-14 pt-2">
            {!visibleEntries.length && !typingGhost && statusLine ? (
              <p className="max-w-[72%] font-mono text-[11px] leading-[1.72] tracking-[0.03em] text-white/24">
                {statusLine}
              </p>
            ) : null}

            {visibleEntries.map((entry, index) => {
              const age = visibleEntries.length - index - 1;
              const opacity = Math.max(0.12, 1 - age * 0.2);
              const blur = Math.min(2.4, age * 0.55);

              return (
                <div key={entry.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                    animate={{ opacity, y: 0, filter: `blur(${blur}px)` }}
                    transition={{ duration: 0.55, ease: CONTAINER_EASE }}
                    className="will-change-transform"
                  >
                    {entry.speaker === "ghost" ? <GhostLine entry={entry} /> : <VisitorLine entry={entry} />}
                  </motion.div>

                  {breakAfterIds.has(entry.id) ? (
                    <SignalGraphicBreak variant={breakAfterIds.get(entry.id) ?? 0} />
                  ) : null}
                </div>
              );
            })}

            {typingGhost ? <GhostLine key={typingGhost.id} entry={typingGhost} onDone={onTypingGhostDone} /> : null}

            {error ? (
              <p className="max-w-[78%] font-mono text-[12px] leading-[1.7] tracking-[0.02em] text-[rgba(196,162,101,0.7)]">
                {error}
              </p>
            ) : null}

            <AnimatePresence mode="wait">
              {activePrompt?.type === "name" ? (
                <NamePrompt
                  key="prompt-name"
                  value={activePrompt.value}
                  placeholder={activePrompt.placeholder}
                  submitLabel={activePrompt.submitLabel}
                  onChange={activePrompt.onChange}
                  onSubmit={activePrompt.onSubmit}
                  onVoice={onVoiceToggle}
                  voiceActive={voiceActive}
                  voiceDisabled={voiceDisabled}
                />
              ) : activePrompt?.type === "choices" ? (
                <ChoicePrompt
                  key="prompt-choices"
                  choices={activePrompt.choices}
                  onChoose={activePrompt.onChoose}
                  onVoice={onVoiceToggle}
                  voiceActive={voiceActive}
                  voiceDisabled={voiceDisabled}
                />
              ) : activePrompt?.type === "input" ? (
                <TextPrompt
                  key="prompt-input"
                  value={activePrompt.value}
                  placeholder={activePrompt.placeholder}
                  submitLabel={activePrompt.submitLabel}
                  submitDisabled={activePrompt.submitDisabled}
                  onChange={activePrompt.onChange}
                  onSubmit={activePrompt.onSubmit}
                  onVoice={onVoiceToggle}
                  voiceActive={voiceActive}
                  voiceDisabled={voiceDisabled}
                />
              ) : activePrompt?.type === "contact" ? (
                <ContactPrompt
                  key="prompt-contact"
                  reason={activePrompt.reason}
                  email={activePrompt.email}
                  company={activePrompt.company}
                  notes={activePrompt.notes}
                  submitLabel={activePrompt.submitLabel}
                  submitDisabled={activePrompt.submitDisabled}
                  onEmailChange={activePrompt.onEmailChange}
                  onCompanyChange={activePrompt.onCompanyChange}
                  onNotesChange={activePrompt.onNotesChange}
                  onSubmit={activePrompt.onSubmit}
                  onDismiss={activePrompt.onDismiss}
                  onVoice={onVoiceToggle}
                  voiceActive={voiceActive}
                  voiceDisabled={voiceDisabled}
                />
              ) : textFallbackOpen ? (
                <TextPrompt
                  key="fallback-input"
                  value={textFallbackValue}
                  placeholder="Type only if you must."
                  submitLabel="Send"
                  submitDisabled={textFallbackDisabled}
                  onChange={onTextFallbackChange}
                  onSubmit={onTextFallbackSubmit}
                  onVoice={onVoiceToggle}
                  voiceActive={voiceActive}
                  voiceDisabled={voiceDisabled}
                />
              ) : null}
            </AnimatePresence>

            {!activePrompt && !textFallbackOpen ? (
              <div className="flex items-center justify-between gap-4 pt-1">
                <VoiceOption
                  active={voiceActive}
                  disabled={voiceDisabled}
                  onClick={onVoiceToggle}
                  label={voiceActive ? "Stop listening" : "Speak instead"}
                />
                <button
                  type="button"
                  onClick={onOpenTextFallback}
                  className="text-[10px] uppercase tracking-[0.32em] text-white/20 transition hover:text-white/42"
                >
                  Type
                </button>
              </div>
            ) : null}

            {readyToReveal ? (
              <PromptShell>
                <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/28">
                    The film is waiting.
                  </p>
                  <button
                    type="button"
                    onClick={onReveal}
                    disabled={revealPending}
                    className="text-[10px] uppercase tracking-[0.34em] transition hover:text-[#f4dfbc] disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ color: `${GOLD}D0` }}
                  >
                    Summon reveal
                  </button>
                </div>
              </PromptShell>
            ) : null}

            <div ref={endRef} />
          </div>
        </div>
      </div>
    </main>
  );
}

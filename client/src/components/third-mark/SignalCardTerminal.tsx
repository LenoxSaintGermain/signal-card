import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type SignalTerminalOrbState = "idle" | "speaking" | "listening" | "processing";

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
    };

const CONTAINER_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

function TerminalOrb({ state }: { state: SignalTerminalOrbState }) {
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
      {isListening && (
        <>
          <motion.div
            className="absolute inset-[-10px] rounded-full border"
            style={{ borderColor: "rgba(125,224,255,0.3)" }}
            animate={{ scale: [1, 1.46], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
          <motion.div
            className="absolute inset-[-10px] rounded-full border"
            style={{ borderColor: "rgba(125,224,255,0.18)" }}
            animate={{ scale: [1, 1.58], opacity: [0.36, 0] }}
            transition={{ duration: 1.6, delay: 0.45, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
          />
        </>
      )}

      <motion.div
        className="relative h-full w-full rounded-full border"
        style={{
          borderColor: isListening ? "rgba(125,224,255,0.18)" : "rgba(212,178,125,0.14)",
          background: isListening
            ? "radial-gradient(circle at 40% 35%, rgba(125,224,255,0.16), rgba(5,14,18,0.94) 55%, rgba(0,0,0,1) 100%)"
            : "radial-gradient(circle at 40% 35%, rgba(212,178,125,0.18), rgba(14,10,5,0.94) 55%, rgba(0,0,0,1) 100%)",
        }}
        animate={
          state === "processing"
            ? { scale: [1, 1.06, 1], opacity: [0.82, 1, 0.84] }
            : isSpeaking
              ? { scale: [1, 1.03, 1], opacity: [0.88, 1, 0.9] }
              : { scale: [1, 1.015, 1], opacity: [0.84, 0.98, 0.86] }
        }
        transition={{
          duration: isListening ? 1.3 : isSpeaking ? 1.6 : 3.2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {isSpeaking && (
          <motion.div
            className="absolute left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,178,125,0.55), transparent)",
            }}
            animate={{ top: ["8%", "86%"], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <ThirdMarkGlyph
            expression={
              isListening
                ? "listen"
                : isSpeaking
                  ? "speak"
                  : state === "processing"
                    ? "gift"
                    : "rest"
            }
            size={60}
          />
        </div>
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
                scale: [1, 1.45, 1],
                opacity: [0.7, 1, 0.7],
                boxShadow: [
                  "0 0 0 rgba(125,224,255,0)",
                  "0 0 12px rgba(125,224,255,0.48)",
                  "0 0 0 rgba(125,224,255,0)",
                ],
              }
            : {
                scale: [1, 1.18, 1],
                opacity: [0.5, 0.9, 0.5],
                boxShadow: [
                  "0 0 0 rgba(125,224,255,0)",
                  "0 0 8px rgba(125,224,255,0.3)",
                  "0 0 0 rgba(125,224,255,0)",
                ],
              }
        }
        transition={{
          duration: active ? 0.9 : 1.8,
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
  const { displayed, complete } = useTypewriterText(entry.id, entry.text, 26, true);
  const doneForIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (onDone && complete && !isStreaming && doneForIdRef.current !== entry.id) {
      doneForIdRef.current = entry.id;
      onDone(entry.id);
    }
  }, [complete, entry.id, isStreaming, onDone]);

  return (
    <div className="max-w-[85%] text-left">
      <p className="font-mono text-[13px] leading-[1.7] tracking-[0.02em] text-white/84 sm:text-[14px]">
        {displayed}
        {(!complete || isStreaming) && (
          <motion.span
            className="ml-0.5 inline-block h-[1em] w-[2px] align-[-0.12em] bg-[#d4b27d]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        )}
      </p>
    </div>
  );
}

function VisitorLine({ entry }: { entry: SignalTerminalEntry }) {
  return (
    <div className="ml-auto max-w-[78%] text-right">
      <p
        className="text-[1.02rem] leading-[1.55] text-white/46 sm:text-[1.08rem]"
        style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
      >
        {entry.text}
      </p>
    </div>
  );
}

function PromptShell({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.985, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -4, scale: 0.99, filter: "blur(8px)" }}
      transition={{ duration: 0.48, ease: CONTAINER_EASE }}
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
          className="h-12 w-full border-b border-white/10 bg-transparent px-0 text-[1.02rem] text-white/88 outline-none transition placeholder:text-white/16 focus:border-[#d4b27d]/42"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSubmit}
            className="text-[10px] uppercase tracking-[0.34em] text-[#d4b27d]/82 transition hover:text-[#f4dfbc]"
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
            className="flex w-full items-start justify-between gap-4 border-b border-white/8 py-3 text-left transition hover:border-[#d4b27d]/24"
          >
            <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-white/74">
              {choice.label}
            </span>
            {choice.sub ? (
              <span className="text-right text-[11px] text-white/28">{choice.sub}</span>
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
          className="min-h-[7.25rem] w-full resize-none border border-white/10 bg-white/[0.015] p-3 text-[1rem] leading-7 text-white/86 outline-none transition placeholder:text-white/18 focus:border-[#d4b27d]/34 focus:bg-white/[0.02]"
          style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
        />
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitDisabled}
            className="text-[10px] uppercase tracking-[0.34em] text-[#d4b27d]/82 transition hover:text-[#f4dfbc] disabled:cursor-not-allowed disabled:opacity-40"
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
  orbState: SignalTerminalOrbState;
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

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: typingGhost ? "smooth" : "auto",
      block: "end",
    });
  }, [activePrompt, entries.length, readyToReveal, textFallbackOpen, typingGhost?.id, typingGhost?.text]);

  if (stage === "arrive") {
    return (
      <main className="relative flex min-h-[100dvh] items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(90,164,194,0.16),transparent_18%),radial-gradient(circle_at_50%_68%,rgba(6,18,24,0.28),transparent_34%),linear-gradient(180deg,#010204_0%,#000_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,0.8)_100%)]" />

        <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
          <TerminalOrb state="idle" />
          <motion.p
            initial={{ opacity: 0, y: 8, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.12, ease: CONTAINER_EASE }}
            className="mt-10 text-[2rem] leading-[1.02] text-white/92 sm:text-[2.35rem]"
            style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: "italic" }}
          >
            The line is open.
          </motion.p>
          <button
            type="button"
            onClick={onBegin}
            className="mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.38em] text-[#7de0ff]/72 transition hover:text-[#dff7ff]"
          >
            <motion.span
              className="inline-block h-2.5 w-2.5 rounded-full bg-[#7de0ff]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            Open the line
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-[100dvh] overflow-hidden px-5 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(52,105,126,0.16),transparent_28%),linear-gradient(180deg,#010204_0%,#000_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 1px)",
          backgroundSize: "100% 4px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_46%,rgba(0,0,0,0.82)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-[28rem] flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="pt-1">
            <TerminalOrb state={orbState} />
          </div>
          <button
            type="button"
            onClick={onReset}
            className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.32em] text-white/26 transition hover:text-white/56"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="mt-10 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-6 pb-10">
            {entries.map(entry =>
              entry.speaker === "ghost" ? (
                <GhostLine key={entry.id} entry={entry} />
              ) : (
                <VisitorLine key={entry.id} entry={entry} />
              )
            )}

            {typingGhost ? (
              <GhostLine key={typingGhost.id} entry={typingGhost} onDone={onTypingGhostDone} />
            ) : null}

            {statusLine && !entries.length && !typingGhost ? (
              <p className="max-w-[85%] font-mono text-[12px] leading-[1.7] tracking-[0.02em] text-white/42">
                {statusLine}
              </p>
            ) : null}

            {error ? (
              <p className="max-w-[85%] font-mono text-[12px] leading-[1.7] tracking-[0.02em] text-[#d4b27d]/64">
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
              <div className="flex items-center justify-between gap-4 pt-2">
                <VoiceOption
                  active={voiceActive}
                  disabled={voiceDisabled}
                  onClick={onVoiceToggle}
                  label={voiceActive ? "Stop listening" : "Speak instead"}
                />
                <button
                  type="button"
                  onClick={onOpenTextFallback}
                  className="text-[10px] uppercase tracking-[0.32em] text-white/24 transition hover:text-white/52"
                >
                  Type
                </button>
              </div>
            ) : null}

            {readyToReveal ? (
              <PromptShell>
                <div className="flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/34">
                    The film is waiting.
                  </p>
                  <button
                    type="button"
                    onClick={onReveal}
                    disabled={revealPending}
                    className="text-[10px] uppercase tracking-[0.34em] text-[#d4b27d]/82 transition hover:text-[#f4dfbc] disabled:cursor-not-allowed disabled:opacity-40"
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

import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mic, Square, Type } from "lucide-react";

export const THIRD_SIGNAL_VOID_CATALOG_ID =
  "https://thirdsignal.ai/a2ui/catalogs/thirdsignal-void/v0.1";

type VoidStageState = "idle" | "wake" | "listening" | "answering" | "reveal";
type MarkMode = "idle" | "wake" | "listen" | "answer" | "reveal";
type PulseMode = "idle" | "wake" | "listening" | "answer" | "reveal" | "error";
type WhisperMode = "fragment" | "resolved" | "echo";
type WhisperSpeaker = "guide" | "user" | "model";
type ApparitionTreatment = "mist" | "glass" | "signal";

export type ThirdSignalVoidAction =
  | { name: "open_mic" }
  | { name: "stop_mic" }
  | { name: "switch_to_text" }
  | { name: "choose_route"; value: string }
  | { name: "dismiss_apparition" }
  | { name: "summon_reveal" };

export type ThirdSignalVoidComponent =
  | {
      id: string;
      component: "VoidStage";
      state: VoidStageState;
      children: string[];
    }
  | {
      id: string;
      component: "MarkCore";
      mode: MarkMode;
      size: "md" | "lg" | "xl";
      audioReactive: boolean;
    }
  | {
      id: string;
      component: "SignalHalo";
      intensity: number;
      pulseMode: PulseMode;
    }
  | {
      id: string;
      component: "WhisperText";
      text: string;
      mode: WhisperMode;
      placement: "center" | "lower-third";
      speaker: WhisperSpeaker;
      streaming?: boolean;
      echo?: string;
    }
  | {
      id: string;
      component: "ResidueTrail";
      items: Array<{
        id: string;
        text: string;
        role: "user" | "model";
      }>;
      maxVisible: number;
    }
  | {
      id: string;
      component: "HoldToSpeakGlyph";
      label: string;
      action: ThirdSignalVoidAction;
      active: boolean;
      disabled?: boolean;
      secondaryLabel?: string;
      secondaryAction?: ThirdSignalVoidAction;
    }
  | {
      id: string;
      component: "InterruptionHint";
      text: string;
      tone: "warning" | "neutral";
      actionLabel?: string;
      action?: ThirdSignalVoidAction;
    }
  | {
      id: string;
      component: "ApparitionImage";
      src: string;
      caption?: string;
      treatment: ApparitionTreatment;
      actionLabel?: string;
      action?: ThirdSignalVoidAction;
    }
  | {
      id: string;
      component: "ChoiceSigil";
      choices: Array<{
        id: string;
        label: string;
        action: ThirdSignalVoidAction;
      }>;
    }
  | {
      id: string;
      component: "RevealPortal";
      armed: boolean;
      title: string;
      action: ThirdSignalVoidAction;
      disabled?: boolean;
    };

export interface ThirdSignalVoidSurface {
  surfaceId: string;
  catalogId: string;
  components: ThirdSignalVoidComponent[];
}

const residueSlots = [
  { top: "14%", left: "8%", maxWidth: "14rem", rotate: "-8deg" },
  { top: "20%", right: "8%", maxWidth: "15rem", rotate: "7deg" },
  { top: "60%", left: "6%", maxWidth: "12rem", rotate: "-5deg" },
  { top: "66%", right: "10%", maxWidth: "13rem", rotate: "6deg" },
  { top: "42%", left: "16%", maxWidth: "10rem", rotate: "5deg" },
  { top: "44%", right: "16%", maxWidth: "10rem", rotate: "-4deg" },
] as const;

function toExpression(mode: MarkMode) {
  if (mode === "wake") return "arrive" as const;
  if (mode === "listen") return "listen" as const;
  if (mode === "answer") return "speak" as const;
  if (mode === "reveal") return "gift" as const;
  return "rest" as const;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function trimResidue(text: string, limit = 92) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1).trim()}…`;
}

export function ThirdSignalVoidRenderer({
  surface,
  onAction,
}: {
  surface: ThirdSignalVoidSurface;
  onAction: (action: ThirdSignalVoidAction) => void;
}) {
  const componentsById = new Map(surface.components.map(component => [component.id, component]));
  const stage = surface.components.find(
    component => component.component === "VoidStage"
  ) as Extract<ThirdSignalVoidComponent, { component: "VoidStage" }> | undefined;

  if (!stage) return null;

  const children = stage.children
    .map(id => componentsById.get(id))
    .filter((component): component is ThirdSignalVoidComponent => Boolean(component));

  const halo = children.find(
    component => component.component === "SignalHalo"
  ) as Extract<ThirdSignalVoidComponent, { component: "SignalHalo" }> | undefined;
  const mark = children.find(
    component => component.component === "MarkCore"
  ) as Extract<ThirdSignalVoidComponent, { component: "MarkCore" }> | undefined;
  const whisper = children.find(
    component => component.component === "WhisperText"
  ) as Extract<ThirdSignalVoidComponent, { component: "WhisperText" }> | undefined;
  const residue = children.find(
    component => component.component === "ResidueTrail"
  ) as Extract<ThirdSignalVoidComponent, { component: "ResidueTrail" }> | undefined;
  const hold = children.find(
    component => component.component === "HoldToSpeakGlyph"
  ) as Extract<ThirdSignalVoidComponent, { component: "HoldToSpeakGlyph" }> | undefined;
  const interruption = children.find(
    component => component.component === "InterruptionHint"
  ) as Extract<ThirdSignalVoidComponent, { component: "InterruptionHint" }> | undefined;
  const apparition = children.find(
    component => component.component === "ApparitionImage"
  ) as Extract<ThirdSignalVoidComponent, { component: "ApparitionImage" }> | undefined;
  const sigils = children.find(
    component => component.component === "ChoiceSigil"
  ) as Extract<ThirdSignalVoidComponent, { component: "ChoiceSigil" }> | undefined;
  const portal = children.find(
    component => component.component === "RevealPortal"
  ) as Extract<ThirdSignalVoidComponent, { component: "RevealPortal" }> | undefined;

  const stageGlow = {
    idle: "radial-gradient(circle_at_50%_50%,rgba(86,224,255,0.12),transparent_26%), radial-gradient(circle_at_50%_65%,rgba(10,34,48,0.22),transparent_42%)",
    wake: "radial-gradient(circle_at_50%_48%,rgba(86,224,255,0.18),transparent_28%), radial-gradient(circle_at_50%_65%,rgba(21,47,72,0.24),transparent_46%)",
    listening:
      "radial-gradient(circle_at_50%_48%,rgba(86,224,255,0.22),transparent_28%), radial-gradient(circle_at_50%_60%,rgba(16,78,110,0.20),transparent_44%)",
    answering:
      "radial-gradient(circle_at_50%_45%,rgba(145,231,255,0.18),transparent_26%), radial-gradient(circle_at_50%_65%,rgba(34,64,88,0.24),transparent_44%)",
    reveal:
      "radial-gradient(circle_at_50%_44%,rgba(232,213,160,0.18),transparent_26%), radial-gradient(circle_at_50%_65%,rgba(46,35,17,0.26),transparent_44%)",
  } as const;

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-80"
          animate={{ opacity: [0.48, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ backgroundImage: stageGlow[stage.state] }}
        />
        {residue && (
          <>
            {residue.items.slice(-residue.maxVisible).map((item, index) => {
              const slot = residueSlots[index % residueSlots.length];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96 }}
                  animate={{ opacity: 0.22, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 0.7, delay: index * 0.05 }}
                  className="absolute hidden text-sm leading-7 text-[#8FB9CE]/70 md:block"
                  style={slot}
                >
                  <p
                    className="text-balance"
                    style={{
                      transform: `rotate(${slot.rotate})`,
                      maxWidth: slot.maxWidth,
                      fontFamily:
                        item.role === "user"
                          ? '"Satoshi", "Inter", sans-serif'
                          : '"Cormorant Garamond", serif',
                      fontStyle: item.role === "user" ? "normal" : "italic",
                    }}
                  >
                    {trimResidue(item.text)}
                  </p>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <AnimatePresence>
          {interruption && (
            <motion.div
              initial={{ opacity: 0, y: -16, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
              className="absolute left-1/2 top-24 z-30 w-[min(92vw,38rem)] -translate-x-1/2 rounded-full border px-5 py-3 text-center text-sm backdrop-blur-md"
              style={{
                borderColor:
                  interruption.tone === "warning"
                    ? "rgba(246, 199, 139, 0.18)"
                    : "rgba(125, 224, 255, 0.18)",
                background:
                  interruption.tone === "warning"
                    ? "rgba(13, 10, 8, 0.72)"
                    : "rgba(4, 9, 12, 0.72)",
                color:
                  interruption.tone === "warning" ? "#E8CBA2" : "#BCEBFF",
              }}
            >
              <p>{interruption.text}</p>
              {interruption.action && interruption.actionLabel && (
                <button
                  type="button"
                  onClick={() => onAction(interruption.action!)}
                  className="mt-2 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.36em] text-inherit/80 transition hover:text-inherit"
                >
                  {interruption.actionLabel}
                  <Type className="h-3.5 w-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pb-36 pt-24">
          {apparition && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, filter: "blur(24px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              className="pointer-events-auto absolute inset-x-4 top-24 mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_32px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl md:inset-x-auto md:right-10 md:top-1/2 md:w-[26rem] md:-translate-y-1/2"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black/40">
                <img
                  src={apparition.src}
                  alt={apparition.caption ?? "Signal apparition"}
                  className="h-full w-full object-cover opacity-88"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      apparition.treatment === "mist"
                        ? "radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_62%)"
                        : apparition.treatment === "glass"
                          ? "linear-gradient(180deg,rgba(255,255,255,0.14),transparent_60%)"
                          : "radial-gradient(circle_at_50%_40%,rgba(86,224,255,0.16),transparent_58%)",
                  }}
                />
              </div>
              {(apparition.caption || apparition.actionLabel) && (
                <div className="space-y-4 p-5 text-left">
                  {apparition.caption && (
                    <p
                      className="text-lg leading-8 text-[#EAF9FF]"
                      style={{ fontFamily: '"Cormorant Garamond", serif' }}
                    >
                      {apparition.caption}
                    </p>
                  )}
                  {apparition.action && apparition.actionLabel && (
                    <button
                      type="button"
                      onClick={() => onAction(apparition.action!)}
                      className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.36em] text-[#BEEBFF]/72 transition hover:text-[#EAF9FF]"
                    >
                      {apparition.actionLabel}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {halo && (
            <motion.div
              aria-hidden
              className="absolute left-1/2 top-1/2 aspect-square w-[min(72vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/14"
              animate={{
                scale:
                  halo.pulseMode === "listening"
                    ? [0.96, 1.08, 0.96]
                    : halo.pulseMode === "answer"
                      ? [0.98, 1.05, 0.98]
                      : halo.pulseMode === "reveal"
                        ? [1, 1.1, 1]
                        : [1, 1.03, 1],
                opacity: [0.18 + clamp01(halo.intensity) * 0.15, 0.42 + clamp01(halo.intensity) * 0.28, 0.18 + clamp01(halo.intensity) * 0.15],
              }}
              transition={{ duration: 4.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-[10%] rounded-full border border-[#56E0FF]/10"
                animate={{
                  scale: halo.pulseMode === "reveal" ? [0.98, 1.08, 0.98] : [1.02, 0.98, 1.02],
                  opacity: [0.12, 0.34, 0.12],
                }}
                transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
            </motion.div>
          )}

          {mark && (
            <motion.div
              className="relative z-10 flex aspect-square w-[min(74vw,30rem)] items-center justify-center"
              animate={{ scale: stage.state === "answering" ? 1.015 : 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-[22%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_66%)] opacity-70"
                animate={{ opacity: [0.42, 0.76, 0.46] }}
                transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <ThirdMarkGlyph
                expression={toExpression(mark.mode)}
                size={mark.size === "xl" ? 228 : mark.size === "lg" ? 196 : 160}
              />
            </motion.div>
          )}

          {whisper && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[18vh] z-20 px-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={whisper.text}
                  initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-4xl text-center"
                >
                  <p className="mb-4 text-[10px] uppercase tracking-[0.5em] text-[#86CDE5]/56">
                    {whisper.speaker === "user"
                      ? "What you said"
                      : whisper.speaker === "guide"
                        ? "Threshold"
                        : "Signal Card"}
                  </p>
                  <p
                    className="text-pretty text-3xl leading-[1.18] text-[#EAF9FF] sm:text-4xl lg:text-5xl"
                    style={{
                      fontFamily:
                        whisper.speaker === "user"
                          ? '"Satoshi", "Inter", sans-serif'
                          : '"Cormorant Garamond", serif',
                      fontStyle: whisper.speaker === "user" ? "normal" : "italic",
                      textShadow: "0 0 48px rgba(109, 207, 255, 0.12)",
                    }}
                  >
                    {whisper.text}
                    {whisper.streaming && (
                      <span className="ml-2 inline-block h-5 w-2 animate-pulse rounded-full bg-[#B8EFFF]/72 align-middle" />
                    )}
                  </p>
                  {whisper.echo && (
                    <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#93BCCE]/62">
                      {whisper.echo}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-10 z-20 px-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4">
            {portal && (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                disabled={portal.disabled}
                onClick={() => onAction(portal.action)}
                className="inline-flex items-center gap-3 rounded-full border border-[#7DE0FF]/20 bg-white/[0.04] px-6 py-3 text-[11px] uppercase tracking-[0.45em] text-[#EAF9FF] transition hover:border-[#7DE0FF]/34 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {portal.title}
                <ArrowUpRight className="h-4 w-4" />
              </motion.button>
            )}

            {hold && (
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.button
                  type="button"
                  onClick={() => onAction(hold.action)}
                  disabled={hold.disabled}
                  whileTap={{ scale: 0.98 }}
                  className="group inline-flex items-center gap-3 rounded-full border border-[#7DE0FF]/16 bg-white/[0.03] px-6 py-3 text-[11px] uppercase tracking-[0.45em] text-[#D8F6FF] transition hover:border-[#7DE0FF]/30 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {hold.active ? (
                    <Square className="h-4 w-4 fill-current" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                  {hold.label}
                </motion.button>
                {hold.secondaryAction && hold.secondaryLabel && (
                  <button
                    type="button"
                    onClick={() => onAction(hold.secondaryAction!)}
                    className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.38em] text-[#8AC6DC]/62 transition hover:text-[#DDF7FF]"
                  >
                    <Type className="h-3.5 w-3.5" />
                    {hold.secondaryLabel}
                  </button>
                )}
              </div>
            )}

            {sigils && sigils.choices.length > 0 && (
              <div className="flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4">
                {sigils.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.78, y: 0 }}
                    transition={{ delay: 0.18 + index * 0.08 }}
                    onClick={() => onAction(choice.action)}
                    className="rounded-full border border-white/8 bg-white/[0.025] px-4 py-2 text-[11px] tracking-[0.22em] text-[#9EC8DA]/76 transition hover:border-[#7DE0FF]/24 hover:text-[#EAF9FF]"
                  >
                    {choice.label}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

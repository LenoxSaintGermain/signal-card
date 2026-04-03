import { CinematicWordReveal } from "@/components/third-mark/CinematicWordReveal";
import { ThirdMarkGlyph } from "@/components/third-mark/ThirdMarkGlyph";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Mic, Type } from "lucide-react";

export const THIRD_SIGNAL_VOID_CATALOG_ID =
  "https://thirdsignal.ai/a2ui/catalogs/thirdsignal-void/v0.1";

type VoidStageState = "idle" | "wake" | "listening" | "answering" | "reveal";
type MarkMode = "idle" | "wake" | "listen" | "answer" | "reveal";
type PulseMode = "idle" | "wake" | "listening" | "answer" | "reveal" | "error";
type WhisperMode = "fragment" | "resolved" | "echo";
type WhisperSpeaker = "guide" | "user" | "model";
type ApparitionTreatment = "mist" | "glass" | "signal";

const VOID_NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E";

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
      messageId?: string;
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

function pulseDuration(mode: PulseMode) {
  if (mode === "listening") return 1.8;
  if (mode === "answer") return 2.2;
  if (mode === "reveal") return 2.8;
  return 3.5;
}

function VoiceActivityBars() {
  return (
    <span className="inline-flex h-4 items-end gap-1" aria-hidden>
      {[0, 1, 2].map(index => (
        <motion.span
          key={index}
          className="w-[3px] rounded-full bg-current"
          animate={{
            scaleY: [0.32, 1, 0.42, 0.82, 0.32],
            opacity: [0.52, 1, 0.72, 0.92, 0.52],
          }}
          transition={{
            duration: 1.1,
            delay: index * 0.12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
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
    idle: "radial-gradient(circle_at_50%_45%,rgba(86,224,255,0.14),transparent_24%), radial-gradient(circle_at_50%_70%,rgba(10,34,48,0.22),transparent_46%)",
    wake: "radial-gradient(circle_at_50%_40%,rgba(86,224,255,0.2),transparent_28%), radial-gradient(circle_at_50%_66%,rgba(21,47,72,0.24),transparent_48%)",
    listening:
      "radial-gradient(circle_at_50%_38%,rgba(86,224,255,0.24),transparent_30%), radial-gradient(circle_at_50%_60%,rgba(16,78,110,0.22),transparent_44%)",
    answering:
      "radial-gradient(circle_at_50%_36%,rgba(145,231,255,0.2),transparent_28%), radial-gradient(circle_at_50%_64%,rgba(34,64,88,0.24),transparent_46%)",
    reveal:
      "radial-gradient(circle_at_50%_34%,rgba(232,213,160,0.18),transparent_28%), radial-gradient(circle_at_50%_65%,rgba(46,35,17,0.28),transparent_44%)",
  } as const;

  const pulseMode = halo?.pulseMode ?? "idle";
  const pulseColor =
    pulseMode === "reveal"
      ? "rgba(232, 213, 160, 0.18)"
      : pulseMode === "error"
        ? "rgba(246, 199, 139, 0.16)"
        : "rgba(94, 234, 212, 0.18)";

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-80"
          animate={{ opacity: [0.48, 0.72, 0.5] }}
          transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ backgroundImage: stageGlow[stage.state] }}
        />
        <motion.div
          className="absolute inset-0 opacity-[0.045] mix-blend-soft-light"
          animate={{ opacity: [0.03, 0.055, 0.04] }}
          transition={{ duration: 5.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ backgroundImage: `url("${VOID_NOISE_URL}")`, backgroundSize: "220px 220px" }}
        />
        <div
          className="absolute inset-0 opacity-[0.06] mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0, rgba(255,255,255,0) 1px)",
            backgroundSize: "100% 4px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_32%,rgba(0,0,0,0.72)_100%)]" />

        {residue && (
          <>
            {residue.items.slice(-residue.maxVisible).map((item, index) => {
              const slot = residueSlots[index % residueSlots.length];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, filter: "blur(16px)", scale: 0.96 }}
                  animate={{ opacity: 0.16, filter: "blur(0px)", scale: 1 }}
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

        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 pb-36 pt-24 sm:pb-40 md:pb-44">
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
              className="absolute left-1/2 top-[38%] aspect-square w-[min(70vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7DE0FF]/14 sm:top-[40%] md:top-[42%] md:w-[min(54vw,29rem)]"
              animate={{
                scale:
                  halo.pulseMode === "listening"
                    ? [0.96, 1.1, 0.96]
                    : halo.pulseMode === "answer"
                      ? [0.98, 1.06, 0.98]
                      : halo.pulseMode === "reveal"
                        ? [1, 1.1, 1]
                        : [1, 1.04, 1],
                opacity: [
                  0.18 + clamp01(halo.intensity) * 0.12,
                  0.34 + clamp01(halo.intensity) * 0.34,
                  0.18 + clamp01(halo.intensity) * 0.12,
                ],
                boxShadow: [
                  `0 0 0 rgba(94,234,212,0)`,
                  `0 0 48px ${pulseColor}`,
                  `0 0 0 rgba(94,234,212,0)`,
                ],
              }}
              transition={{
                duration: pulseDuration(halo.pulseMode),
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="absolute inset-[10%] rounded-full border border-[#56E0FF]/10"
                animate={{
                  scale: halo.pulseMode === "reveal" ? [0.98, 1.08, 0.98] : [1.02, 0.98, 1.02],
                  opacity: [0.12, 0.34, 0.12],
                }}
                transition={{
                  duration: Math.max(1.6, pulseDuration(halo.pulseMode) - 0.5),
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}

          {mark && (
            <motion.div
              className="relative z-10 flex aspect-square w-[min(58vw,18rem)] items-center justify-center sm:w-[min(48vw,20rem)] md:w-[min(38vw,23rem)] lg:w-[min(34vw,26rem)]"
              animate={{ scale: stage.state === "answering" ? 1.015 : 1, y: stage.state === "wake" ? -4 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait">
                {pulseMode !== "idle" && (
                  <motion.div
                    key={pulseMode}
                    aria-hidden
                    initial={{ opacity: 0.34, scale: 0.82 }}
                    animate={{ opacity: 0, scale: 1.14 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.62, ease: "easeOut" }}
                    className="absolute inset-[14%] rounded-full"
                    style={{ boxShadow: `0 0 40px ${pulseColor}` }}
                  />
                )}
              </AnimatePresence>
              <motion.div
                className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_66%)] opacity-70"
                animate={{ opacity: [0.34, 0.76, 0.42], scale: [0.96, 1.05, 0.98] }}
                transition={{
                  duration: pulseDuration(pulseMode),
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <ThirdMarkGlyph
                expression={toExpression(mark.mode)}
                size={mark.size === "xl" ? 216 : mark.size === "lg" ? 184 : 152}
              />
            </motion.div>
          )}

          {whisper && (
            <div className="absolute inset-x-0 bottom-[20vh] z-20 px-5 sm:bottom-[21vh] sm:px-6 md:bottom-[22vh]">
              <div className="mx-auto max-w-[min(90vw,44rem)] text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={whisper.messageId ?? whisper.text}
                    initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(10px)" }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="relative rounded-[2rem] px-3 py-5"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_15%,rgba(20,41,56,0.3),rgba(1,2,4,0)_68%)]" />
                    <p className="relative mb-4 text-[10px] uppercase tracking-[0.5em] text-[#86CDE5]/56">
                      {whisper.speaker === "user"
                        ? "What you said"
                        : whisper.speaker === "guide"
                          ? "Threshold"
                          : "Signal Card"}
                    </p>
                    <div
                      className="relative pointer-events-auto mx-auto max-h-[26vh] overflow-y-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-h-[30vh] md:max-h-[34vh]"
                      style={{
                        maskImage:
                          "linear-gradient(to bottom, transparent 0%, black 10%, black 76%, transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent 0%, black 10%, black 76%, transparent 100%)",
                      }}
                    >
                      <CinematicWordReveal
                        text={whisper.text}
                        className="text-pretty text-[clamp(1.9rem,7.1vw,4.7rem)] leading-[1.06] text-[#EAF9FF] sm:text-[clamp(2.35rem,5vw,4.9rem)]"
                        wordClassName="mr-[0.22em] inline-block align-baseline will-change-transform"
                        stagger={whisper.mode === "fragment" ? 0.028 : 0.045}
                        duration={0.2}
                        blur={4}
                        style={{
                          fontFamily:
                            whisper.speaker === "user"
                              ? '"Satoshi", "Inter", sans-serif'
                              : '"Cormorant Garamond", serif',
                          fontStyle: whisper.speaker === "user" ? "normal" : "italic",
                          textShadow: "0 0 48px rgba(109, 207, 255, 0.12)",
                        }}
                        cursor={whisper.streaming}
                      />
                    </div>
                    {whisper.echo && (
                      <p className="relative mx-auto mt-4 hidden max-w-xl text-sm leading-7 text-[#93BCCE]/56 md:block">
                        {whisper.echo}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-8 z-20 px-6 sm:bottom-10">
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
                  animate={
                    hold.active
                      ? {
                          boxShadow: [
                            "0 0 0 rgba(94,234,212,0)",
                            "0 0 36px rgba(94,234,212,0.14)",
                            "0 0 0 rgba(94,234,212,0)",
                          ],
                        }
                      : { boxShadow: "0 0 0 rgba(94,234,212,0)" }
                  }
                  transition={
                    hold.active
                      ? {
                          duration: 1.8,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }
                      : { duration: 0.2 }
                  }
                  className="group inline-flex items-center gap-3 rounded-full border border-[#7DE0FF]/16 bg-white/[0.03] px-6 py-3 text-[11px] uppercase tracking-[0.45em] text-[#D8F6FF] transition hover:border-[#7DE0FF]/30 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {hold.active ? <VoiceActivityBars /> : <Mic className="h-4 w-4" />}
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
                    className="max-w-[16rem] rounded-full border border-white/8 bg-white/[0.025] px-4 py-2 text-[11px] tracking-[0.22em] text-[#9EC8DA]/76 transition hover:border-[#7DE0FF]/24 hover:text-[#EAF9FF]"
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

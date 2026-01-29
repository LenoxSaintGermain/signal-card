import { AmbientParticles } from "@/components/AmbientParticles";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { HUDOverlay } from "@/components/HUDOverlay";
import { HypnoticWait } from "@/components/HypnoticWait";
import { InputMode } from "@/components/InputMode";
import { ScrollyTelling } from "@/components/ScrollyTelling";
import { Button } from "@/components/ui/button";
import { useCinematicIdle } from "@/hooks/useCinematicIdle";
import { animationPatterns, motionTokens } from "@/lib/motion-tokens";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { useEffect, useState } from "react";

// Decoding Text Effect
const DecodingText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText(
          text
            .split("")
            .map((letter, index) => {
              if (index < iteration) return text[index];
              return String.fromCharCode(65 + Math.floor(Math.random() * 26));
            })
            .join("")
        );
        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayText}</span>;
};

export default function Home() {
  const { isIdle, idleLayer } = useCinematicIdle();
  
  const [state, setState] = useState<
    "intro" | "confessional" | "processing" | "immersive"
  >("intro");
  
  const [storyboardData, setStoryboardData] = useState<any>(null);

  // Use tRPC mutation for real-time Gemini insights
  const generateInsight = trpc.insights.generate.useMutation({
    onSuccess: (data) => {
      setStoryboardData(data);
      setState("immersive");
    },
    onError: (error) => {
      console.error("Failed to generate insight:", error);
      setState("confessional");
    },
  });

  const handleStart = () => setState("confessional");

  const handleConfession = (input: string) => {
    setState("processing");
    // Call the backend API with Gemini integration
    generateInsight.mutate({
      signalId: "custom", // Placeholder as we are now free-form
      signalTitle: "Custom Input",
      signalTruth: "User Defined",
      role: "Executive", // Could be extracted from input via AI in future
      industry: "General", // Could be extracted
      rawInput: input, // Pass the raw confession
    } as any); // Type assertion needed until client-side types fully update
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative selection:bg-cyan-500/30">
      {/* Immersive Background Layer */}
      <BackgroundLayer
        type="gradient"
        fallbackGradient="from-slate-950 via-slate-900 to-slate-950"
      />

      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Ambient Particles (Idle State) */}
      <AmbientParticles active={idleLayer === "signalDrift"} />

      {/* Main Content */}
      <div className={`relative z-20 container max-w-5xl mx-auto px-4 sm:px-6 min-h-[100dvh] flex flex-col justify-center py-20 sm:py-0 ${state === 'immersive' ? 'h-auto py-0' : ''}`}>
        <AnimatePresence mode="wait">
          {/* STATE 1: INTRO */}
          {state === "intro" && (
            <motion.div
              key="intro"
              {...animationPatterns.sceneWipe}
              className="space-y-8 sm:space-y-10 text-center"
            >
              {/* System Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: motionTokens.duration.md }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 text-cyan-400 text-[10px] font-mono tracking-[0.3em] uppercase shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                System Online
              </motion.div>

              {/* Hero Title with Decoding Effect */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: motionTokens.duration.lg }}
                className="font-display font-bold text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]"
              >
                <DecodingText text="THIRD SIGNAL" delay={600} />{" "}
                <span className="text-primary font-light block sm:inline">
                  <DecodingText text="LABS" delay={1200} />
                </span>
              </motion.h1>

              {/* Divider Line */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 1.8, duration: motionTokens.duration.lg }}
                className="flex items-center justify-center gap-4"
              >
                <div className="h-px w-8 sm:w-16 bg-cyan-500/40" />
                <p className="text-sm sm:text-lg md:text-xl font-light font-sans tracking-[0.25em] text-slate-300 uppercase">
                  Operational
                </p>
                <div className="h-px w-8 sm:w-16 bg-cyan-500/40" />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: motionTokens.duration.md }}
                className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light px-4"
              >
                Most enterprises are drowning in noise.
                <br />
                <span className="text-white font-medium">
                  Let's find your signal.
                </span>
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.6, duration: motionTokens.duration.md }}
              >
                <Button
                  size="lg"
                  onClick={handleStart}
                  className="group relative h-14 sm:h-16 px-8 sm:px-10 text-sm sm:text-base font-bold font-mono tracking-widest uppercase bg-cyan-950/30 border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)] transition-all duration-300 overflow-hidden w-full sm:w-auto"
                  style={{
                    clipPath:
                      "polygon(8% 0, 100% 0, 100% 70%, 92% 100%, 0 100%, 0 30%)",
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Zap size={20} className="animate-pulse" />
                    Initialize Analysis
                    <ArrowRight size={18} />
                  </span>
                  <div className="absolute inset-0 bg-cyan-400/5 translate-y-full transition-transform duration-200 group-hover:translate-y-0" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* STATE 2: CONFESSIONAL */}
          {state === "confessional" && (
            <motion.div
              key="confessional"
              {...animationPatterns.sceneWipe}
              className="w-full"
            >
              <InputMode onCommit={handleConfession} />
            </motion.div>
          )}

          {/* STATE 3: PROCESSING */}
          {state === "processing" && (
            <motion.div
              key="processing"
              {...animationPatterns.sceneWipe}
              className="w-full"
            >
              <HypnoticWait />
            </motion.div>
          )}

          {/* STATE 4: IMMERSIVE SCROLLYTELLING */}
          {state === "immersive" && storyboardData && (
            <motion.div
              key="immersive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 w-full min-h-screen z-50 bg-black"
            >
              <ScrollyTelling 
                storyboard={storyboardData.storyboard} 
                finalCta={storyboardData.final_cta}
                onRestart={() => setState("intro")} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

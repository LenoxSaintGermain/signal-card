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
import { ArrowRight, Zap, Film } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

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
  const { idleLayer } = useCinematicIdle();
  
  const [state, setState] = useState<
    "intro" | "confessional" | "processing" | "immersive"
  >("intro");
  
  const [storyboardData, setStoryboardData] = useState<any>(null);
  const [movieSlug, setMovieSlug] = useState<string | null>(null);
  const [lastConfession, setLastConfession] = useState<string | null>(null);

  const { data: savedMovie } = trpc.cinema.get.useQuery(
    { slug: movieSlug ?? "" },
    {
      enabled: !!movieSlug,
      refetchInterval: query => {
        const data = query.state.data;
        const scenes = (data?.storyboard as { storyboard?: Array<{ video_url?: string }> } | undefined)?.storyboard;
        if (!Array.isArray(scenes)) return 5000;
        const missing = scenes.some((scene: any) => !scene?.video_url);
        return missing ? 5000 : false;
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

  // tRPC mutations
  const saveToCinema = trpc.cinema.save.useMutation();
  const generateInsight = trpc.insights.generate.useMutation({
    onSuccess: async (data) => {
      const payload =
        lastConfession && lastConfession.trim().length > 0
          ? { ...data, raw_input: lastConfession }
          : data;

      setStoryboardData(payload);
      setState("immersive");
      
      // Auto-save to cinema for persistence
      try {
        const saveResult = await saveToCinema.mutateAsync({
          title: data.title,
          storyboard: payload,
          finalCta: data.final_cta,
          role: "Executive", // TODO: Persist these from input
          industry: "General",
        });
        setMovieSlug(saveResult.slug);
      } catch (err) {
        console.error("Failed to save to cinema:", err);
      }
    },
    onError: (error) => {
      console.error("Failed to generate insight:", error);
      setState("confessional");
    },
  });

  const handleStart = () => setState("confessional");

  const handleConfession = (input: string) => {
    setLastConfession(input);
    setState("processing");
    // Call the backend API with Gemini integration
    generateInsight.mutate({
      signalId: "custom", // Placeholder as we are now free-form
      signalTitle: "Custom Input",
      signalTruth: "User Defined",
      role: "Executive", // Could be extracted from input via AI in future
      industry: "General", // Could be extracted
      rawInput: input, // Pass the raw confession
    });
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden relative selection:bg-emerald-200/30">
      {/* Immersive Background Layer */}
      <BackgroundLayer
        type="gradient"
        fallbackGradient="from-[#0B0D12] via-[#0F1320] to-[#0B0D12]"
      />

      {/* HUD Overlay */}
      <HUDOverlay />

      {/* Ambient Particles (Idle State) */}
      <AmbientParticles active={idleLayer === "signalDrift"} />

      {/* Main Content */}
      <div className={`relative z-20 container max-w-5xl mx-auto px-4 sm:px-6 min-h-[100dvh] flex flex-col justify-center py-20 sm:py-0 ${state === 'immersive' ? 'h-auto py-0' : ''}`}>
        
        {/* Cinema Link (Top Right) */}
        {state === 'intro' && (
          <div className="absolute top-24 right-6 z-50">
            <Link href="/cinema">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5 font-mono text-xs tracking-[0.3em] uppercase">
                <Film className="w-4 h-4 mr-2 text-emerald-200" />
                Cinema Archives
              </Button>
            </Link>
          </div>
        )}

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
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-emerald-200 text-[10px] font-mono tracking-[0.35em] uppercase shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
              >
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
                Signal Engine Live
              </motion.div>

              {/* Hero Title with Decoding Effect */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: motionTokens.duration.lg }}
                className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-none text-white"
              >
                <span className="bg-gradient-to-r from-white via-slate-200 to-emerald-200 bg-clip-text text-transparent">
                  <DecodingText text="THIRD SIGNAL" delay={600} />
                </span>{" "}
                <span className="text-emerald-200 font-normal block sm:inline">
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
                <div className="h-px w-10 sm:w-20 bg-white/15" />
                <p className="text-xs sm:text-sm md:text-base font-medium font-mono tracking-[0.5em] text-slate-300 uppercase">
                  Precision Signal
                </p>
                <div className="h-px w-10 sm:w-20 bg-white/15" />
              </motion.div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: motionTokens.duration.md }}
                className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light px-4"
              >
                Replace reactive firefighting with deliberate signal design.
                <br />
                <span className="text-white font-medium">
                  Build clarity your teams can execute.
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
                  className="group relative h-14 sm:h-16 px-10 sm:px-12 text-xs sm:text-sm font-semibold font-mono tracking-[0.45em] uppercase bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:shadow-[0_20px_60px_rgba(94,234,212,0.2)] transition-all duration-300 overflow-hidden w-full sm:w-auto rounded-full"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Zap size={18} className="text-emerald-200" />
                    Start Calibration
                    <ArrowRight size={18} />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/10 via-transparent to-sky-200/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
              className="absolute inset-0 w-full min-h-screen z-50 bg-[#0B0D12]"
            >
              <ScrollyTelling 
                storyboard={storyboardData.storyboard} 
                finalCta={storyboardData.final_cta}
                onRestart={() => {
                  setLastConfession(null);
                  setMovieSlug(null);
                  setStoryboardData(null);
                  setState("intro");
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

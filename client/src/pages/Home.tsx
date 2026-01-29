import { AmbientParticles } from "@/components/AmbientParticles";
import { Atlas } from "@/components/Atlas";
import { BackgroundLayer } from "@/components/BackgroundLayer";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { HUDOverlay } from "@/components/HUDOverlay";
import { useCinematicIdle } from "@/hooks/useCinematicIdle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INDUSTRIES, ROLES, SIGNALS, Signal } from "@/lib/signals";
import { animationPatterns, motionTokens } from "@/lib/motion-tokens";
import { trpc } from "@/lib/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Terminal, Zap } from "lucide-react";
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
    "intro" | "calibration" | "emailCapture" | "processing" | "insight"
  >("intro");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [scenario, setScenario] = useState<any>(null);

  // Use tRPC mutation for real-time Gemini insights
  const generateInsight = trpc.insights.generate.useMutation({
    onSuccess: (data) => {
      setScenario(data);
      setState("insight");
    },
    onError: (error) => {
      console.error("Failed to generate insight:", error);
      setState("calibration");
    },
  });

  const handleStart = () => setState("calibration");

  const handleCalibrate = async () => {
    if (!selectedRole || !selectedIndustry || !selectedSignal) return;
    setState("emailCapture");
  };

  const handleEmailCaptured = () => {
    if (!selectedSignal) return;
    setState("processing");

    // Call the backend API with Gemini integration
    generateInsight.mutate({
      signalId: selectedSignal.id,
      signalTitle: selectedSignal.title,
      signalTruth: selectedSignal.truth,
      role: selectedRole,
      industry: selectedIndustry,
    });
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
      <div className="relative z-20 container max-w-5xl mx-auto px-4 sm:px-6 min-h-[100dvh] flex flex-col justify-center py-20 sm:py-0">
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

          {/* STATE 2: CALIBRATION */}
          {state === "calibration" && (
            <motion.div
              key="calibration"
              {...animationPatterns.sceneWipe}
              className="space-y-8"
            >
              {/* Glass Card Container */}
              <Card className="p-8 md:p-12 bg-slate-900/40 backdrop-blur-xl border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                <div className="space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[9px] font-mono tracking-widest uppercase">
                      <Terminal size={12} />
                      Calibration Mode
                    </div>
                    <h2 className="font-display font-bold text-3xl md:text-5xl text-white">
                      Initialize Your Profile
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                      Help us understand your context to generate a bespoke
                      strategic insight.
                    </p>
                  </div>

                  {/* Input Grid */}
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Role Selection */}
                    <motion.div
                      initial={{ opacity: 0, x: -motionTokens.distance.shift }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: motionTokens.stagger.sm,
                        duration: motionTokens.duration.md,
                      }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
                        Your Role
                      </label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="bg-slate-950/60 border-cyan-500/30 text-white hover:border-cyan-400/50 transition-colors">
                          <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Industry Selection */}
                    <motion.div
                      initial={{ opacity: 0, y: motionTokens.distance.shift }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: motionTokens.stagger.sm * 2,
                        duration: motionTokens.duration.md,
                      }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
                        Industry
                      </label>
                      <Select
                        value={selectedIndustry}
                        onValueChange={setSelectedIndustry}
                      >
                        <SelectTrigger className="bg-slate-950/60 border-cyan-500/30 text-white hover:border-cyan-400/50 transition-colors">
                          <SelectValue placeholder="Select industry..." />
                        </SelectTrigger>
                        <SelectContent>
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Signal Selection */}
                    <motion.div
                      initial={{ opacity: 0, x: motionTokens.distance.shift }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: motionTokens.stagger.sm * 3,
                        duration: motionTokens.duration.md,
                      }}
                      className="space-y-2"
                    >
                      <label className="text-xs font-mono text-cyan-400/80 tracking-widest uppercase">
                        Core Challenge
                      </label>
                      <Select
                        value={selectedSignal?.id}
                        onValueChange={(id) =>
                          setSelectedSignal(
                            SIGNALS.find((s) => s.id === id) || null
                          )
                        }
                      >
                        <SelectTrigger className="bg-slate-950/60 border-cyan-500/30 text-white hover:border-cyan-400/50 transition-colors">
                          <SelectValue placeholder="Select signal..." />
                        </SelectTrigger>
                        <SelectContent>
                          {SIGNALS.map((signal) => (
                            <SelectItem key={signal.id} value={signal.id}>
                              {signal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  {/* Generate Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: motionTokens.stagger.sm * 4,
                      duration: motionTokens.duration.md,
                    }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      size="lg"
                      onClick={handleCalibrate}
                      disabled={
                        !selectedRole || !selectedIndustry || !selectedSignal
                      }
                      className="group relative h-14 px-12 text-base font-bold font-mono tracking-widest uppercase bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-3">
                        Generate Insight
                        <ArrowRight size={18} />
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STATE 3: EMAIL CAPTURE */}
          {state === "emailCapture" && (
            <motion.div
              key="emailCapture"
              {...animationPatterns.sceneWipe}
              className="flex flex-col items-center justify-center"
            >
              <EmailCaptureForm
                role={selectedRole}
                industry={selectedIndustry}
                signal={selectedSignal?.title || ""}
                onSuccess={handleEmailCaptured}
              />
            </motion.div>
          )}

          {/* STATE 4: PROCESSING */}
          {state === "processing" && (
            <motion.div
              key="processing"
              {...animationPatterns.sceneWipe}
              className="flex flex-col items-center justify-center space-y-8"
            >
              {/* Processing Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-32 h-32 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.4)]"
              />

              {/* Processing Text */}
              <div className="text-center space-y-4">
                <h2 className="font-display font-bold text-3xl md:text-5xl text-white">
                  <DecodingText text="ANALYZING SIGNAL" />
                </h2>
                <div className="font-mono text-sm text-cyan-400/60 tracking-wider space-y-1">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    &gt; Initializing AI inference engine...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    &gt; Analyzing industry context...
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                  >
                    &gt; Generating strategic vignette...
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STATE 4: INSIGHT */}
          {state === "insight" && scenario && (
            <motion.div
              key="insight"
              {...animationPatterns.sceneWipe}
              className="space-y-8"
            >
              {/* Glass Card with Insight */}
              <Card className="p-8 md:p-12 bg-slate-900/40 backdrop-blur-xl border-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.15)]">
                <div className="space-y-8">
                  {/* Header Badge */}
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono tracking-widest uppercase">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Insight Generated
                    </div>
                  </div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: motionTokens.duration.md }}
                    className="font-display font-bold text-3xl md:text-5xl text-white leading-tight"
                  >
                    {scenario.title}
                  </motion.h2>

                  {/* Body */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: motionTokens.duration.md }}
                    className="prose prose-invert prose-cyan max-w-none"
                  >
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {scenario.body}
                    </p>
                  </motion.div>

                  {/* Implication */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: motionTokens.duration.md }}
                    className="p-6 bg-cyan-950/20 border-l-4 border-cyan-400 rounded-r-sm"
                  >
                    <h3 className="font-mono text-xs text-cyan-400 tracking-widest uppercase mb-3">
                      Strategic Implication
                    </h3>
                    <p className="text-slate-200 leading-relaxed">
                      {scenario.implication}
                    </p>
                  </motion.div>

                  {/* Metrics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: motionTokens.duration.md }}
                    className="grid gap-4 md:grid-cols-3"
                  >
                    {scenario.metrics.map((metric: string, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-950/60 border border-cyan-500/20 rounded-sm"
                      >
                        <p className="text-sm text-cyan-400 font-mono">
                          {metric}
                        </p>
                      </div>
                    ))}
                  </motion.div>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: motionTokens.duration.md }}
                    className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                  >
                    <Button
                      size="lg"
                      onClick={() => setState("calibration")}
                      variant="outline"
                      className="h-14 px-8 font-mono tracking-wider border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30"
                    >
                      Generate Another
                    </Button>
                    <Button
                      size="lg"
                      asChild
                      className="h-14 px-8 font-mono tracking-wider bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)]"
                    >
                      <a
                        href="https://cal.com/thirdsignal/strategy-session"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Deploy Intelligence
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

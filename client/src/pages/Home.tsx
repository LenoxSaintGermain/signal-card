import { Atlas } from "@/components/Atlas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateScenario } from "@/lib/scenario-generator";
import { INDUSTRIES, ROLES, SIGNALS, Signal } from "@/lib/signals";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronRight, Terminal } from "lucide-react";
import { useState } from "react";

// Typing Effect Component
const TypingText = ({ text, speed = 30, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useState(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i === text.length) {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(interval);
  });

  return <span>{displayedText}</span>;
};

export default function Home() {
  const [state, setState] = useState<"intro" | "calibration" | "processing" | "insight">("intro");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [scenario, setScenario] = useState<any>(null);

  const handleStart = () => setState("calibration");

  const handleCalibrate = async () => {
    if (!selectedRole || !selectedIndustry || !selectedSignal) return;
    setState("processing");
    const result = await generateScenario(selectedSignal, selectedRole, selectedIndustry);
    setScenario(result);
    setState("insight");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden relative">
      {/* Background Atlas */}
      <div className="fixed inset-0 z-0">
        <Atlas />
      </div>
      
      <div className="relative z-10 container max-w-4xl mx-auto px-6 min-h-screen flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          {/* STATE 1: INTRO */}
          {state === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono tracking-widest uppercase">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                System Online
              </div>
              
              <h1 className="font-display font-bold text-5xl md:text-7xl tracking-tight leading-none">
                THIRD SIGNAL <span className="text-primary font-light">LABS</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Most enterprises are drowning in noise. <br />
                <span className="text-foreground font-medium">Let's find your signal.</span>
              </p>

              <Button 
                size="lg" 
                className="h-14 px-8 text-lg gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                onClick={handleStart}
              >
                Initialize Analysis <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {/* STATE 2: CALIBRATION */}
          {state === "calibration" && (
            <motion.div
              key="calibration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-lg mx-auto space-y-6"
            >
              <div className="space-y-2 text-center mb-8">
                <h2 className="font-display text-3xl font-bold">Calibrate the Agent</h2>
                <p className="text-muted-foreground">Tell me your context so I can decode your reality.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Your Role</label>
                  <Select onValueChange={setSelectedRole}>
                    <SelectTrigger className="h-12 bg-card/50 backdrop-blur border-primary/20">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Industry</label>
                  <Select onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="h-12 bg-card/50 backdrop-blur border-primary/20">
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Core Challenge (The Signal)</label>
                  <Select onValueChange={(id) => setSelectedSignal(SIGNALS.find(s => s.id === id) || null)}>
                    <SelectTrigger className="h-12 bg-card/50 backdrop-blur border-primary/20">
                      <SelectValue placeholder="Select a Signal to Decode" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {SIGNALS.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="font-mono text-xs mr-2 text-primary">{s.id}</span>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedSignal && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground italic"
                >
                  "{selectedSignal.truth}"
                </motion.div>
              )}

              <Button 
                size="lg" 
                className="w-full h-14 text-lg gap-2 mt-4"
                disabled={!selectedRole || !selectedIndustry || !selectedSignal}
                onClick={handleCalibrate}
              >
                Run Simulation <Terminal size={18} />
              </Button>
            </motion.div>
          )}

          {/* STATE 3: PROCESSING */}
          {state === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-primary">
                  {selectedSignal?.id}
                </div>
              </div>
              
              <div className="space-y-2 font-mono text-sm text-primary">
                <p>Accessing Signal Atlas...</p>
                <p className="opacity-75">Analyzing {selectedIndustry} context...</p>
                <p className="opacity-50">Calibrating for {selectedRole}...</p>
                <p className="opacity-25">Generating Strategic Vignette...</p>
              </div>
            </motion.div>
          )}

          {/* STATE 4: INSIGHT */}
          {state === "insight" && scenario && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 font-mono text-primary font-bold">
                  {selectedSignal?.id}
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Signal Detected</div>
                  <h2 className="font-display text-2xl font-bold">{selectedSignal?.title}</h2>
                </div>
              </div>

              <Card className="bg-card/80 backdrop-blur border-primary/20 p-8 space-y-6 shadow-2xl">
                <h3 className="font-display text-xl font-medium text-primary">{scenario.title}</h3>
                <div className="prose prose-invert leading-relaxed text-muted-foreground">
                  <TypingText text={scenario.body} speed={10} />
                </div>
                
                <div className="p-4 rounded bg-primary/5 border-l-2 border-primary">
                  <p className="text-sm font-medium text-foreground">{scenario.implication}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  {scenario.metrics.map((m: string, i: number) => (
                    <div key={i} className="text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Projected</div>
                      <div className="font-mono font-bold text-primary">{m}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="h-16 text-lg gap-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                  onClick={() => window.open("https://cal.com/thirdsignal/strategy-session", "_blank")}
                >
                  Deploy This Intelligence <ChevronRight />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setState("calibration")}
                >
                  Run Another Simulation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

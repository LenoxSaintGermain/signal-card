import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Copy, ExternalLink, Github, Linkedin, Mail, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Signal Wave Component
const SignalWave = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <motion.path
          d="M0 50 Q 25 40, 50 50 T 100 50"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 50 Q 25 60, 50 50 T 100 50"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="0.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// Typing Effect Component
const TypingText = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        if (i === text.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span className={`font-mono ${className}`}>{displayedText}</span>;
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,22,40,0.8),rgba(0,0,0,1))] z-0" />
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-5 z-0 pointer-events-none" />
      <SignalWave />

      {/* Main Content */}
      <div className="relative z-10 container max-w-md mx-auto px-6 py-12 flex flex-col gap-24">
        
        {/* Header / Identity */}
        <motion.section 
          className="flex flex-col gap-6 pt-12"
          style={{ opacity, scale }}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-transparent border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            <span className="font-display font-bold text-2xl text-primary">3</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display font-bold text-4xl tracking-tight leading-none">
              THIRD SIGNAL <span className="text-primary font-light">LABS</span>
            </h1>
            <p className="text-muted-foreground font-mono text-sm tracking-wide">
              <TypingText text="DECODE. DEPLOY. DELIVER." delay={500} />
            </p>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
        </motion.section>

        {/* Capabilities / Acts */}
        <section className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-primary/80 font-mono text-xs uppercase tracking-widest">
              <Terminal size={12} />
              <span>01_Decode</span>
            </div>
            <h2 className="font-display text-2xl font-medium">Strategy & Signal Detection</h2>
            <p className="text-muted-foreground leading-relaxed">
              We filter noise to find the high-value AI use cases that actually move EBITDA. No hype, just math.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-primary/80 font-mono text-xs uppercase tracking-widest">
              <Terminal size={12} />
              <span>02_Deploy</span>
            </div>
            <h2 className="font-display text-2xl font-medium">Architecture & Prototypes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Rapid prototyping in the "Campground" before scaling to the "Bomb Factory." We build systems, not slide decks.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-primary/80 font-mono text-xs uppercase tracking-widest">
              <Terminal size={12} />
              <span>03_Deliver</span>
            </div>
            <h2 className="font-display text-2xl font-medium">Adoption & Outcomes</h2>
            <p className="text-muted-foreground leading-relaxed">
              Governance that accelerates innovation. We ensure your AI systems are adopted, safe, and profitable.
            </p>
          </motion.div>
        </section>

        {/* Proof of Thought */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full" />
          <Card className="relative bg-card/50 backdrop-blur-md border-primary/20 p-6 overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <blockquote className="font-display text-lg italic leading-relaxed text-foreground/90">
              "Enterprise AI succeeds when governance accelerates innovation instead of blocking it."
            </blockquote>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                {/* Placeholder for Lenox's avatar */}
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">LC</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Lenox Clairmont</div>
                <div className="text-xs text-muted-foreground">Founder, Third Signal Labs</div>
              </div>
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
          </Card>
        </motion.section>

        {/* Contact / Actions */}
        <section className="space-y-6 pb-24">
          <div className="grid grid-cols-1 gap-4">
            <Button 
              variant="outline" 
              className="h-14 justify-between px-6 border-primary/20 hover:bg-primary/10 hover:border-primary/50 group"
              onClick={() => window.location.href = "mailto:hello@thirdsignal.ai"}
            >
              <span className="flex items-center gap-3">
                <Mail className="text-primary" size={18} />
                <span className="font-medium">Email Me</span>
              </span>
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </Button>

            <Button 
              variant="outline" 
              className="h-14 justify-between px-6 border-primary/20 hover:bg-primary/10 hover:border-primary/50 group"
              onClick={() => window.open("https://linkedin.com/company/third-signal-labs", "_blank")}
            >
              <span className="flex items-center gap-3">
                <Linkedin className="text-primary" size={18} />
                <span className="font-medium">LinkedIn</span>
              </span>
              <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </Button>

            <Button 
              variant="outline" 
              className="h-14 justify-between px-6 border-primary/20 hover:bg-primary/10 hover:border-primary/50 group"
              onClick={() => window.open("https://thirdsignal.ai", "_blank")}
            >
              <span className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </div>
                <span className="font-medium">Signal Vault</span>
              </span>
              <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </Button>
          </div>

          <div className="pt-8 flex justify-center gap-6 text-muted-foreground">
            <button onClick={() => copyToClipboard("hello@thirdsignal.ai", "Email")} className="hover:text-primary transition-colors">
              <Copy size={20} />
            </button>
            <a href="https://github.com/LenoxSaintGermain" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              <Github size={20} />
            </a>
          </div>
        </section>

        {/* Easter Egg / Footer */}
        <footer className="text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-mono text-primary/60 tracking-widest uppercase">
            System Status: Operational
          </div>
          <p className="text-[10px] text-muted-foreground/40 max-w-[200px] mx-auto leading-relaxed">
            This experience is assembled in real time by AI agents operating under the same principles we apply for clients.
          </p>
        </footer>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Scene {
  id: number;
  visual_prompt: string;
  text_overlay: string;
  video_style: string;
  mood: string;
  video_url?: string;
}

interface ScrollyTellingProps {
  storyboard: Scene[];
  finalCta: string;
  onRestart: () => void;
}

export function ScrollyTelling({ storyboard, finalCta, onRestart }: ScrollyTellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full bg-[#0B0D12] text-white">
      {storyboard.map((scene, index) => (
        <SceneSection key={scene.id} scene={scene} index={index} total={storyboard.length} />
      ))}
      
      {/* Final CTA Section */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center bg-[#0B0D12] z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 px-6"
        >
          <h2 className="font-display text-4xl md:text-6xl font-semibold text-white mb-4">
            {finalCta}
          </h2>
          <Button
            size="lg"
            className="rounded-full bg-emerald-300 text-slate-950 hover:bg-emerald-200 text-lg px-8 py-6"
            onClick={onRestart}
          >
            Begin New Calibration
          </Button>
        </motion.div>
      </section>
    </div>
  );
}

function SceneSection({ scene, index, total }: { scene: Scene; index: number; total: number }) {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const inView = useInView(ref, { margin: "200px 0px" });

  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.8, 1, 1.2]);

  useEffect(() => {
    if (inView) {
      setShouldLoad(true);
    }
  }, [inView]);

  return (
    <section ref={ref} className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
      {/* Generated Video Background */}
      {scene.video_url && shouldLoad ? (
        <video
          src={scene.video_url}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="absolute inset-0 z-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        /* Fallback colored background while video loads */
        <div className={`absolute inset-0 z-0 ${getBgColor(scene.mood)} opacity-40`} />
      )}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,7,10,0.9)_100%)]" />

      {!scene.video_url && (
        <div className="absolute bottom-10 right-10 z-10 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-200">
          Generating Visuals
        </div>
      )}
      
      {/* Content */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 max-w-4xl px-6 text-center"
      >
        <div className="mb-4 font-mono text-emerald-200 text-[11px] tracking-[0.35em] uppercase">
          Scene {index + 1} / {total}
        </div>
        <h3 className="font-display text-3xl md:text-5xl font-semibold leading-tight drop-shadow-2xl">
          {scene.text_overlay}
        </h3>
        <p className="mt-4 text-slate-400 text-xs font-mono uppercase tracking-[0.2em] opacity-70">
          {scene.video_style.toUpperCase()} · {scene.visual_prompt}
        </p>
      </motion.div>
    </section>
  );
}

function getBgColor(mood: string) {
  switch (mood) {
    case 'dark': return 'bg-slate-900';
    case 'bright': return 'bg-emerald-500/60';
    case 'urgent': return 'bg-rose-900';
    case 'calm': return 'bg-sky-900';
    default: return 'bg-slate-800';
  }
}

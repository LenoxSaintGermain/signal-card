import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface Scene {
  id: number;
  visual_prompt: string;
  text_overlay: string;
  video_style: string;
  mood: string;
}

interface ScrollyTellingProps {
  storyboard: Scene[];
  finalCta: string;
  onRestart: () => void;
}

export function ScrollyTelling({ storyboard, finalCta, onRestart }: ScrollyTellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full bg-black text-white">
      {storyboard.map((scene, index) => (
        <SceneSection key={scene.id} scene={scene} index={index} total={storyboard.length} />
      ))}
      
      {/* Final CTA Section */}
      <section className="h-screen sticky top-0 flex flex-col items-center justify-center bg-slate-900 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 px-6"
        >
          <h2 className="font-display text-5xl md:text-7xl font-bold text-white mb-4">
            {finalCta}
          </h2>
          <Button
            size="lg"
            className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 text-lg px-8 py-6"
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.8, 1, 1.2]);

  return (
    <section ref={ref} className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
      {/* Placeholder Visual (Simulating Video) */}
      <div className={`absolute inset-0 z-0 ${getBgColor(scene.mood)} opacity-40`} />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
      
      {/* Content */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 max-w-4xl px-6 text-center"
      >
        <div className="mb-4 font-mono text-cyan-500 text-xs tracking-widest uppercase">
          Sequence {index + 1} / {total}
        </div>
        <h3 className="font-display text-4xl md:text-6xl font-bold leading-tight drop-shadow-2xl">
          {scene.text_overlay}
        </h3>
        <p className="mt-4 text-slate-400 text-sm font-mono opacity-60">
          [{scene.video_style.toUpperCase()} :: {scene.visual_prompt}]
        </p>
      </motion.div>
    </section>
  );
}

function getBgColor(mood: string) {
  switch (mood) {
    case 'dark': return 'bg-slate-900';
    case 'bright': return 'bg-amber-500';
    case 'urgent': return 'bg-red-900';
    case 'calm': return 'bg-cyan-900';
    default: return 'bg-slate-800';
  }
}

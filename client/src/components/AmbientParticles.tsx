import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function AmbientParticles({ active = false }: { active?: boolean }) {
  const particles = useMemo(() => {
    const count = 6; // Max particles as per spec
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    })) as Particle[];
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            opacity: 0,
          }}
          animate={{
            x: `${particle.x + (Math.random() * 20 - 10)}vw`,
            y: `${particle.y + (Math.random() * 20 - 10)}vh`,
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute rounded-full bg-cyan-400/80 blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}
    </div>
  );
}

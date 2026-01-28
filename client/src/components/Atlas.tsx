import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Atlas = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center opacity-30 pointer-events-none">
      {/* Central Core */}
      <div className="absolute w-64 h-64 rounded-full border border-primary/20 animate-pulse" />
      <div className="absolute w-48 h-48 rounded-full border border-primary/40" />
      
      {/* Rotating Rings */}
      <motion.div 
        className="absolute w-96 h-96 rounded-full border border-dashed border-primary/10"
        style={{ rotate: rotation }}
      />
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-primary/5"
        style={{ rotate: -rotation * 0.5 }}
      />

      {/* Floating Nodes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary rounded-full"
          animate={{
            x: Math.cos((i * 45 + rotation) * (Math.PI / 180)) * 150,
            y: Math.sin((i * 45 + rotation) * (Math.PI / 180)) * 150,
            opacity: [0.2, 1, 0.2]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
};

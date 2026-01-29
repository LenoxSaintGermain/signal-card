import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function HypnoticWait() {
  const [message, setMessage] = useState("Initializing connection...");

  const messages = [
    "Analyzing your signal...",
    "Decoding industry patterns...",
    "Reframing the problem...",
    "Synthesizing future state...",
    "Compiling narrative arc...",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessage(messages[i % messages.length]);
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-12">
      {/* Hypnotic Visual */}
      <div className="relative w-64 h-64">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.8)]" />
        </div>
      </div>

      {/* Donna-style Text Stream */}
      <div className="h-12 overflow-hidden text-center">
        <motion.p
          key={message}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="font-mono text-cyan-400 text-sm tracking-widest uppercase"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}

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
    <div className="flex flex-col items-center justify-center space-y-10">
      <div className="w-[min(520px,90vw)] rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mb-8 text-xs font-mono uppercase tracking-[0.4em] text-slate-400">
          Signal Calibration
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-emerald-200 via-teal-300 to-sky-300"
            animate={{ x: ["-35%", "135%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="mt-6 h-10 overflow-hidden">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-sm font-mono uppercase tracking-[0.3em] text-emerald-200"
          >
            {message}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

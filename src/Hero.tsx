
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HolographicHero: React.FC = () => {
  const [text, setText] = useState("LOADING...");
  const targetText = "LENOX.AI";

  // Decoding Effect
  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setText(prev =>
        targetText.split("").map((letter, index) => {
          if (index < iteration) return targetText[index];
          return String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }).join("")
      );
      if (iteration >= targetText.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden selection:bg-cyan-500 selection:text-slate-900 font-sans">

      {/* Background Video Placeholder */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        {/* <video autoPlay loop muted className="w-full h-full object-cover">
             <source src="/assets/bg-loop.mp4" />
         </video> */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_70%)]"></div>
      </div>

      {/* Holo Grid Floor */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: 'center',
          transform: 'perspective(500px) rotateX(60deg) scale(2) translateY(100px)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)'
        }}
      ></div>

      {/* Scan Line */}
      <motion.div
        animate={{ top: ["-10%", "110%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-50 pointer-events-none"
      />

      {/* HUD Corners */}
      <div className="fixed top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/60 rounded-tl-sm pointer-events-none z-20"></div>
      <div className="fixed top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/60 rounded-tr-sm pointer-events-none z-20"></div>
      <div className="fixed bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/60 rounded-bl-sm pointer-events-none z-20"></div>
      <div className="fixed bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/60 rounded-br-sm pointer-events-none z-20"></div>

      {/* Status Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-12 left-0 w-full flex justify-center z-20"
      >
        <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 px-6 py-1 rounded-sm flex gap-8 text-[10px] uppercase font-mono tracking-widest text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <span>SYS.VER 9.2</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ONLINE</span>
          <span>SECURE.CONN</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-30 text-center px-6">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6"
        >
          <div className="text-xs font-mono text-cyan-500/70 tracking-[0.4em] uppercase border-b border-cyan-500/30 pb-2">Initializing Identity Matrix</div>
        </motion.div>

        <h1 className="text-7xl md:text-9xl font-bold font-sans tracking-tighter leading-none mb-4 text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
          <span className="font-mono">{text}</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <div className="h-px w-12 bg-cyan-500/50"></div>
          <p className="text-xl md:text-2xl font-light font-sans tracking-[0.2em] text-slate-300 uppercase">
            Operational
          </p>
          <div className="h-px w-12 bg-cyan-500/50"></div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="max-w-xl mx-auto text-sm font-mono text-cyan-200/60 mb-12 leading-relaxed tracking-wide"
        >
          Global Signal Orchestration & Reality Construction.<br />
          Wait for command input...
        </motion.p>

        {/* Tactical Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, textShadow: "0px 0px 8px rgb(6,182,212)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 1.5 }}
          className="group relative px-12 py-6 bg-cyan-950/30 border border-cyan-400 text-cyan-400 font-bold font-mono tracking-widest uppercase overflow-hidden"
          style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
        >
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-xl">⏻</span>
            Engage System
          </span>
          <div className="absolute inset-0 bg-cyan-400/10 translate-y-full transition-transform duration-200 group-hover:translate-y-0"></div>

          {/* Corner Decor */}
          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-white/50"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-white/50"></div>
        </motion.button>

      </div>

      {/* Side Data Columns */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 font-mono text-[9px] text-cyan-500/30 uppercase tracking-widest z-10"
      >
        <div>LAT: 40.7128</div>
        <div>LNG: -74.0060</div>
        <div>PSI: 1024</div>
        <div className="h-32 w-px bg-cyan-500/20 ml-1"></div>
      </motion.div>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 font-mono text-[9px] text-cyan-500/30 uppercase tracking-widest text-right z-10"
      >
        <div>MEM: 64TB</div>
        <div>CPU: 12%</div>
        <div>NET: 5G</div>
        <div class="h-32 w-px bg-cyan-500/20 mr-1 ml-auto"></div>
      </motion.div>

    </div>
  );
};

export default HolographicHero;

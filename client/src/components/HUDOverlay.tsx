import { motion } from "framer-motion";

export function HUDOverlay() {
  return (
    <>
      {/* Corner Decorations */}
      <div className="fixed top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-cyan-500/50 rounded-tl-sm pointer-events-none z-50" />
      <div className="fixed top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-cyan-500/50 rounded-tr-sm pointer-events-none z-50" />
      <div className="fixed bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-cyan-500/50 rounded-bl-sm pointer-events-none z-50" />
      <div className="fixed bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-cyan-500/50 rounded-br-sm pointer-events-none z-50" />

      {/* Status Bar */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.42 }}
        className="fixed top-12 left-0 w-full flex justify-center z-50 pointer-events-none"
      >
        <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 px-6 py-1.5 rounded-sm flex gap-8 text-[10px] uppercase font-mono tracking-widest text-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <span>SYS.VER 3.0</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
            ONLINE
          </span>
          <span>SECURE.CONN</span>
        </div>
      </motion.div>

      {/* Side Data Columns (Desktop Only) */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="fixed left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 font-mono text-[9px] text-cyan-500/25 uppercase tracking-widest z-40 pointer-events-none"
      >
        <div>LAT: 40.7128</div>
        <div>LNG: -74.0060</div>
        <div>PSI: 1024</div>
        <div className="h-32 w-px bg-cyan-500/15 ml-1" />
      </motion.div>

      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4 font-mono text-[9px] text-cyan-500/25 uppercase tracking-widest text-right z-40 pointer-events-none"
      >
        <div>MEM: 64TB</div>
        <div>CPU: 12%</div>
        <div>NET: 5G</div>
        <div className="h-32 w-px bg-cyan-500/15 mr-1 ml-auto" />
      </motion.div>
    </>
  );
}

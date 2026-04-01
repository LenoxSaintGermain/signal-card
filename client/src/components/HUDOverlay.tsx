import { motion } from "framer-motion";

export function HUDOverlay() {
  return (
    <>
      {/* Minimal Status Bar */}
      <motion.div
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="fixed top-6 left-0 w-full z-50 pointer-events-none"
      >
        <div className="mx-auto flex w-[min(1080px,92vw)] items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-2 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-[0.3em] text-slate-200/90">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Third Signal Labs
          </div>
          <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.25em] text-slate-300">
            <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              Signal Engine Online
            </span>
            <span className="text-slate-400">v3.4</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

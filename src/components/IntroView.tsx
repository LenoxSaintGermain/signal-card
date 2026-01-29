
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useSignal } from '../context/SignalContext';
import { playSignalSound } from '../lib/sound';

interface IntroViewProps {
  onComplete: () => void;
}

const IntroView: React.FC<IntroViewProps> = ({ onComplete }) => {
  const { addXP, triggerEasterEgg } = useSignal();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInteraction = (type: string) => {
    playSignalSound('tap');
    addXP(10, `Explored ${type}`);
  };

  const startLongPress = () => {
    timerRef.current = setTimeout(() => {
        triggerEasterEgg('longpress');
    }, 2000); // 2 seconds
  };

  const endLongPress = () => {
    if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      
      {/* Name / Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="mb-12 cursor-pointer select-none"
        onMouseDown={startLongPress}
        onMouseUp={endLongPress}
        onMouseLeave={endLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={endLongPress}
      >
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-wider text-white mb-2">
          LENOX WILLIAMS
        </h1>
        <p className="text-holo-cyan font-mono text-sm tracking-[0.2em]">
          THIRD SIGNAL // ARCHITECT
        </p>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 1 }}
        className="max-w-md mx-auto mb-16 relative"
      >
        <div className="absolute -left-4 -top-4 text-4xl text-white/10 font-serif">"</div>
        <p className="text-lg text-slate-300 font-light italic leading-relaxed">
          Most consultants tell you what AI can do. <br />
          <span className="text-white font-normal">I show you what it should do.</span>
        </p>
      </motion.div>

      {/* Interactive Orbs */}
      <motion.div 
        className="flex gap-8 md:gap-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
      >
        {[
          { id: 'strategy', label: 'STRATEGY', icon: '🎯' },
          { id: 'execution', label: 'EXECUTION', icon: '💰' },
          { id: 'future', label: 'FUTURE', icon: '🔮' }
        ].map((item, index) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleInteraction(item.label);
              if (item.id === 'strategy') onComplete(); // Proceed to narrative
            }}
            className="group flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center text-2xl group-hover:border-holo-cyan/50 group-hover:bg-holo-cyan/10 transition-colors relative overflow-hidden">
               <div className="absolute inset-0 bg-holo-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <span className="relative z-10">{item.icon}</span>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-holo-cyan transition-colors tracking-widest">
              {item.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.0 }}
        className="absolute bottom-8 text-[10px] text-slate-700 font-mono"
      >
        EST. 2026 // SIGNAL CARD v1.0
      </motion.p>
    </div>
  );
};

export default IntroView;

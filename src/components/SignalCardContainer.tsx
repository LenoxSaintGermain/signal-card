
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignal } from '../context/SignalContext';
import { useShake } from '../hooks/useShake';
import IntroView from './IntroView';
import BranchingNarrative from './BranchingNarrative';
import ArtifactGenerator from './ArtifactGenerator';

const SignalCardContainer: React.FC = () => {
  const { state, triggerEasterEgg } = useSignal();
  const [view, setView] = useState<'intro' | 'narrative' | 'tools'>('intro');

  // Easter Egg: Shake Detection
  useShake(() => {
    triggerEasterEgg('shake');
    // Optional: Show a visual cue here via local state
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-void-black text-white selection:bg-holo-cyan/30">
        
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-void-black to-black"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center"></div>
        </div>

        {/* HUD Overlay (Fixed) */}
        <div className="absolute top-4 left-4 z-50 font-mono text-[10px] text-holo-cyan/60 flex flex-col gap-1 pointer-events-none">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ONLINE</span>
            </div>
            <span>XP: {state.xp}</span>
            <span>STREAK: {state.streak}</span>
            <span>DISCOVERIES: {state.discoveries.length}/5</span>
        </div>

        <div className="relative z-10 h-full">
            <AnimatePresence mode="wait">
                {view === 'intro' && (
                    <motion.div 
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        className="h-full"
                    >
                        <IntroView onComplete={() => setView('narrative')} />
                    </motion.div>
                )}

                {view === 'narrative' && (
                    <motion.div
                        key="narrative"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50, filter: 'blur(10px)' }}
                        className="h-full"
                    >
                        <BranchingNarrative onUnlockTool={() => setView('tools')} />
                    </motion.div>
                )}

                {view === 'tools' && (
                    <motion.div
                        key="tools"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full"
                    >
                        <ArtifactGenerator />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

    </div>
  );
};

export default SignalCardContainer;

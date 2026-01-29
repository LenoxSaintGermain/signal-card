
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignal } from '../context/SignalContext';
import { playSignalSound } from '../lib/sound';

interface BranchingNarrativeProps {
  onUnlockTool: () => void;
}

const BranchingNarrative: React.FC<BranchingNarrativeProps> = ({ onUnlockTool }) => {
  const { addXP, unlockDiscovery, state } = useSignal();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const paths = [
    {
      id: 'cfo',
      title: '📊 CFO Language',
      subtitle: '"Show me EBITDA impact"',
      content: {
        title: 'CASE STUDY UNLOCKED',
        stats: [
          'Series B SaaS Company',
          '$2M → $8M ARR in 14 months',
          '3.2 EBITDA points improvement',
          '47% reduction in CAC'
        ],
        cta: 'Download Analysis'
      }
    },
    {
      id: 'speed',
      title: '⚡ Speed Demon',
      subtitle: '"Time-to-market is everything"',
      content: {
        title: 'VELOCITY REPORT',
        stats: [
          'Idea to Production: 14 Days',
          'Zero Legacy Debt',
          'Automated QA Pipeline',
          'First Mover Advantage Secured'
        ],
        cta: 'View Timeline'
      }
    },
    {
      id: 'contrarian',
      title: '🎭 Contrarian Play',
      subtitle: '"Everyone else is doing X..."',
      content: {
        title: 'THE ANTI-PATTERN',
        stats: [
          'Ignored Industry Standard',
          'Built Proprietary Model',
          '10x Leverage vs Competitors',
          'Zero Vendor Lock-in'
        ],
        cta: 'Read Manifesto'
      }
    }
  ];

  const handleSelect = (id: string) => {
    playSignalSound('tap');
    setSelectedPath(id);
    unlockDiscovery(`path_${id}`);
    addXP(25, 'Path Chosen');
  };

  const activeContent = paths.find(p => p.id === selectedPath)?.content;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-4xl mx-auto">
      
      {!selectedPath ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full space-y-8"
        >
            <div className="text-center mb-12">
                <h2 className="text-holo-cyan font-mono tracking-widest text-sm mb-2">STRATEGY OPERATOR</h2>
                <h3 className="text-3xl font-display font-bold">CHOOSE YOUR BATTLEFIELD</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paths.map((path, idx) => (
                    <motion.button
                        key={path.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.02, borderColor: 'rgba(6,182,212,0.5)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(path.id)}
                        className="text-left p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group"
                    >
                        <div className="text-xl mb-2 group-hover:text-holo-cyan transition-colors">{path.title.split(' ')[0]}</div> 
                        <div className="font-bold text-lg mb-1">{path.title.split(' ').slice(1).join(' ')}</div>
                        <div className="text-sm text-slate-400 font-mono">{path.subtitle}</div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
      ) : (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-surface-dark/90 border border-holo-cyan/30 p-8 rounded-2xl relative overflow-hidden backdrop-blur-xl"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-holo-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            
            <div className="mb-6 text-center">
                <div className="text-system-amber font-mono text-xs mb-2">ACCESS GRANTED</div>
                <h2 className="text-2xl font-bold">{activeContent?.title}</h2>
            </div>

            <div className="space-y-4 mb-8 font-mono text-sm">
                {activeContent?.stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded border border-white/5"
                    >
                        <span className="text-holo-cyan">├─</span>
                        {stat}
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-4">
                <button className="flex-1 bg-white text-black font-bold py-3 rounded hover:bg-slate-200 transition-colors">
                    {activeContent?.cta}
                </button>
                <button 
                    onClick={onUnlockTool}
                    className="flex-1 border border-white/20 hover:bg-white/10 py-3 rounded transition-colors text-sm"
                >
                    Access Generator &rarr;
                </button>
            </div>

        </motion.div>
      )}

    </div>
  );
};

export default BranchingNarrative;

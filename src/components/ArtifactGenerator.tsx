
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignal } from '../context/SignalContext';
import { playSignalSound } from '../lib/sound';
import { CONFIG } from '../config';

const ArtifactGenerator: React.FC = () => {
    const { generateArtifact } = useSignal();
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const templates = [
        { id: 'strategy', title: 'Strategy Paradox', icon: '📊' },
        { id: 'roi', title: 'ROI Reality Check', icon: '💰' },
        { id: 'contrarian', title: 'Contrarian Take', icon: '💡' },
        { id: 'map', title: 'Implementation Map', icon: '🔥' }
    ];

    const handleGenerate = (id: string) => {
        setGenerating(true);
        playSignalSound('tap');
        // Mock delay
        setTimeout(() => {
            setGenerating(false);
            generateArtifact(id, {});
            setResult(id);
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-5xl mx-auto">
            
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <div className="inline-block px-3 py-1 rounded-full border border-system-amber/30 bg-system-amber/10 text-system-amber text-xs font-mono mb-4">
                    ARSENAL UNLOCKED
                </div>
                <h2 className="text-4xl font-display font-bold">ARTIFACT GENERATOR</h2>
                <p className="text-slate-400 mt-2">Create visual insights that make you look like the smartest person on X.</p>
            </motion.div>

            {!result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {templates.map((t, i) => (
                        <motion.button
                            key={t.id}
                            disabled={generating}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleGenerate(t.id)}
                            className="relative aspect-[3/4] rounded-xl bg-slate-900 border border-white/10 hover:border-holo-cyan/50 hover:bg-slate-800 transition-all group overflow-hidden flex flex-col items-center justify-center p-6 text-center disabled:opacity-50"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{t.icon}</div>
                            <h3 className="font-bold text-lg">{t.title}</h3>
                            <div className="absolute inset-0 bg-holo-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            {generating && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                    <div className="w-8 h-8 border-2 border-holo-cyan border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}
                        </motion.button>
                    ))}
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-2xl bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    <div className="aspect-video bg-gradient-to-br from-slate-900 to-black relative flex items-center justify-center border-b border-white/10">
                        {/* Mock Result Graphic */}
                        <div className="text-center p-12">
                            <h1 className="text-3xl font-bold font-display text-white mb-2">THE INNOVATION PARADOX</h1>
                            <div className="w-16 h-1 bg-system-amber mx-auto my-6" />
                            <p className="text-slate-300 italic">"The real risk isn't implementation.<br/>It's being too late."</p>
                            <div className="absolute bottom-4 right-4 text-xs text-white/30 font-mono">via {CONFIG.brand}</div>
                        </div>
                    </div>
                    <div className="p-6 flex justify-between items-center bg-white/5">
                        <div className="text-xs font-mono text-emerald-400">GENERATION COMPLETE // +100 XP</div>
                        <div className="flex gap-3">
                            <button onClick={() => setResult(null)} className="text-sm text-slate-400 hover:text-white transition-colors">Generate Another</button>
                            <button className="bg-holo-cyan text-black font-bold px-6 py-2 rounded hover:bg-cyan-400 transition-colors">Download</button>
                        </div>
                    </div>
                </motion.div>
            )}

        </div>
    );
};

export default ArtifactGenerator;


import React from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';

const Portfolio: React.FC = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative min-h-screen py-20 px-6 bg-slate-950 text-white font-sans overflow-x-hidden">

            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-slate-950"></div>
                <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"></div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="relative z-10 max-w-6xl mx-auto"
            >

                {/* Header */}
                <motion.header variants={item} className="mb-16 text-center">
                    <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
                        Status: Analysis Complete
                    </div>
                    <h1 className="text-4xl md:text-6xl font-light tracking-tight mb-4">
                        Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold">Deployed.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-light">Strategic vignettes from previous operational theatres.</p>
                </motion.header>

                {/* Case Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Card 1: Fintech */}
                    <motion.div variants={item} whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-8 group cursor-pointer hover:bg-slate-800/60 hover:border-cyan-500/30 hover:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.15)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="text-xs font-mono text-cyan-500 uppercase tracking-wider">Sector: Fintech</div>
                            <div className="w-2 h-2 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all"></div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-cyan-200 transition-colors">Regulatory Debt Erased</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Refactored compliance engine to reduce friction index. Automated audit trails via agentic observers.
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono text-slate-500 uppercase">
                                <span>Friction Index</span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="text-cyan-400"
                                >-40%</motion.span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "40%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-full bg-cyan-500/50"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Media */}
                    <motion.div variants={item} whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-8 group cursor-pointer hover:bg-slate-800/60 hover:border-indigo-500/30 hover:shadow-[0_10px_40px_-10px_rgba(129,140,248,0.15)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="text-xs font-mono text-indigo-500 uppercase tracking-wider">Sector: Media</div>
                            <div className="w-2 h-2 rounded-full bg-indigo-500/50 group-hover:bg-indigo-400 group-hover:shadow-[0_0_10px_rgba(129,140,248,0.5)] transition-all"></div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-indigo-200 transition-colors">Total Audience Capture</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Deployed signal amplifiers to maximize velocity. Constructed narrative bridges for high-fidelity transmission.
                        </p>
                        <div class="space-y-2">
                            <div className="flex justify-between text-xs font-mono text-slate-500 uppercase">
                                <span>Signal Velocity</span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="text-indigo-400"
                                >+98%</motion.span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "98%" }}
                                    transition={{ duration: 1, delay: 0.6 }}
                                    className="h-full bg-indigo-500/50"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: AI */}
                    <motion.div variants={item} whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-xl p-8 group cursor-pointer hover:bg-slate-800/60 hover:border-emerald-500/30 hover:shadow-[0_10px_40px_-10px_rgba(52,211,153,0.15)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="text-xs font-mono text-emerald-500 uppercase tracking-wider">Sector: Deep Tech</div>
                            <div className="w-2 h-2 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all"></div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-200 transition-colors">Neural Stabilization</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Optimized inference architecture. Reduced cognitive load on human-in-the-loop systems.
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-mono text-slate-500 uppercase">
                                <span>OpEx Reduction</span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    className="text-emerald-400"
                                >-30%</motion.span>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "30%" }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-full bg-emerald-500/50"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* CTA Section */}
                <motion.div variants={item} className="mt-20 text-center">
                    <a href={`mailto:${CONFIG.emails.personal}`} className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-slate-950 font-bold uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform duration-300">
                        <span className="relative z-10 mr-2">Deploy Intelligence</span>
                        <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
                        <div className="absolute inset-0 bg-cyan-400/20 translate-y-full transition-transform group-hover:translate-y-0 duration-300"></div>
                    </a>
                    <p className="mt-6 text-xs text-slate-500 font-mono">Encrypted Channel: OPEN</p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Portfolio;

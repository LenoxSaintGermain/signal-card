
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ContactCalibration: React.FC = () => {
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulation = () => {
        setIsSimulating(true);
        // Would trigger the next "Insight" phase in a real app
        setTimeout(() => setIsSimulating(false), 2000);
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans overflow-hidden">

            {/* Background Grid & Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg p-8 rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >

                {/* Scan Line Effect */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/30 animate-[scan_3s_linear_infinite] pointer-events-none blur-[1px]"></div>

                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-widest mb-3"
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                        System Calibration
                    </motion.div>
                    <h2 className="text-3xl font-light tracking-tight text-white mb-2">Calibrate the Agent</h2>
                    <p className="text-slate-400 text-sm">Input your context to decode the signal.</p>
                </div>

                {/* Form */}
                <form className="space-y-6">

                    {/* Role */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="space-y-2"
                    >
                        <label className="block text-xs font-mono text-cyan-500/80 uppercase tracking-wider">01 // Role Identity</label>
                        <div className="relative group">
                            <select className="w-full bg-slate-900/50 border border-white/10 rounded-md py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none transition-colors cursor-pointer hover:bg-slate-900/80">
                                <option>Select Designation...</option>
                                <option>CEO / Founder</option>
                                <option>Product Exec</option>
                                <option>High-Stakes Investor</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Industry */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-2"
                    >
                        <label className="block text-xs font-mono text-cyan-500/80 uppercase tracking-wider">02 // Operational Sector</label>
                        <div className="relative group">
                            <select className="w-full bg-slate-900/50 border border-white/10 rounded-md py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none transition-colors cursor-pointer hover:bg-slate-900/80">
                                <option>Select Sector...</option>
                                <option>Fintech Core</option>
                                <option>Generative AI</option>
                                <option>CleanTech Systems</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Challenge */}
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                        className="space-y-2"
                    >
                        <label className="block text-xs font-mono text-cyan-500/80 uppercase tracking-wider">03 // Signal Interference</label>
                        <div className="relative group">
                            <select className="w-full bg-slate-900/50 border border-white/10 rounded-md py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 appearance-none transition-colors cursor-pointer hover:bg-slate-900/80">
                                <option>Select Core Challenge...</option>
                                <option>High Friction Index</option>
                                <option>Low Velocity</option>
                                <option>Market Clarity</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                    >
                        <button
                            type="button"
                            onClick={handleSimulation}
                            className="group w-full bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm font-bold uppercase py-4 rounded-md transition-all relative overflow-hidden active:scale-[0.98]"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSimulating ? 'Processing...' : 'Run Simulation'}
                                <span className={`transition-transform ${!isSimulating && 'group-hover:translate-x-1'}`}>
                                    {isSimulating ? <span className="animate-spin inline-block">⟳</span> : '>_'}
                                </span>
                            </span>
                            <div className="absolute inset-0 bg-white/10 translate-y-full transition-transform duration-300 group-hover:translate-y-0"></div>
                        </button>
                    </motion.div>

                </form>

                {/* Footer Terminal */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="mt-8 pt-6 border-t border-white/5 font-mono text-[10px] text-slate-600 flex justify-between"
                >
                    <span>RAM: 64%</span>
                    <span>PING: 12ms</span>
                    <span className="text-emerald-500/60">SECURE: TLS 1.3</span>
                </motion.div>

            </motion.div>

        </div>
    );
};

export default ContactCalibration;

"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ShieldCheck, BarChart3, ChevronRight, Activity, TrendingUp, Lock, ShieldAlert } from "lucide-react";
import DataParticles from "@/components/DataParticles";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-teal selection:text-white overflow-x-hidden">
            {/* Cinematic Hero Section: Murph Inspired */}
            <section className="relative min-h-screen flex flex-col bg-[#050B0A] text-white selection:bg-orange-500/30 overflow-hidden">
                {/* Visual Engine: Cinematic Atmosphere */}
                <div className="absolute inset-0 z-0 text-white">
                    {/* Dark Station Mesh Background */}
                    {/* Dark Station Mesh Background - Visibility 70% */}
                    <div className="absolute inset-0 opacity-70 contrast-[1.2] brightness-75 mix-blend-screen">
                        <Image
                            src="/hero-img.png"
                            alt="Forensic Hub Mesh"
                            fill
                            priority
                            className="object-cover"
                        />
                    </div>

                    {/* Central Radiant Glow (Orange) */}
                    {/* Central Radiant Glow (Orange) - Softened to 20% */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] glow-orange opacity-20 mix-blend-screen pointer-events-none" />

                    {/* Subtle Teal Beams */}
                    <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] glow-teal opacity-10 animate-pulse-slow" />
                </div>

                {/* Floating Pill Navigation Header */}
                <nav className="absolute top-8 left-0 right-0 z-50 flex justify-center px-4">
                    <div className="pill-nav">
                        <span className="pill-nav-item active">Home</span>
                        <span className="pill-nav-item">Nodes</span>
                        <span className="pill-nav-item">Forensic AI</span>
                        <span className="pill-nav-item">State Map</span>
                        <span className="pill-nav-item">Deployment</span>
                        <span className="pill-nav-item text-white">Dashboard</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 ml-2 overflow-hidden flex items-center justify-center">
                            <Activity size={14} className="text-white/40" />
                        </div>
                    </div>
                </nav>

                <div className="flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-x-16 items-center px-12 relative z-20 pt-16">
                    {/* Left Side: The Protocol (Narrative) */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Tactical Badge */}
                        {/* Tactical Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22C55E]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Forensic x Technexis v1.02</span>
                        </div>

                        <h1 className="text-6xl md:text-[80px] font-black leading-[0.95] tracking-tight mb-8 font-sans">
                            <span className="text-[#F97316] glow-text-orange mb-1 block tracking-[-0.04em]">CROWDSTATE</span>
                            The Liquid<br />
                            Stability<br />
                            Protocol
                        </h1>

                        <p className="text-lg md:text-[20px] text-white/50 mb-12 font-medium leading-[1.6] max-w-lg">
                            Real-time forensic synchronization. No lag, no wasted compute. Your city equals your network. Meet <b>Murph</b>, your state-engine companion.
                        </p>

                        <div className="flex items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="px-10 py-5 bg-[#F97316] text-white font-black rounded-full hover:scale-105 transition-all shadow-[0_0_40px_rgba(249,115,22,0.3)] flex items-center gap-3 group"
                            >
                                Start Analysis
                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="px-10 py-5 bg-white/5 border border-white/20 text-white font-black rounded-full hover:bg-white/10 transition-all flex items-center gap-3">
                                <Activity size={18} />
                                Watch Protocol
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Side: The Forensic Architecture */}
                    <div className="flex flex-col gap-6">
                        {/* Main Glass Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="glass-premium p-10 rounded-[32px] relative overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-10 text-white">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center border border-orange-500/30">
                                    <ShieldAlert size={24} className="text-[#F97316]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Predictive Scan</h3>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">State Synchronizer</p>
                                </div>
                            </div>

                            <div className="space-y-8 mb-10">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                        <span>Network Stability</span>
                                        <span className="text-orange-500">92%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[92%] bg-orange-500 rounded-full shadow-[0_0_10px_#F97316]" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white leading-none">12.4k</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none">Nodes</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white leading-none">9ms</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none">Latency</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-black text-white leading-none">99%</p>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none">Up-time</p>
                                </div>
                            </div>

                            {/* Status Pills */}
                            <div className="flex gap-3 mt-10">
                                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[9px] font-bold text-green-500 uppercase tracking-widest">Live Now</div>
                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-widest">Forensic.V2</div>
                                <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-[9px] font-bold text-orange-500 uppercase tracking-widest">AI Powered</div>
                            </div>
                        </motion.div>

                        {/* Trusted Banner */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[28px] p-8"
                        >
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6">Built For & Trusted By</p>
                            <div className="flex items-center gap-10 opacity-40 grayscale contrast-[1.5] text-white">
                                <Activity size={20} />
                                <Lock size={20} />
                                <ShieldAlert size={20} />
                                <div className="text-[14px] font-bold tracking-tighter">STATE_OS</div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Tactical Footer Bar */}
                <div className="border-t border-white/5 bg-black/40 backdrop-blur-md px-12 py-5 relative z-30">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                        <div className="flex items-center gap-10">
                            <span className="flex items-center gap-2 text-white/60">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                $0.01 / Request
                            </span>
                            <span>Voice AI Enabled</span>
                            <span>Instant Recovery</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>ISO_v2.09</span>
                            <span>Global_Net_2026</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section: JetBrains Mono Numbers */}
            <section id="impact" className="relative py-24 px-8 z-10 border-y border-card-border bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="p-10 bg-white border border-card-border rounded-3xl flex flex-col justify-center shadow-lg group hover:border-brand-teal/30 transition-colors"
                        >
                            <span className="text-6xl md:text-8xl font-mono font-bold text-brand-navy leading-none mb-4 -ml-2 tracking-tighter">180<span className="text-2xl md:text-4xl text-brand-teal">s</span></span>
                            <h3 className="text-2xl font-bold uppercase tracking-widest mb-3">Warning Window</h3>
                            <p className="text-gray-500 font-medium text-base">Pre-emptive anomaly detection 3 minutes before systemic flow collapse occurs.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="p-10 bg-white border border-card-border rounded-3xl flex flex-col justify-center shadow-lg group hover:border-brand-teal/30 transition-colors"
                        >
                            <span className="text-6xl md:text-8xl font-mono font-bold text-brand-navy leading-none mb-4 -ml-2 tracking-tighter">9<span className="text-2xl md:text-4xl text-brand-teal">%</span></span>
                            <h3 className="text-2xl font-bold uppercase tracking-widest mb-3">Efficiency Gain</h3>
                            <p className="text-gray-500 font-medium text-base">Quantifiable operational recovery via AuraPath sensory-weighted load balancing.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* State Vector Assembly - Scroll Reveal */}
            <section id="methodology" className="relative py-32 px-8 z-10 border-t border-card-border bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="label mb-6 text-brand-teal text-sm">Protocol_Vector_Assembly</div>
                    <h2 className="text-5xl font-bold mb-16 tracking-tighter text-brand-navy">Tri-Axial State Engineering</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { icon: BarChart3, label: "Physical Density (ρ)", desc: "Metric-accurate occupancy derived via YOLOv8 edge inference.", proof: "Resolution: 0.1m²" },
                            { icon: Activity, label: "Sensory Load (Σ)", desc: "FFT acoustic analysis via Librosa for ambient complexity mapping.", proof: "Latency: < 40ms" },
                            { icon: TrendingUp, label: "Temporal Volatility (Δ)", desc: "Derivative of flow status calculated via LSTM variance.", proof: "Window: 180s Warning" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="p-10 bg-white border border-card-border rounded-2xl hover:border-brand-teal transition-all group shadow-sm hover:shadow-lg"
                            >
                                <div className="w-14 h-14 bg-brand-teal/10 rounded-xl flex items-center justify-center text-brand-teal mb-8 group-hover:scale-110 transition-transform shadow-inner">
                                    <item.icon size={28} />
                                </div>
                                <h3 className="font-bold uppercase tracking-widest text-sm mb-6 font-mono text-brand-navy">{item.label}</h3>
                                <p className="text-sm text-gray-500 mb-8 leading-relaxed font-medium">{item.desc}</p>
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Node Proof</span>
                                    <span className="text-[10px] font-mono font-bold text-brand-teal tracking-tighter">{item.proof}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy Seal */}
            <section id="trust" className="relative py-24 px-8 z-10 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="inline-block p-10 bg-white border border-card-border rounded-3xl shadow-xl max-w-3xl"
                >
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <Lock size={32} className="text-brand-teal" />
                        <h2 className="text-2xl font-bold uppercase tracking-[0.3em] text-brand-navy">Privacy Seal</h2>
                    </div>
                    <div className="text-3xl md:text-5xl font-mono font-bold mb-4 tracking-tighter text-brand-navy leading-tight">
                        Zero-PII | Anonymized
                    </div>
                    <div className="text-xl md:text-2xl font-black text-brand-teal uppercase tracking-[0.2em] mb-8 opacity-90">
                        Behavioral Vectors Only
                    </div>
                    <p className="text-gray-500 max-w-xl mx-auto font-medium text-base leading-relaxed">
                        Our proprietary edge-processing architecture ensures that no Personally Identifiable Information is ever stored or transmitted. We process pure human-density mathematics, not identities.
                    </p>
                </motion.div>
            </section>

            <footer className="relative py-24 px-8 border-t border-card-border z-10 bg-white backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-card-border shadow-lg transition-transform group-hover:scale-110">
                            <Image
                                src="/logo.jpg"
                                alt="CrowdState AI Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-brand-navy">CrowdState<span className="text-brand-teal">AI</span></span>
                    </Link>
                    <div className="flex gap-12 text-[11px] uppercase font-bold tracking-[0.2em] opacity-40">
                        <a href="#" className="hover:text-brand-teal transition-colors">Privacy Protocol</a>
                        <a href="#" className="hover:text-brand-teal transition-colors">Technexis Docs</a>
                        <a href="#" className="hover:text-brand-teal transition-colors">Contact Sales</a>
                    </div>
                    <div className="text-[11px] font-mono opacity-20 text-gray-500">© 2026 CROWDSTATE AI GROUP | FORENSIC DIVISION</div>
                </div>
            </footer>
        </div>
    );
}

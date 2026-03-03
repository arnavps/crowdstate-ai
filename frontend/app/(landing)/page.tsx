"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Zap, ShieldCheck, BarChart3, ChevronRight, Activity, TrendingUp, Lock } from "lucide-react";
import DataParticles from "@/components/DataParticles";
import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-brand-teal selection:text-white overflow-x-hidden">
            {/* Hero Section: Murph-Inspired Split-Pane */}
            <section className="relative min-h-screen flex items-center px-8 pt-20 overflow-hidden bg-white">
                {/* Visual Engine: Blueprint Background & Particles */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 select-none pointer-events-none opacity-40 grayscale contrast-75 brightness-110">
                        <Image
                            src="/hero-img.png"
                            alt="Transit Hub Blueprint"
                            fill
                            priority
                            className="object-cover"
                        />
                        {/* Light blueprint wash overlay */}
                        <div className="absolute inset-0 bg-[#F8FAFC]/90 mix-blend-screen" />
                    </div>

                    {/* Electric Teal Particle System Overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <DataParticles color="#14B8A6" quantity={120} speed={0.4} />
                    </div>
                </div>

                {/* Privacy Seal: Top Center Badge */}
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-50">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-premium border border-gray-200 shadow-sm"
                    >
                        <Lock size={14} className="text-blue-600" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 font-sans">
                            ZERO-PII | ANONYMIZED BEHAVIORAL VECTORS ONLY
                        </span>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-center relative z-20">
                    {/* Left Side: Narrative Weight (60%) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="pr-12"
                    >
                        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-black leading-[0.95] font-sans">
                            We don't predict crowds.<br />
                            <span className="text-[#F97316] italic">We predict stability.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-12 font-medium leading-relaxed max-w-xl font-sans">
                            The world's first tri-axial state engine for forensic crowd dynamics and sensory-weighted path optimization.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <Link
                                href="/dashboard"
                                className="w-full sm:w-auto px-10 py-5 bg-[#F97316] text-white font-bold rounded-lg hover:brightness-110 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 group"
                            >
                                ENTER DECISION HUB
                                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-black/10 text-black font-bold rounded-lg hover:bg-black/5 transition-all">
                                WATCH DEMO
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Side: Live Data Card (40%) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 30 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Volatility Ripple positioned behind the card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none z-[-1]">
                            <div className="absolute inset-0 bg-[#F97316]/5 rounded-full animate-ripple border border-[#F97316]/20" />
                            <div className="absolute inset-0 bg-[#F97316]/10 rounded-full animate-ripple border border-[#F97316]/10 delay-700" />
                        </div>

                        <div className="bg-white/60 backdrop-blur-md p-10 rounded-[32px] shadow-2xl border border-white/40 overflow-hidden relative">
                            {/* Card Header */}
                            <div className="flex items-center justify-between mb-16">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black">Live Network Status</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_8px_#4ADE80]" />
                                        <span className="text-[10px] font-bold text-[#4ADE80] uppercase tracking-widest leading-none">FORENSIC V1.02 ACTIVE</span>
                                    </div>
                                </div>
                                <Activity size={20} className="text-gray-300" />
                            </div>

                            {/* Metrics Display */}
                            <div className="flex flex-col gap-10 mb-16">
                                <div className="space-y-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Human Density (ρ)</span>
                                    <div className="text-8xl font-mono font-bold text-[#4ADE80] tracking-tighter drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                                        0.15
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Volatility Index (Δ)</span>
                                    <div className="text-8xl font-mono font-bold text-[#4ADE80] tracking-tighter drop-shadow-[0_0_20px_rgba(74,222,128,0.4)]">
                                        0.08
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Teal Bar */}
                            <div className="absolute bottom-0 left-0 right-0 py-5 bg-[#14B8A6] text-white flex justify-center items-center gap-4 text-[11px] font-bold uppercase tracking-[0.3em]">
                                <span>• LIVE NOW</span>
                                <span className="opacity-40">|</span>
                                <span>FORRENSIC V1.02</span>
                            </div>
                        </div>
                    </motion.div>
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

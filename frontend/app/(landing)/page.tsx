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
            {/* Solar Theme Infrastructure Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(var(--card-border) 1px, transparent 1px), linear-gradient(90deg, var(--card-border) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <DataParticles />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-card-border bg-white/70 dark:bg-background/70 backdrop-blur-xl transition-colors duration-500">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-8 h-20">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-card-border shadow-sm transition-transform group-hover:scale-110">
                            <Image
                                src="/logo.jpg"
                                alt="CrowdState AI Logo"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-xl tracking-tighter text-foreground group-hover:text-brand-teal transition-colors">CrowdState<span className="text-brand-teal">AI</span></span>
                    </Link>
                    <div className="hidden md:flex items-center gap-12 font-bold text-[11px] uppercase tracking-widest opacity-40">
                        <a href="#methodology" className="hover:text-brand-teal transition-colors">Methodology</a>
                        <a href="#impact" className="hover:text-brand-teal transition-colors">Operational Impact</a>
                        <a href="#trust" className="hover:text-brand-teal transition-colors">Forensic Trust</a>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        <Link
                            href="/dashboard"
                            className="px-6 py-2.5 bg-brand-navy text-white text-xs font-bold uppercase tracking-widest rounded transition-all hover:bg-brand-teal hover:scale-105 active:scale-95"
                        >
                            Launch Mission Control
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-8">
                <motion.div style={{ y: y1 }} className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-brand-teal/5 border border-brand-teal/20 mb-12 shadow-sm"
                    >
                        <ShieldCheck size={16} className="text-brand-teal" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-teal">
                            Technexis Forensic Protocol v1.02
                        </span>
                    </motion.div>

                    <h1 className="hero-title text-6xl md:text-9xl mb-8 tracking-tighter text-brand-navy">
                        We don't predict crowds.<br />
                        <span className="text-brand-teal italic">We predict stability.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
                        Forensic predictability for urban high-density hubs. Derive the 3-state vector $(\rho, \Sigma, \Delta)$ in real-time to mitigate systemic risk before it escalates.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Link
                            href="/dashboard"
                            className="group relative flex items-center gap-3 px-10 py-5 bg-brand-navy text-white font-bold rounded-lg hover:bg-brand-teal transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                            LAUNCH MISSION CONTROL
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="px-10 py-5 bg-white border border-card-border text-brand-navy font-bold rounded-lg hover:bg-gray-50 transition-all hover:scale-105 active:scale-95">
                            REQUEST TECHNICAL DEEPDIVE
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Impact Section: JetBrains Mono Numbers */}
            <section id="impact" className="relative py-32 px-8 z-10 border-y border-card-border bg-white/50 dark:bg-background/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="p-12 bg-white border border-card-border rounded-3xl flex flex-col justify-center shadow-xl group hover:border-brand-teal/30 transition-colors"
                        >
                            <span className="text-[80px] md:text-[140px] font-mono font-bold text-brand-navy leading-none mb-6 -ml-4 tracking-tighter">180<span className="text-4xl md:text-6xl text-brand-teal">s</span></span>
                            <h3 className="text-3xl font-bold uppercase tracking-widest mb-4">Warning Window</h3>
                            <p className="text-gray-500 font-medium text-lg">Pre-emptive anomaly detection 3 minutes before systemic flow collapse occurs.</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="p-12 bg-white border border-card-border rounded-3xl flex flex-col justify-center shadow-xl group hover:border-brand-teal/30 transition-colors"
                        >
                            <span className="text-[80px] md:text-[140px] font-mono font-bold text-brand-navy leading-none mb-6 -ml-4 tracking-tighter">9<span className="text-4xl md:text-6xl text-brand-teal">%</span></span>
                            <h3 className="text-3xl font-bold uppercase tracking-widest mb-4">Efficiency Gain</h3>
                            <p className="text-gray-500 font-medium text-lg">Quantifiable operational recovery via AuraPath sensory-weighted load balancing.</p>
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
            <section id="trust" className="relative py-40 px-8 z-10 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="inline-block p-16 bg-white border border-card-border rounded-3xl shadow-2xl max-w-4xl"
                >
                    <div className="flex items-center justify-center gap-6 mb-8">
                        <Lock size={40} className="text-brand-teal" />
                        <h2 className="text-4xl font-bold uppercase tracking-[0.3em] text-brand-navy">Privacy Seal</h2>
                    </div>
                    <div className="text-[40px] md:text-[64px] font-mono font-bold mb-6 tracking-tighter text-brand-navy leading-tight">
                        Zero-PII | Anonymized
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-brand-teal uppercase tracking-[0.2em] mb-10 opacity-90">
                        Behavioral Vectors Only
                    </div>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
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

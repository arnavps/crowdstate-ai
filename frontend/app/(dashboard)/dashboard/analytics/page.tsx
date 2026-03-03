"use client";

import React from "react";
import {
    BarChart3,
    TrendingUp,
    Clock,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Info
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-orange" />
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">LSTM Predictive Science</span>
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
                        Systemic Analytics
                    </h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-white border border-[#E2E8F0] px-6 py-3 rounded-xl flex flex-col shadow-sm">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">Prediction Accuracy</span>
                        <span className="text-xl font-mono font-black text-brand-teal">98.4%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Volatility Timeline */}
                <div className="lg:col-span-2 p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1E293B]">Volatility Timeline (Δ)</h3>
                            <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Historical State vs Predicted Flux</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
                                <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-orange" />
                                <span className="text-[10px] font-bold uppercase text-brand-orange">Predicted</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 w-full relative group">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                            {/* Grid Lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                            ))}

                            {/* Actual Path */}
                            <motion.path
                                d="M 0 100 Q 50 120 100 80 T 200 110 T 300 90 T 400 100"
                                stroke="#E2E8F0"
                                strokeWidth="2"
                                fill="none"
                            />

                            {/* Predicted Path */}
                            <motion.path
                                d="M 400 100 Q 450 80 500 120 T 600 70 T 700 110 T 800 90"
                                stroke="#F97316"
                                strokeWidth="3"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                                className="drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]"
                            />

                            {/* Interaction Point */}
                            <motion.circle
                                cx="400" cy="100" r="4" fill="#F97316"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="ring-4 ring-orange-500/20"
                            />
                        </svg>

                        <div className="absolute top-0 right-0 p-4 bg-orange-50/80 backdrop-blur-sm border border-orange-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            <p className="text-[10px] font-bold text-orange-600 uppercase mb-1">Kinetic Vibe Shift Detected</p>
                            <p className="text-[12px] font-mono font-bold text-orange-900">Δ+0.42 (Kinetic Tracking Spike)</p>
                        </div>
                    </div>

                    <div className="flex justify-between px-2">
                        {["-60m", "-30m", "Now", "+30m", "+60m"].map((t, i) => (
                            <span key={i} className="text-[10px] font-mono font-bold text-[#94A3B8]">{t}</span>
                        ))}
                    </div>
                </div>

                {/* 180s Window Tracker */}
                <div className="p-8 bg-[#1E293B] rounded-2xl shadow-xl flex flex-col gap-8 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">180s Safety Window</h3>
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                            <Clock size={16} className="text-brand-orange" />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
                        <div className="relative w-40 h-40">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    cx="80" cy="80" r="70"
                                    stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none"
                                />
                                <motion.circle
                                    cx="80" cy="80" r="70"
                                    stroke="#F97316" strokeWidth="8" fill="none"
                                    strokeDasharray="440"
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 110 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter">180</span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Seconds</span>
                            </div>
                        </div>
                        <p className="text-center text-[11px] text-white/60 leading-relaxed font-medium px-4">
                            Current lead time for automated evacuation protocols and density rerouting.
                        </p>
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-white/40">Confidence</span>
                            <span className="text-brand-teal">High Range</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-teal w-4/5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Target, label: "Recovered Capacity", val: "14.2%", desc: "Transit flow throughput gain." },
                    { icon: Activity, label: "Congestion Avoided", val: "84k", desc: "Commuters rerouted via AuraPath." },
                    { icon: TrendingUp, label: "Systemic Uptime", val: "99.98%", desc: "Across all regional node clusters." }
                ].map((metric, i) => (
                    <div key={i} className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6 group hover:border-brand-teal transition-all">
                        <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] group-hover:bg-brand-teal/5 group-hover:text-brand-teal transition-all shadow-inner">
                            <metric.icon size={24} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2">{metric.label}</div>
                            <div className="text-3xl font-black text-[#1E293B] tracking-tighter mb-2">{metric.val}</div>
                            <p className="text-xs text-[#64748B] font-medium leading-relaxed">{metric.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

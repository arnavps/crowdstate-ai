"use client";

import React, { useState } from "react";
import {
    Map as MapIcon,
    Navigation,
    Wind,
    Info,
    Zap,
    TrendingDown,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import StationNodeMap from "@/components/StationNodeMap";

export default function AuraPathMapPage() {
    const [selectedPath, setSelectedPath] = useState<"standard" | "aura">("aura");
    const [isHeatmapVisible, setIsHeatmapVisible] = useState(true);

    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-teal" />
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">Sensory Navigation Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
                        AuraPath™ Live Map
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <ShieldCheck size={18} className="text-brand-teal" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">Condition Status</span>
                            <span className="text-[11px] font-bold text-green-600 uppercase tracking-tighter">Optimal for Sensory Needs</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 flex-1 min-h-[600px]">
                {/* Map Viewport */}
                <div className="relative bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm flex-1">
                    <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                        <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] p-1.5 rounded-xl shadow-lg flex items-center gap-1">
                            <button
                                onClick={() => setIsHeatmapVisible(!isHeatmapVisible)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${isHeatmapVisible ? "bg-[#1E293B] text-white shadow-md" : "text-[#64748B] hover:bg-[#F8FAFC]"
                                    }`}
                            >
                                Sensory Heatmap: {isHeatmapVisible ? "ON" : "OFF"}
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-full grayscale-[0.8] opacity-60 pointer-events-none">
                        <StationNodeMap onNodeSelect={() => { }} />
                    </div>

                    {/* Simulated AuraPath Overlay */}
                    {selectedPath === "aura" && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000">
                            <motion.path
                                d="M 200 800 Q 400 600 500 400 T 800 200"
                                stroke="#0891B2"
                                strokeWidth="6"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                strokeDasharray="10 5"
                            />
                            <motion.circle
                                cx="800" cy="200" r="10" fill="#0891B2"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </svg>
                    )}

                    {isHeatmapVisible && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-teal/5 via-brand-orange/5 to-transparent pointer-events-none mix-blend-multiply transition-opacity duration-1000" />
                    )}
                </div>

                {/* Navigation Sidebar */}
                <aside className="flex flex-col gap-6">
                    <div className="p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Route Optimization</h3>

                        <div className="space-y-3">
                            <button
                                onClick={() => setSelectedPath("standard")}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all ${selectedPath === "standard" ? "bg-[#F8FAFC] border-brand-teal shadow-inner" : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Navigation size={18} className={selectedPath === "standard" ? "text-brand-orange" : "text-[#94A3B8]"} />
                                    <div className="text-left">
                                        <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedPath === "standard" ? "text-[#1E293B]" : "text-[#64748B]"}`}>Route A: Standard Path</p>
                                        <p className="text-[10px] font-mono text-[#94A3B8]">12m Est • 92% Density (Busy)</p>
                                    </div>
                                </div>
                            </button>

                            <div className="w-full p-4 rounded-xl border border-[#E2E8F0] bg-red-50/30 opacity-60 cursor-not-allowed">
                                <div className="flex items-center gap-3">
                                    <Navigation size={18} className="text-red-400" />
                                    <div className="text-left">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-red-500/60">Route B: High Σ Distress</p>
                                        <p className="text-[10px] font-mono text-red-500/40 italic">Acoustic Texture Alarm (Screech)</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPath("aura")}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between group transition-all relative overflow-hidden ${selectedPath === "aura" ? "bg-brand-teal/[0.03] border-brand-teal shadow-inner" : "border-[#E2E8F0] hover:border-[#CBD5E1] bg-white"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Wind size={18} className={selectedPath === "aura" ? "text-brand-teal" : "text-[#94A3B8]"} />
                                    <div className="text-left">
                                        <p className={`text-[11px] font-bold uppercase tracking-widest ${selectedPath === "aura" ? "text-brand-teal font-black" : "text-[#64748B]"}`}>Route C: AuraPath™</p>
                                        <p className="text-[10px] font-mono text-brand-teal/70 font-bold underline decoration-dotted">15m Est • Sensory Isolated (Calm)</p>
                                    </div>
                                </div>
                                {selectedPath === "aura" && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <Zap size={10} className="text-brand-orange animate-pulse" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-[#1E293B] rounded-2xl shadow-xl flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">State Vector Fusion</h3>
                            <TrendingDown size={14} className="text-brand-teal" />
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: "Density (ρ)", val: "0.142", ref: "Ghost State", color: "bg-green-500" },
                                { label: "Sensory (Σ)", val: "0.088", ref: "Silent Flow", color: "bg-brand-teal" },
                                { label: "Volatility (Δ)", val: "0.021", ref: "Absolute Stable", color: "bg-brand-teal" }
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">{item.label}</span>
                                        <span className="text-[11px] font-mono text-white font-bold">{item.val}</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} w-1/5 rounded-full`} />
                                    </div>
                                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">{item.ref}</p>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            Deep Diagnostic Reveal
                            <ChevronRight size={12} />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

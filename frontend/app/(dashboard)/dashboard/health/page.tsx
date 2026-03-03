"use client";

import React, { useState } from "react";
import {
    Activity,
    Cpu,
    Cpu as Gpu,
    Database,
    Globe,
    Zap,
    ShieldCheck,
    Server,
    Terminal,
    ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

export default function SystemHealthPage() {
    const [deploymentMode, setDeploymentMode] = useState<"edge" | "cloud">("edge");

    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-teal" />
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">Forensic Technical Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
                        System Health
                    </h1>
                </div>

                <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit border border-[#E2E8F0] shadow-sm">
                    {(["edge", "cloud"] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setDeploymentMode(mode)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${deploymentMode === mode
                                    ? "bg-[#1E293B] text-white shadow-lg"
                                    : "text-[#94A3B8] hover:text-[#475569]"
                                }`}
                        >
                            {mode === "edge" ? <Cpu size={14} /> : <Globe size={14} />}
                            {mode === "edge" ? "Edge Inference" : "Cloud Assembly"}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Engine Logic Monitor */}
                <div className="lg:col-span-2 p-8 bg-[#1E293B] rounded-2xl shadow-xl flex flex-col gap-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Terminal size={120} />
                    </div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40">Engine Logic Monitor</h3>
                            <p className="text-xl font-black tracking-tighter">Forensic_Core_v1.02_Live</p>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-[9px] font-bold text-green-500 uppercase tracking-widest">
                            Synchronized
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="space-y-6">
                            {[
                                { label: "AuraPath Vectorizer", status: "Active", load: "12%" },
                                { label: "LSTM Temporal Window", status: "Active", load: "44%" },
                                { label: "Tri-Axial State Encoder", status: "Active", load: "08%" }
                            ].map((logic, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase text-white/40 mb-1">{logic.label}</span>
                                        <span className="text-[11px] font-mono font-bold text-brand-teal">{logic.status}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-mono text-white/30">CPU: {logic.load}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-black/20 rounded-xl p-6 border border-white/5 font-mono text-[10px] text-brand-teal/60 leading-relaxed overflow-hidden">
                            <p className="text-white/40 mb-3 uppercase font-bold tracking-widest text-[8px]">Live Audit Stream</p>
                            <p>[11:34:02] INITIALIZING_LSTM_FORECAST_WINDOW...</p>
                            <p>[11:34:05] SYNC_COMPLETE: NODE_LCY_091</p>
                            <p className="text-brand-orange">[11:34:12] WARNING: SIGMA_FLUX_DETECTED_0.02</p>
                            <p>[11:34:15] AUTO_REROUTE_PROTOCOL_ENGAGED</p>
                            <p>[11:34:18] STATE_STABILIZED: DELTA_0.142</p>
                            <motion.div
                                animate={{ opacity: [0, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="w-1.5 h-3 bg-brand-teal inline-block ml-1"
                            />
                        </div>
                    </div>
                </div>

                {/* Inference Latency */}
                <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Inference Latency</h3>
                        <Zap size={16} className="text-brand-orange" />
                    </div>

                    <div className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <Gpu size={16} />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E293B]">YOLOv8 Vision</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-indigo-600">32ms</span>
                            </div>
                            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "65%" }}
                                    className="h-full bg-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-brand-teal/5 flex items-center justify-center text-brand-teal">
                                        <Activity size={16} />
                                    </div>
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#1E293B]">Librosa Audio</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-brand-teal">14ms</span>
                            </div>
                            <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "35%" }}
                                    className="h-full bg-brand-teal"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                        <div className="flex gap-3">
                            <ShieldCheck size={18} className="text-brand-orange flex-shrink-0" />
                            <p className="text-[10px] text-orange-800 font-medium leading-relaxed">
                                Hardware acceleration active via CUDA. Edge latency remains 18% below SLA thresholds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: "Memory (Σ)", val: "1.2GB", desc: "Engine Cluster" },
                    { label: "IO Throughput", val: "4Gbps", desc: "Fiber Backplane" },
                    { label: "Uptime (24h)", val: "99.99%", desc: "Regional Hub" },
                    { label: "Node Temp", val: "42°C", desc: "Thermal Nominal" }
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-white border border-[#E2E8F0] rounded-xl flex flex-col gap-2">
                        <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">{stat.label}</span>
                        <span className="text-xl font-mono font-black text-[#1E293B]">{stat.val}</span>
                        <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-tighter">{stat.desc}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

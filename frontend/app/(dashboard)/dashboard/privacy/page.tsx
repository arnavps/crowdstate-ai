"use client";

import React from "react";
import {
    ShieldCheck,
    Lock,
    Trash2,
    ChevronRight,
    FileText,
    UserX,
    Database
} from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-teal" />
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">Compliance & Ethics Vault</span>
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
                        Privacy Technicals
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white border border-[#E2E8F0] px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                        <ShieldCheck size={18} className="text-brand-teal" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]">Encryption Status</span>
                            <span className="text-[11px] font-bold text-green-600 uppercase tracking-tighter">E2EE Edge Processing</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Declaration */}
            <div className="p-12 bg-white border border-[#E2E8F0] rounded-3xl shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-teal via-brand-orange to-brand-teal" />
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand-teal/5 border border-brand-teal/10 rounded-full text-brand-teal">
                        <UserX size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zero-PII Architecture</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tighter text-[#1E293B] leading-tight uppercase">
                        Anonymized Behavioral Vectors Only
                    </h2>
                    <p className="text-base text-[#64748B] font-medium max-w-2xl mx-auto leading-relaxed">
                        Raw visual and acoustic data is processed locally at the Edge. No identities, faces, or names are ever stored or transmitted.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vectorization Diagram */}
                <div className="lg:col-span-2 p-8 bg-[#1E293B] rounded-2xl shadow-xl flex flex-col gap-10 text-white relative overflow-hidden">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Vectorization Protocol (Pixels-to-Math)</h3>

                    <div className="flex items-center justify-between gap-12 relative px-4">
                        {/* Input Phase */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center grayscale opacity-40">
                                <div className="w-full h-full bg-grid-white/[0.05] rounded-lg" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 truncate w-24 text-center">Raw Sensor Feed</span>
                        </div>

                        {/* Transform Phase */}
                        <div className="flex-1 flex items-center gap-4">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-brand-teal" />
                            <div className="w-16 h-16 rounded-xl bg-brand-teal/20 border border-brand-teal/40 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="text-brand-teal"
                                >
                                    <Database size={24} />
                                </motion.div>
                            </div>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-brand-teal to-white/10" />
                        </div>

                        {/* Output Phase */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-brand-teal/5 border border-brand-teal/30 p-4 flex flex-col justify-center items-center gap-2">
                                <span className="text-xs font-mono font-black text-brand-teal">ρ: 0.84</span>
                                <span className="text-xs font-mono font-black text-brand-teal">Σ: 0.12</span>
                                <span className="text-xs font-mono font-black text-brand-teal">Δ: 0.04</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-teal">Digital Vector</span>
                        </div>

                        {/* Purge Phase */}
                        <div className="absolute -bottom-16 left-1/4 -translate-x-1/2 flex flex-col items-center gap-3">
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-red-500/40"
                            >
                                <Trash2 size={24} />
                            </motion.div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-red-500/40">Raw Purged (40ms)</span>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl mt-4">
                        <p className="text-[11px] font-medium text-white/60 leading-relaxed">
                            Our <span className="text-brand-teal font-bold uppercase">Irreversible Logic Gate</span> ensures that the conversion from raw pixels to multi-axial math is a one-way street. Reconstruction of individuals is mathematically impossible.
                        </p>
                    </div>
                </div>

                {/* Audit Trail */}
                <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Compliance Audit</h3>
                        <FileText size={16} className="text-[#94A3B8]" />
                    </div>

                    <div className="space-y-6">
                        {[
                            { time: "11:34:01", event: "Sensor_G7_Purge", status: "Verified" },
                            { time: "11:33:45", event: "Enc_Key_Cycle", status: "Secure" },
                            { time: "11:33:12", event: "Zero_PII_Check", status: "Pass" },
                            { time: "11:32:58", event: "GDPR_Sync", status: "Compliant" },
                            { time: "11:32:40", event: "Hash_Verify", status: "Synced" }
                        ].map((log, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono font-bold text-[#94A3B8]">{log.time}</span>
                                    <span className="px-1.5 py-0.5 rounded-[4px] bg-green-50 text-[8px] font-black text-green-600 uppercase tracking-tighter">
                                        {log.status}
                                    </span>
                                </div>
                                <div className="text-[11px] font-bold text-[#1E293B] font-mono">{log.event}</div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-auto py-3 bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-white hover:border-brand-teal text-[#1E293B] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        Download Transparency Report
                        <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

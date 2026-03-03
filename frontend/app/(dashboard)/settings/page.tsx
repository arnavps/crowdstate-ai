"use client";

import React from "react";
import {
    Settings,
    Users,
    Key,
    Radio,
    Sun,
    Moon,
    Github,
    ExternalLink,
    ChevronRight,
    Database,
    FileText
} from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#94A3B8]" />
                        <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">Platform Administration</span>
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
                        Settings & Utility
                    </h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Organization Management */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
                                <Users size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1E293B]">Organization Context</h3>
                                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Manage clusters and team access</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl hover:border-brand-teal transition-all flex items-center justify-between group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Current Workspace</span>
                                    <span className="text-sm font-bold text-[#1E293B]">London_East_Cluster_A</span>
                                </div>
                                <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                            </div>
                            <div className="p-5 bg-white border border-[#E2E8F0] rounded-xl hover:border-brand-teal transition-all flex items-center justify-between group">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Team Members</span>
                                    <span className="text-sm font-bold text-[#1E293B]">12 Active Admins</span>
                                </div>
                                <ChevronRight size={16} className="text-[#94A3B8] group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
                                <Database size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1E293B]">API & Integrations</h3>
                                <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Connect to regional data lakes</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-brand-teal">
                                        <Key size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-bold text-[#1E293B]">Production_API_Key</span>
                                        <span className="text-[10px] font-mono text-[#94A3B8]">•••• •••• •••• 84A2</span>
                                    </div>
                                </div>
                                <button className="text-[10px] font-bold text-brand-teal uppercase tracking-widest hover:underline">Reveal</button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-[#1E293B] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2">
                                <FileText size={14} className="LucideFileText" /> {/* wait LucideFileText is not imported correctly, should be FileText */}
                                Documentation
                            </button>
                            {/* Correcting the icon name below */}
                        </div>
                    </div>
                </div>

                {/* System & Aesthetic Preferences */}
                <div className="space-y-8">
                    <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm space-y-8">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#94A3B8]">Aesthetic Mode</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-[#1E293B]">Lunar / Solar Toggle</span>
                                    <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-widest">Dark vs Light Sync</span>
                                </div>
                                <ThemeToggle />
                            </div>

                            <div className="p-4 border border-dashed border-[#E2E8F0] rounded-xl">
                                <p className="text-[9px] text-[#94A3B8] font-medium leading-relaxed italic">
                                    Note: Theme synchronization applies across all regional node terminals and command center displays.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-[#1E293B] rounded-2xl shadow-xl space-y-6 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Radio size={80} />
                        </div>

                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">API Uptime Status</h3>

                        <div className="space-y-4">
                            {[
                                { name: "Forensic Core", status: "99.99%", color: "bg-brand-teal" },
                                { name: "AuraPath Sync", status: "100%", color: "bg-green-500" },
                                { name: "Node Webhook", status: "99.95%", color: "bg-brand-teal" }
                            ].map((service, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{service.name}</span>
                                        <span className="text-[10px] font-mono font-bold text-white">{service.status}</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className={`h-full ${service.color} w-full`} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                            <ExternalLink size={12} />
                            Platform Status Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Navigation, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

interface AuraPathMapProps {
    sigma: number;
}

export default function AuraPathMap({ sigma }: AuraPathMapProps) {
    const { scrollYProgress } = useScroll();
    const bgColor = useTransform(
        scrollYProgress,
        [0.7, 0.9],
        ["#FFFFFF", sigma > 0.6 ? "#F9731611" : "#0891B211"]
    );

    // Mock AuraPath logic: if sigma is high, the "Calm" path is much longer/different
    const isHighSensory = sigma > 0.6;

    return (
        <motion.div
            style={{ backgroundColor: bgColor }}
            className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm transition-colors duration-700"
        >
            {/* Mock Map Background - Light Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 400 300">
                    <path d="M50,50 L350,50 L350,250 L50,250 Z" fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="4 4" />
                    <path d="M50,150 L350,150 M200,50 L200,250" stroke="#64748B" strokeWidth="0.5" strokeDasharray="2 2" />
                </svg>
            </div>

            {/* Routes */}
            <svg width="100%" height="100%" viewBox="0 0 400 300" className="relative z-10">
                {/* Standard Route (Direct but potentially high sensory) */}
                <path
                    d="M80,220 L200,150 L320,80"
                    fill="none"
                    stroke={isHighSensory ? "#F97316" : "#4ade80"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-colors duration-500 opacity-20 hover:opacity-100"
                />
                <text x="180" y="130" fill="#64748B" className="text-[10px] font-mono font-bold opacity-30 select-none">Standard Path</text>

                {/* AuraPath (Low Sensory redirected route) */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    d={isHighSensory ? "M80,220 C100,100 300,300 320,80" : "M80,220 L200,150 L320,80"}
                    fill="none"
                    stroke="#0891B2"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={isHighSensory ? "0" : "8 12"}
                    className={`transition-all duration-700 ease-in-out ${isHighSensory ? 'animate-pulse' : ''}`}
                />
                {isHighSensory && (
                    <text x="120" y="80" fill="#0891B2" className="text-[10px] font-bold uppercase tracking-wider select-none">AuraPath (Sensory-Optimized)</text>
                )}

                {/* Nodes - Glowing Teal Rings */}
                <g className="filter drop-shadow-sm">
                    <circle cx="80" cy="220" r="8" fill="white" stroke="#0891B2" strokeWidth="2" />
                    <circle cx="80" cy="220" r="3" fill="#0891B2" />

                    <circle cx="320" cy="80" r="8" fill="white" stroke="#0891B2" strokeWidth="2" />
                    <circle cx="320" cy="80" r="3" fill="#0891B2" />
                </g>
            </svg>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                    <Navigation size={14} className="text-brand-teal" />
                    <span className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">AuraPath Active</span>
                </div>
                <div className="bg-white/90 backdrop-blur-md border border-[#E2E8F0] px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                    <MapPin size={14} className="text-brand-orange" />
                    <span className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider">{isHighSensory ? "Avoiding Surge" : "Optimal Conditions"}</span>
                </div>
            </div>
        </motion.div>
    );
}

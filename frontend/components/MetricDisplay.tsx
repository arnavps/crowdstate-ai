"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface MetricDisplayProps {
    label: string;
    value: number;
    prefix?: string;
    unit?: string;
    techProof: string;
    thresholds?: {
        medium: number;
        high: number;
    };
}

export default function MetricDisplay({ label, value, prefix = "", thresholds, techProof }: MetricDisplayProps) {
    const springValue = useSpring(0, { stiffness: 50, damping: 15 });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(latest);
        });
    }, [springValue]);

    const getStatus = () => {
        if (!thresholds) return { text: "NORMAL", color: "bg-green-500", textColor: "text-green-500" };
        if (value >= thresholds.high) return { text: "CRITICAL", color: "bg-red-500", textColor: "text-red-500" };
        if (value >= thresholds.medium) return { text: "ELEVATED", color: "bg-yellow-500", textColor: "text-yellow-500" };
        return { text: "NORMAL", color: "bg-green-500", textColor: "text-green-500" };
    };

    const status = getStatus();

    return (
        <div className="flex flex-col items-center justify-center h-full gap-2 group relative">
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-mono font-bold text-brand-teal bg-white px-2 py-1 rounded border border-brand-teal/20 shadow-sm">
                    {techProof}
                </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#64748B]">{label}</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white border border-[#E2E8F0] shadow-sm`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                    <span className={`text-[9px] font-bold font-mono ${status.textColor}`}>{status.text}</span>
                </div>
            </div>

            <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform duration-500">
                <span className="text-2xl font-mono text-gray-400 font-light">{prefix}</span>
                <span className={`text-[80px] font-mono font-bold leading-none tracking-tighter text-[#1E293B]`}>
                    {displayValue.toFixed(2)}
                </span>
            </div>

            <motion.div
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                className={`h-[1px] ${status.color} opacity-40 group-hover:opacity-100 transition-opacity duration-500`}
            />
        </div>
    );
}

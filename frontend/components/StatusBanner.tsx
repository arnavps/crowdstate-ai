"use client";

import React from "react";

const statuses = [
    { city: "MUMBAI CST", status: "CROWDED BUT CALM", level: "NORMAL", color: "text-green-500" },
    { city: "LONDON KING'S CROSS", status: "MODERATE VOLATILITY", level: "ELEVATED", color: "text-yellow-500" },
    { city: "SEOUL ITAEWON", status: "HIGH RISK - AVOID", level: "CRITICAL", color: "text-red-500" },
    { city: "NEW YORK PENN STATION", status: "FLOW STABILIZED", level: "NORMAL", color: "text-green-500" },
    { city: "TOKYO SHIBUYA", status: "PEAK DENSITY REACHED", level: "ELEVATED", color: "text-yellow-500" },
];

export default function StatusBanner() {
    return (
        <div className="w-full bg-charcoal/80 backdrop-blur-md border-b border-white/10 overflow-hidden py-2 h-10 flex items-center">
            <div className="flex whitespace-nowrap animate-ticker gap-12">
                {statuses.concat(statuses).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] font-mono font-bold tracking-wider">
                        <span className="text-gray-500">{s.city}:</span>
                        <span className="text-white">{s.status}</span>
                        <span className={`px-1.5 py-0.5 rounded ${s.color} bg-black/20 text-[9px]`}>
                            {s.level}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

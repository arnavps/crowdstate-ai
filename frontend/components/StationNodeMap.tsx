"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface Node {
    id: string;
    lat: number;
    lng: number;
    status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
    name: string;
}

const mockNodes: Node[] = [
    { id: 'ALPHA_01', lat: 40, lng: 30, status: 'OPTIMAL', name: 'Node Alpha-01 (Station East)' },
    { id: 'BETA_02', lat: 60, lng: 50, status: 'ELEVATED', name: 'Node Beta-02 (Central Hub)' },
    { id: 'GAMMA_03', lat: 30, lng: 70, status: 'OPTIMAL', name: 'Node Gamma-03 (West Perimeter)' },
];

interface StationNodeMapProps {
    onNodeSelect: (node: Node) => void;
    activeNodeId?: string;
}

export default function StationNodeMap({ onNodeSelect, activeNodeId }: StationNodeMapProps) {
    return (
        <div className="relative w-full h-[600px] bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
            {/* Simple Schematic Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                        <pattern id="grid-map" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#64748B" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-map)" />
                </svg>
            </div>

            <div className="absolute inset-0 p-8">
                <div className="flex justify-between items-start mb-4">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Regional Node Deployment Map</div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] uppercase font-bold text-[#64748B]">Optimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            <span className="text-[10px] uppercase font-bold text-[#64748B]">Elevated</span>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-full">
                    {mockNodes.map((node) => (
                        <motion.button
                            key={node.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => onNodeSelect(node)}
                            className={`absolute flex items-center justify-center group transform -translate-x-1/2 -translate-y-1/2 p-4 transition-all ${activeNodeId === node.id ? 'z-20' : 'z-10'
                                }`}
                            style={{ left: `${node.lng}%`, top: `${node.lat}%` }}
                        >
                            <div className={`relative w-10 h-10 rounded-full border-2 bg-white shadow-lg flex items-center justify-center transition-all ${node.status === 'OPTIMAL' ? 'border-green-500/50' :
                                node.status === 'ELEVATED' ? 'border-yellow-500/50' : 'border-red-500/50'
                                } ${activeNodeId === node.id ? 'ring-4 ring-brand-teal/20 scale-110' : ''}`}>

                                <div className={`absolute inset-0 rounded-full animate-pulse bg-brand-teal/5 ${activeNodeId === node.id ? 'block' : 'hidden md:group-hover:block'}`} />

                                <MapPin size={18} className={`${node.status === 'OPTIMAL' ? 'text-green-500' :
                                    node.status === 'ELEVATED' ? 'text-yellow-500' : 'text-red-500'
                                    }`} />

                                {/* Label shown on hover or when active */}
                                <div className={`absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-[10px] font-bold shadow-xl transition-opacity text-[#1E293B] ${activeNodeId === node.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                    {node.name}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}

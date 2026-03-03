"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Building2, ShieldAlert } from "lucide-react";

interface Persona {
    id: string;
    title: string;
    role: string;
    priority: string;
    icon: React.ElementType;
}

const personas: Persona[] = [
    {
        id: "commuter",
        title: "The Commuter",
        role: "Neurodivergent Traveler",
        priority: "Sensory Load (Σ)",
        icon: Users,
    },
    {
        id: "manager",
        title: "Station Manager",
        role: "Operations Lead",
        priority: "Physical Density (ρ)",
        icon: Building2,
    },
    {
        id: "responder",
        title: "First Responder",
        role: "Emergency Services",
        priority: "Volatility (Δ)",
        icon: ShieldAlert,
    },
];

export default function PersonaCards() {
    return (
        <div className="flex flex-col md:flex-row gap-6 w-full mt-12">
            {personas.map((persona) => (
                <motion.div
                    key={persona.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="flex-1 bg-charcoal/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl cursor-pointer hover:border-brand-teal group transition-colors"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-navy rounded-xl group-hover:bg-brand-teal group-hover:text-brand-navy transition-colors">
                            <persona.icon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">{persona.title}</h4>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{persona.role}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                        <span className="text-xs text-brand-teal font-mono uppercase">Key Metric:</span>
                        <p className="text-sm font-bold text-white mt-1">{persona.priority}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

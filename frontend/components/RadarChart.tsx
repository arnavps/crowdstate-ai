"use client";

import React from "react";
import {
    Radar,
    RadarChart as RechartsRadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

interface RadarChartProps {
    data: {
        rho: number;
        sigma: number;
        delta: number;
    };
    predictedData?: {
        rho: number;
        sigma: number;
        delta: number;
    };
}

export default function RadarChart({ data, predictedData }: RadarChartProps) {
    const chartData = [
        { subject: "Density (ρ)", actual: data.rho * 100, predicted: (predictedData?.rho ?? data.rho) * 100 },
        { subject: "Sensory (Σ)", actual: data.sigma * 100, predicted: (predictedData?.sigma ?? data.sigma) * 100 },
        { subject: "Volatility (Δ)", actual: data.delta * 100, predicted: (predictedData?.delta ?? data.delta) * 100 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-64 md:h-80 lg:h-96 radar-glow"
        >
            <div className="w-full h-full p-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "#1E293B", fontSize: 10, fontWeight: 700, letterSpacing: '0.1em' }}
                        />
                        <Radar
                            name="Actual"
                            dataKey="actual"
                            stroke="#0891B2"
                            fill="#0891B2"
                            fillOpacity={predictedData ? 0.3 : 0.6}
                            className="transition-all duration-700"
                        />
                        {predictedData && (
                            <Radar
                                name="Predicted"
                                dataKey="predicted"
                                stroke="#F97316"
                                fill="#F97316"
                                fillOpacity={0.4}
                                className="transition-all duration-700"
                            />
                        )}
                    </RechartsRadarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

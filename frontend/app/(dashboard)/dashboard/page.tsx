"use client";

import React, { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";
import {
  Activity,
  Map as MapIcon,
  ShieldCheck,
  Info,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import RadarChart from "@/components/RadarChart";
import MetricDisplay from "@/components/MetricDisplay";
import StationNodeMap from "@/components/StationNodeMap";

export default function DashboardPage() {
  const [selectedNode, setSelectedNode] = useState<{ id: string, name: string } | null>(null);
  const [timeIndex, setTimeIndex] = useState(0);
  const [persona, setPersona] = useState<"commuter" | "manager" | "responder">("commuter");

  const { lastJsonMessage, readyState } = useWebSocket("ws://localhost:8000/ws/stream", {
    shouldReconnect: (closeEvent) => true,
  });

  const data = lastJsonMessage as {
    rho: number;
    sigma: number;
    delta: number;
    predictions: Array<{ rho: number; sigma: number; delta: number }>;
  } || { rho: 0, sigma: 0, delta: 0, predictions: [] };

  // Simulated Persona Weighting
  const getPersonaAdjustedValue = (val: number, type: "rho" | "sigma" | "delta") => {
    const weights = {
      commuter: { rho: 1.2, sigma: 1.5, delta: 0.8 },
      manager: { rho: 1.5, sigma: 1.0, delta: 1.2 },
      responder: { rho: 1.0, sigma: 0.8, delta: 2.0 }
    };
    return val * weights[persona][type];
  };

  const baseVector = timeIndex === 0 ? data : (data.predictions[timeIndex - 1] || data);
  const currentVector = {
    rho: getPersonaAdjustedValue(baseVector.rho, "rho"),
    sigma: getPersonaAdjustedValue(baseVector.sigma, "sigma"),
    delta: getPersonaAdjustedValue(baseVector.delta, "delta"),
  };

  const connectionStatus = ({
    0: 'connecting',
    1: 'open',
    2: 'closing',
    3: 'closed',
  } as Record<number, string>)[readyState as any] || 'unknown';

  return (
    <div className="flex flex-col gap-8 h-full">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-4 border-b border-[#E2E8F0]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${connectionStatus === 'open' ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${connectionStatus === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">Regional Command Hub</span>
          </div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-[#1E293B]">
            Stakeholder Overview
          </h1>

          <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit border border-[#E2E8F0]">
            {(["commuter", "manager", "responder"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPersona(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${persona === p
                  ? "bg-white text-brand-teal shadow-sm border border-[#E2E8F0]"
                  : "text-[#94A3B8] hover:text-[#475569]"
                  }`}
              >
                {p === "commuter" ? "Commuter" : p === "manager" ? "Station Mgr" : "1st Responder"}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] px-6 py-4 rounded-xl flex items-center gap-8 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Active Nodes</span>
            <span className="font-mono text-sm font-bold text-[#1E293B]">3 Distributed</span>
          </div>
          <div className="w-[1px] h-8 bg-[#E2E8F0]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] mb-1">Stakeholder Meta</span>
            <span className="font-mono text-sm font-bold text-brand-orange">
              {persona === "commuter" ? "Sensory-First" : persona === "manager" ? "Density-First" : "Urgency-First"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex gap-8 items-start relative overflow-hidden flex-1">
        {/* Main Content: Map */}
        <div className={`transition-all duration-500 ease-in-out h-full ${selectedNode ? 'flex-shrink w-2/3' : 'w-full'}`}>
          <StationNodeMap
            activeNodeId={selectedNode?.id}
            onNodeSelect={(node) => setSelectedNode(node)}
          />
        </div>

        {/* Lateral Panel: Tri-Axial Analysis */}
        <AnimatePresence>
          {selectedNode && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-1/3 min-h-[600px] bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-8 flex flex-col gap-10 z-30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-brand-teal/5 border border-brand-teal/10 rounded-lg flex items-center justify-center text-brand-teal shadow-inner">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#1E293B]">{selectedNode.name}</h2>
                    <span className="text-[10px] font-mono font-bold text-[#94A3B8]">ID: {selectedNode.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-2 hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] rounded-lg transition-all"
                >
                  <ChevronRight size={20} className="text-[#64748B]" />
                </button>
              </div>

              <div className="space-y-8 flex-1">
                {/* Radar Chart Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-1">Tri-Axial Reveal</span>
                      <span className="text-[11px] font-bold uppercase text-brand-teal tracking-wider">LSTM Forensic Wave</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold text-[#1E293B]">
                      <Clock size={12} className="text-brand-teal" />
                      <span>T+{timeIndex}m FORECAST</span>
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 shadow-inner">
                    <RadarChart data={data} predictedData={timeIndex > 0 ? currentVector : undefined} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                      <span>Real-time</span>
                      <span>+10m Prediction</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={timeIndex}
                      onChange={(e) => setTimeIndex(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-brand-teal hover:bg-[#CBD5E1] transition-colors"
                    />
                  </div>
                </div>

                {/* Metrics Grid: JetBrains Mono Rigor */}
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: "Density (ρ)", val: selectedNode.id === 'BETA_02' ? 0.124 : currentVector.rho, tech: "YOLOv8 Edge" },
                    { label: "Sensory (Σ)", val: selectedNode.id === 'BETA_02' ? 0.882 : currentVector.sigma, tech: "Librosa FFT" },
                    { label: "Volatility (Δ)", val: selectedNode.id === 'BETA_02' ? 0.051 : currentVector.delta, tech: "LSTM Temporal" }
                  ].map((m, i) => {
                    const isSensoryAlarm = selectedNode.id === 'BETA_02' && m.label.includes("Sensory") && persona === "commuter";
                    const isDensityGhost = selectedNode.id === 'BETA_02' && m.label.includes("Density");

                    return (
                      <div key={i} className={`p-6 bg-white border border-[#E2E8F0] rounded-xl flex items-center justify-between group transition-all hover:shadow-md ${isSensoryAlarm ? 'border-brand-orange bg-orange-50/50' : 'hover:border-brand-teal/50'
                        }`}>
                        <div>
                          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] mb-2">{m.label}</div>
                          <div className={`text-[40px] font-mono font-bold tracking-tighter transition-colors leading-none ${isSensoryAlarm ? 'text-brand-orange' : isDensityGhost ? 'text-green-500' : 'text-[#1E293B] group-hover:text-brand-teal'
                            }`}>
                            {m.val.toFixed(3)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border mb-3 uppercase ${isSensoryAlarm ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' : 'bg-brand-teal/5 text-brand-teal border-brand-teal/10'
                            }`}>
                            {m.tech}
                          </div>
                          <div className={`text-[10px] font-bold flex items-center gap-1.5 justify-end ${isSensoryAlarm ? 'text-brand-orange animate-pulse' : 'text-green-500'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isSensoryAlarm ? 'bg-brand-orange' : 'bg-green-500'}`} />
                            {isSensoryAlarm ? 'INACCURATE_QUIET_ALARM' : 'NOMINAL'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="w-full py-4 bg-[#1E293B] hover:bg-brand-teal text-white font-bold rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                Technical Export (CSV)
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

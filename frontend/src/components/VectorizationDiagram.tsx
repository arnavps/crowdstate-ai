import { Lock, ArrowRight, ArrowDown, Shield } from 'lucide-react';

export default function VectorizationDiagram() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Shield size={14} className="text-[#0D9488]" />
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
          Vectorization Protocol (Pixels-to-Math)
        </h3>
      </div>

      {/* Diagram */}
      <div className="flex flex-col items-center">
        {/* Top Row - Raw Feed to Digital Vector */}
        <div className="flex items-center gap-4 w-full justify-center mb-4">
          {/* Raw Sensor Feed */}
          <div className="bg-[#F1F5F9] rounded-lg p-4 border border-[#E2E8F0]">
            <p className="text-xs font-mono text-[#64748B] uppercase tracking-wider text-center">
              Raw Sensor Feed
            </p>
          </div>

          {/* Arrow with Lock */}
          <div className="flex items-center gap-2">
            <ArrowRight size={20} className="text-[#94A3B8]" />
            <div className="p-2 bg-[#0D9488]/10 rounded-full">
              <Lock size={16} className="text-[#0D9488]" />
            </div>
            <ArrowRight size={20} className="text-[#94A3B8]" />
          </div>

          {/* Digital Vector */}
          <div className="bg-[#F0FDFA] rounded-lg p-4 border border-[#0D9488]/30">
            <p className="text-xs font-mono text-[#0D9488] uppercase tracking-wider text-center">
              Digital Vector
            </p>
          </div>
        </div>

        {/* Down Arrow - One Way Street */}
        <div className="flex flex-col items-center my-2">
          <ArrowDown size={24} className="text-[#EF4444]" />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold uppercase text-[#EF4444]">
              One-Way Street
            </span>
          </div>
        </div>

        {/* Bottom Row - Behavioral Vectors */}
        <div className="bg-[#0B1120] rounded-lg p-5 border border-[#1E293B] w-full max-w-xs mt-4">
          <p className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider mb-3 text-center">
            Behavioral Vectors Only
          </p>
          
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#06B6D4]">ρ:</span>
              <span className="text-[#E2E8F0]">0.84</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#06B6D4]">Σ:</span>
              <span className="text-[#E2E8F0]">0.12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#06B6D4]">Δ:</span>
              <span className="text-[#E2E8F0]">0.04</span>
            </div>
          </div>
        </div>

        {/* Note Box */}
        <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] max-w-lg">
          <p className="text-xs text-[#475569] leading-relaxed font-garamond text-center">
            Our <span className="font-bold text-[#0F172A]">IRREVERSIBLE LOGIC GATE</span> ensures that conversion from raw pixels to multi-axial math is a one-way street. 
            Reconstruction of individuals is mathematically impossible.
          </p>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function VectorizationDiagramSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-pulse">
      <div className="w-48 h-3 bg-[#E2E8F0] rounded mb-6" />
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="w-32 h-12 bg-[#F1F5F9] rounded" />
        <div className="w-8 h-8 rounded-full bg-[#E2E8F0]" />
        <div className="w-32 h-12 bg-[#F0FDFA] rounded" />
      </div>
      <div className="flex justify-center mb-4">
        <div className="w-6 h-6 bg-[#E2E8F0] rounded" />
      </div>
      <div className="w-48 h-24 bg-[#1E293B] rounded mx-auto" />
    </div>
  );
}

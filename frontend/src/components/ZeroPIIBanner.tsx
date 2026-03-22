import { Lock, Shield, EyeOff } from 'lucide-react';

export default function ZeroPIIBanner() {
  return (
    <div className="bg-gradient-to-br from-[#F0FDFA] to-[#E0F2FE] rounded-xl border border-[#0D9488]/20 p-8 text-center">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-[#0D9488]/10 rounded-full">
          <Lock size={32} className="text-[#0D9488]" />
        </div>
      </div>

      {/* Main Title */}
      <h2 className="text-lg font-bold font-mono text-[#0F172A] tracking-wider mb-2">
        ZERO-PII ARCHITECTURE
      </h2>

      {/* Subtitle */}
      <p className="text-sm font-bold text-[#0D9488] uppercase tracking-wider mb-4">
        ANONYMIZED BEHAVIORAL VECTORS ONLY
      </p>

      {/* Description */}
      <p className="text-sm text-[#475569] max-w-2xl mx-auto leading-relaxed font-garamond">
        Raw visual and acoustic data is processed locally at the Edge. 
        No identities, faces, or names are ever stored or transmitted.
      </p>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <EyeOff size={14} className="text-[#0D9488]" />
          <span className="text-xs font-mono text-[#64748B]">No Facial Recognition</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#0D9488]" />
          <span className="text-xs font-mono text-[#64748B]">Edge Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-[#0D9488]" />
          <span className="text-xs font-mono text-[#64748B]">Encrypted Vectors</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function ZeroPIIBannerSkeleton() {
  return (
    <div className="bg-[#F0FDFA] rounded-xl border border-[#0D9488]/20 p-8 animate-pulse">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-[#E2E8F0]" />
      </div>
      <div className="w-48 h-5 bg-[#E2E8F0] rounded mx-auto mb-2" />
      <div className="w-64 h-4 bg-[#E2E8F0] rounded mx-auto mb-4" />
      <div className="w-96 h-3 bg-[#F1F5F9] rounded mx-auto" />
    </div>
  );
}

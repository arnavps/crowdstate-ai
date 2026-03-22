import { ChevronRight, Activity, Terminal } from 'lucide-react';

interface StateVectorPanelProps {
  rho: number;
  sigma: number;
  delta: number;
}

export default function StateVectorPanel({ rho, sigma, delta }: StateVectorPanelProps) {
  const getStatus = (value: number, type: 'rho' | 'sigma' | 'delta') => {
    const thresholds = {
      rho: { low: 0.3, high: 0.6 },
      sigma: { low: 0.4, high: 0.7 },
      delta: { low: 0.3, high: 0.6 },
    };
    
    const t = thresholds[type];
    if (value <= t.low) return { label: 'NOMINAL', color: 'text-[#10B981]' };
    if (value <= t.high) return { label: 'ELEVATED', color: 'text-[#F59E0B]' };
    return { label: 'CRITICAL', color: 'text-[#EF4444]' };
  };

  const getBarFill = (value: number, inverse: boolean = false) => {
    const fill = inverse ? 1 - value : value;
    if (fill < 0.3) return 'bg-[#10B981]';
    if (fill < 0.7) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="bg-[#0F172A] rounded-lg p-5 border border-[#1E293B]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Terminal size={14} className="text-[#0D9488]" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
          State Vector Fusion
        </h3>
      </div>

      {/* Metrics */}
      <div className="space-y-5">
        {/* Density Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#CBD5E1] font-mono">DENSITY (ρ)</span>
              <span className="text-[#0D9488] font-mono font-bold">
                {rho.toFixed(3)}
              </span>
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${getStatus(rho, 'rho').color}`}>
              {getStatus(rho, 'rho').label}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#475569] font-mono">
            <span>YOLO8 EDGE</span>
            <Activity size={10} className={getStatus(rho, 'rho').color} />
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarFill(rho)}`}
              style={{ width: `${Math.min(rho * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E293B]" />

        {/* Ghost State Row */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
            <span>GHOST STATE</span>
            <span className="text-[#334155]">[NULL]</span>
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full" />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E293B]" />

        {/* Sensory Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#CBD5E1] font-mono">SENSORY (Σ)</span>
              <span className="text-[#0D9488] font-mono font-bold">
                {sigma.toFixed(3)}
              </span>
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${getStatus(sigma, 'sigma').color}`}>
              {getStatus(sigma, 'sigma').label}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#475569] font-mono">
            <span>LIBROSA FFT</span>
            <Activity size={10} className={getStatus(sigma, 'sigma').color} />
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarFill(sigma)}`}
              style={{ width: `${Math.min(sigma * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E293B]" />

        {/* Silent Flow Row */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
            <span>SILENT FLOW</span>
            <span className="text-[#334155]">[MONITORING]</span>
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full" />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E293B]" />

        {/* Volatility Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#CBD5E1] font-mono">VOLATILITY (Δ)</span>
              <span className="text-[#0D9488] font-mono font-bold">
                {delta.toFixed(3)}
              </span>
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${getStatus(delta, 'delta').color}`}>
              {getStatus(delta, 'delta').label}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#475569] font-mono">
            <span>LSTM TEMPORAL</span>
            <Activity size={10} className={getStatus(delta, 'delta').color} />
          </div>
          <div className="h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarFill(delta)}`}
              style={{ width: `${Math.min(delta * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1E293B]" />

        {/* Absolute Stable Row */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono">
            <span>ABSOLUTE STABLE</span>
            <span className="text-[#10B981]">[CONFIRMED]</span>
          </div>
          <div className="h-1 bg-[#10B981]/30 rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Deep Diagnostic Button */}
      <button className="w-full mt-6 flex items-center justify-between px-3 py-2.5 bg-[#1E293B] hover:bg-[#334155] rounded text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] transition-colors group">
        <span>Deep Diagnostic Reveal</span>
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

// Skeleton loader
export function StateVectorPanelSkeleton() {
  return (
    <div className="bg-[#0F172A] rounded-lg p-5 border border-[#1E293B] animate-pulse">
      <div className="w-32 h-3 bg-[#1E293B] rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <div className="w-24 h-3 bg-[#1E293B] rounded" />
              <div className="w-16 h-3 bg-[#1E293B] rounded" />
            </div>
            <div className="w-full h-1 bg-[#1E293B] rounded-full" />
          </div>
        ))}
      </div>
      <div className="w-full h-8 bg-[#1E293B] rounded mt-6" />
    </div>
  );
}

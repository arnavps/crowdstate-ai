import { useEffect, useState, useRef } from 'react';
import { Activity, Users, Zap, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number;
  status: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  icon: 'rho' | 'sigma' | 'delta';
  description: string;
  technical_details?: {
    raw_value: number;
    threshold: number;
    confidence: number;
  };
}

const iconMap = {
  rho: Users,
  sigma: Activity,
  delta: Zap,
};

const statusConfig = {
  NORMAL: {
    color: '#10B981',
    bgColor: 'bg-[#F0FDF4]',
    borderColor: 'border-[#10B981]/30',
    textColor: 'text-[#10B981]',
  },
  ELEVATED: {
    color: '#F59E0B',
    bgColor: 'bg-[#FFFBEB]',
    borderColor: 'border-[#F59E0B]/30',
    textColor: 'text-[#F59E0B]',
  },
  CRITICAL: {
    color: '#EF4444',
    bgColor: 'bg-[#FEF2F2]',
    borderColor: 'border-[#EF4444]/30',
    textColor: 'text-[#EF4444]',
  },
};

function useCountUp(target: number, duration: number = 1000): number {
  const [current, setCurrent] = useState(target);
  const startRef = useRef<number>(target);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const start = startRef.current;
    const startTime = startTimeRef.current;
    const diff = target - start;
    
    let animationFrame: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = start + diff * easeOut;
      
      setCurrent(newValue);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        startRef.current = target;
        startTimeRef.current = Date.now();
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return current;
}

export default function MetricCard({
  label,
  value,
  status,
  icon,
  description,
  technical_details,
}: MetricCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const animatedValue = useCountUp(value, 800);
  const Icon = iconMap[icon];
  const config = statusConfig[status];

  const formatValue = (val: number): string => {
    if (label.includes('ρ') || label.includes('Σ') || label.includes('Δ')) {
      return val.toFixed(2);
    }
    return Math.round(val).toString();
  };

  return (
    <div
      className={`relative w-[280px] h-[160px] rounded-lg border-2 ${config.borderColor} ${config.bgColor} 
        shadow-[2px_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[4px_4px_12px_rgba(0,0,0,0.12)]
        cursor-pointer overflow-hidden`}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Main Content */}
      <div className="p-5 h-full flex flex-col">
        {/* Header - Icon + Label */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-md ${config.bgColor}`}>
            <Icon size={18} className={config.textColor} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-helvetica">
            {label}
          </span>
        </div>

        {/* Value - Large centered */}
        <div className="flex-1 flex items-center justify-center">
          <span 
            className="text-[72px] leading-none font-mono font-bold text-[#0F172A] tracking-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace' }}
          >
            {formatValue(animatedValue)}
          </span>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mt-2">
          <span 
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bgColor} ${config.textColor}`}
          >
            {status}
          </span>
          <span className="text-[11px] text-[#64748B] font-garamond leading-tight max-w-[140px] text-right">
            {description}
          </span>
        </div>
      </div>

      {/* Technical Details Overlay */}
      {showDetails && technical_details && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex flex-col justify-center animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Technical Details
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B] font-garamond">Raw Value</span>
              <span className="font-mono font-semibold text-[#0F172A]">
                {technical_details.raw_value.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B] font-garamond">Threshold</span>
              <span className="font-mono font-semibold text-[#0F172A]">
                {technical_details.threshold.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748B] font-garamond">Confidence</span>
              <span className="font-mono font-semibold text-[#0F172A]">
                {(technical_details.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton loader for loading states
export function MetricCardSkeleton() {
  return (
    <div className="w-[280px] h-[160px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-md bg-[#E2E8F0]"></div>
        <div className="w-20 h-3 rounded bg-[#E2E8F0]"></div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-24 h-16 rounded bg-[#E2E8F0]"></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="w-16 h-5 rounded-full bg-[#E2E8F0]"></div>
        <div className="w-24 h-3 rounded bg-[#E2E8F0]"></div>
      </div>
    </div>
  );
}

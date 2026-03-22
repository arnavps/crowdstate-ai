import { useEffect, useState } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface LatencyMetric {
  name: string;
  value: number;
  unit: string;
  speed: 'very fast' | 'fast' | 'normal' | 'slow';
  barColor: string;
}

interface InferenceLatencyProps {
  yoloLatency?: number;
  audioLatency?: number;
}

export default function InferenceLatency({
  yoloLatency = 32,
  audioLatency = 14,
}: InferenceLatencyProps) {
  const [metrics, setMetrics] = useState<LatencyMetric[]>([
    {
      name: 'YOLOV9 VISION',
      value: yoloLatency,
      unit: 'ms',
      speed: 'fast',
      barColor: 'bg-[#3B82F6]',
    },
    {
      name: 'LIBROSA AUDIO',
      value: audioLatency,
      unit: 'ms',
      speed: 'very fast',
      barColor: 'bg-[#10B981]',
    },
  ]);

  // Simulate slight variations
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: Math.max(5, m.value + (Math.random() - 0.5) * 4),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSpeedLabel = (speed: string) => {
    switch (speed) {
      case 'very fast':
        return '(very fast)';
      case 'fast':
        return '(fast)';
      case 'normal':
        return '(normal)';
      case 'slow':
        return '(slow)';
      default:
        return '';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'very fast':
        return 'text-[#10B981]';
      case 'fast':
        return 'text-[#3B82F6]';
      case 'normal':
        return 'text-[#F59E0B]';
      case 'slow':
        return 'text-[#EF4444]';
      default:
        return 'text-[#64748B]';
    }
  };

  // Calculate progress bar width (max 100ms for scale)
  const getBarWidth = (value: number) => {
    return Math.min(100, (value / 50) * 100);
  };

  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Zap size={14} className="text-[#06B6D4]" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
          Inference Latency
        </h3>
      </div>

      {/* Metrics */}
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name}>
            {/* Label Row */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-[#94A3B8]">
                {metric.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#E2E8F0]">
                  {metric.value.toFixed(0)}{metric.unit}
                </span>
                <span className={`text-[10px] ${getSpeedColor(metric.speed)}`}>
                  {getSpeedLabel(metric.speed)}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metric.barColor}`}
                style={{ width: `${getBarWidth(metric.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Warning Note */}
      <div className="mt-5 flex items-start gap-2 p-3 bg-[#1E293B]/50 rounded border border-[#334155]/50">
        <AlertTriangle size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#94A3B8] font-mono leading-relaxed">
          Hardware acceleration active via CUDA. Edge latency remains 18% below SLA thresholds.
        </p>
      </div>
    </div>
  );
}

// Skeleton loader
export function InferenceLatencySkeleton() {
  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5 animate-pulse">
      <div className="w-28 h-3 bg-[#1E293B] rounded mb-5" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <div className="w-24 h-3 bg-[#334155] rounded" />
              <div className="w-20 h-3 bg-[#334155] rounded" />
            </div>
            <div className="w-full h-2 bg-[#1E293B] rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-5 h-12 bg-[#1E293B]/50 rounded" />
    </div>
  );
}

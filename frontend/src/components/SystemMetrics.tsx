import { useEffect, useState } from 'react';
import { HardDrive, Wifi, Clock, Thermometer, Server } from 'lucide-react';

interface SystemMetricCard {
  id: string;
  icon: 'memory' | 'io' | 'uptime' | 'temp';
  value: string;
  label: string;
  subtitle: string;
  status: 'good' | 'warning' | 'critical';
}

interface SystemMetricsProps {
  memory?: string;
  throughput?: string;
  uptime?: string;
  nodeTemp?: string;
}

const iconMap = {
  memory: HardDrive,
  io: Wifi,
  uptime: Clock,
  temp: Thermometer,
};

export default function SystemMetrics({
  memory = '1.2GB',
  throughput = '46Gbps',
  uptime = '99.99%',
  nodeTemp = '42°C',
}: SystemMetricsProps) {
  const [metrics, setMetrics] = useState<SystemMetricCard[]>([
    {
      id: 'memory',
      icon: 'memory',
      value: memory,
      label: 'MEMORY (Σ)',
      subtitle: 'ENGINE CLUSTER',
      status: 'good',
    },
    {
      id: 'io',
      icon: 'io',
      value: throughput,
      label: 'IO THROUGHPUT',
      subtitle: 'FIBER BACKPLANE',
      status: 'good',
    },
    {
      id: 'uptime',
      icon: 'uptime',
      value: uptime,
      label: 'UPTIME (24H)',
      subtitle: 'REGIONAL HUB',
      status: 'good',
    },
    {
      id: 'temp',
      icon: 'temp',
      value: nodeTemp,
      label: 'NODE TEMP',
      subtitle: 'THERMAL NOMINAL',
      status: 'good',
    },
  ]);

  // Simulate slight variations
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.id === 'temp') {
          const temp = parseInt(m.value);
          const newTemp = Math.max(38, Math.min(48, temp + Math.floor(Math.random() * 3) - 1));
          return {
            ...m,
            value: `${newTemp}°C`,
            status: newTemp > 45 ? 'warning' : 'good',
          };
        }
        return m;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-[#10B981]/30';
      case 'warning':
        return 'border-[#F59E0B]/30';
      case 'critical':
        return 'border-[#EF4444]/30';
      default:
        return 'border-[#334155]';
    }
  };

  const getValueColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-[#10B981]';
      case 'warning':
        return 'text-[#F59E0B]';
      case 'critical':
        return 'text-[#EF4444]';
      default:
        return 'text-[#94A3B8]';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon];
        
        return (
          <div
            key={metric.id}
            className={`bg-[#0B1120] rounded-lg border ${getStatusColor(metric.status)} p-4`}
          >
            {/* Icon */}
            <div className="flex items-center justify-between mb-3">
              <Icon size={16} className="text-[#06B6D4]" />
              <div className={`w-1.5 h-1.5 rounded-full ${getValueColor(metric.status).replace('text-', 'bg-')}`} />
            </div>

            {/* Value */}
            <div className="mb-1">
              <span className={`text-lg font-bold font-mono ${getValueColor(metric.status)}`}>
                {metric.value}
              </span>
            </div>

            {/* Label */}
            <p className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">
              {metric.label}
            </p>

            {/* Subtitle */}
            <p className="text-[9px] font-mono text-[#475569] mt-1">
              {metric.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// Skeleton loader
export function SystemMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="w-4 h-4 rounded bg-[#1E293B]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#334155]" />
          </div>
          <div className="w-16 h-5 rounded bg-[#334155] mb-1" />
          <div className="w-20 h-2 rounded bg-[#1E293B]" />
        </div>
      ))}
    </div>
  );
}

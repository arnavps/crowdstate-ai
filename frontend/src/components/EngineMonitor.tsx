import { useEffect, useState } from 'react';
import { Terminal, Activity } from 'lucide-react';

interface EngineComponent {
  id: string;
  name: string;
  status: 'Active' | 'Idle' | 'Error';
  cpuUsage: number;
}

interface EngineMonitorProps {
  components?: EngineComponent[];
}

export default function EngineMonitor({ components }: EngineMonitorProps) {
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const defaultComponents: EngineComponent[] = [
    {
      id: 'aurapath',
      name: 'AURAPATH VECTORIZER',
      status: 'Active',
      cpuUsage: 12,
    },
    {
      id: 'lstm',
      name: 'LSTM TEMPORAL WINDOW',
      status: 'Active',
      cpuUsage: 44,
    },
    {
      id: 'encoder',
      name: 'TRI-AXIAL STATE ENCODER',
      status: 'Active',
      cpuUsage: 88,
    },
  ];

  const displayComponents = components ?? defaultComponents;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-[#10B981]';
      case 'Idle':
        return 'text-[#F59E0B]';
      case 'Error':
        return 'text-[#EF4444]';
      default:
        return 'text-[#64748B]';
    }
  };

  const getCpuBarColor = (usage: number) => {
    if (usage < 30) return 'bg-[#10B981]';
    if (usage < 70) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#06B6D4]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Engine Logic Monitor
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
            SYNCHRONIZED
          </span>
        </div>
      </div>

      {/* Engine Title */}
      <div className="mb-5">
        <h4 className="text-sm font-bold font-mono text-[#E2E8F0]">
          Forensic_Core_v1.02_Live
        </h4>
        <p className="text-[10px] text-[#475569] font-mono mt-0.5">
          edge-inference@localhost:8000 | {syncTime}
        </p>
      </div>

      {/* Engine Components */}
      <div className="space-y-3">
        {displayComponents.map((component) => (
          <div
            key={component.id}
            className="flex items-center justify-between py-2 border-b border-[#1E293B]/50 last:border-0"
          >
            {/* Left: Name */}
            <div className="flex-1">
              <p className="text-xs font-mono text-[#06B6D4] tracking-wide">
                {component.name}
              </p>
            </div>

            {/* Middle: Status */}
            <div className="w-20 text-center">
              <span className={`text-[10px] font-mono uppercase ${getStatusColor(component.status)}`}>
                {component.status}
              </span>
            </div>

            {/* Right: CPU */}
            <div className="w-24 text-right">
              <span className="text-[10px] font-mono text-[#94A3B8]">
                CPU: {component.cpuUsage}%
              </span>
              <div className="h-1 bg-[#1E293B] rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getCpuBarColor(component.cpuUsage)}`}
                  style={{ width: `${component.cpuUsage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton loader
export function EngineMonitorSkeleton() {
  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="w-32 h-3 bg-[#1E293B] rounded" />
        <div className="w-20 h-4 bg-[#1E293B] rounded" />
      </div>
      <div className="mb-5">
        <div className="w-48 h-4 bg-[#1E293B] rounded mb-1" />
        <div className="w-64 h-2 bg-[#1E293B] rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="w-40 h-3 bg-[#1E293B] rounded" />
            <div className="w-16 h-3 bg-[#1E293B] rounded" />
            <div className="w-20 h-3 bg-[#1E293B] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

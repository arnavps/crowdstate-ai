import { useEffect, useState } from 'react';
import { Activity, Cpu, Database, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface EngineComponent {
  id: string;
  name: string;
  icon: 'cpu' | 'database' | 'zap';
  status: 'active' | 'standby' | 'error';
  latency: string;
  throughput: string;
  lastSync: string;
}

interface EngineMonitorProps {
  components?: EngineComponent[];
  isEdge?: boolean;
}

const iconMap = {
  cpu: Cpu,
  database: Database,
  zap: Zap,
};

const statusConfig = {
  active: {
    color: '#10B981',
    bgColor: 'bg-[#10B981]/10',
    textColor: 'text-[#10B981]',
    pulse: true,
  },
  standby: {
    color: '#F59E0B',
    bgColor: 'bg-[#F59E0B]/10',
    textColor: 'text-[#F59E0B]',
    pulse: false,
  },
  error: {
    color: '#EF4444',
    bgColor: 'bg-[#EF4444]/10',
    textColor: 'text-[#EF4444]',
    pulse: false,
  },
};

export default function EngineMonitor({ 
  components = [],
  isEdge = true 
}: EngineMonitorProps) {
  const [syncTime, setSyncTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const defaultComponents: EngineComponent[] = [
    {
      id: 'yolo-detector',
      name: 'YOLOv8 Edge Detector',
      icon: 'cpu',
      status: 'active',
      latency: '45ms',
      throughput: '6.4 FPS',
      lastSync: syncTime,
    },
    {
      id: 'lstm-predictor',
      name: 'LSTM Temporal Engine',
      icon: 'database',
      status: 'active',
      latency: '156ms',
      throughput: '2.1 cycles/s',
      lastSync: syncTime,
    },
    {
      id: 'state-fusion',
      name: 'State Fusion Core',
      icon: 'zap',
      status: 'active',
      latency: '12ms',
      throughput: '20 states/s',
      lastSync: syncTime,
    },
  ];

  const displayComponents = components.length > 0 ? components : defaultComponents;
  const allActive = displayComponents.every(c => c.status === 'active');

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-[#0D9488]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Engine Logic Monitor
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${allActive ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
            {allActive ? 'SYNCHRONIZED' : 'SYNCING...'}
          </span>
        </div>
      </div>

      {/* Engine Title */}
      <div className="mb-5">
        <h4 className="text-lg font-bold font-mono text-[#F1F5F9]">
          Forensic_Core_v1.02_Live
        </h4>
        <p className="text-xs text-[#475569] font-mono mt-0.5">
          {isEdge ? 'edge-inference@localhost:8000' : 'cloud-assembly@api.crowdstate.ai'}
        </p>
      </div>

      {/* Engine Components */}
      <div className="space-y-3">
        {displayComponents.map((component) => {
          const Icon = iconMap[component.icon];
          const config = statusConfig[component.status];

          return (
            <div
              key={component.id}
              className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg border border-[#334155]/50"
            >
              {/* Left: Icon + Name */}
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${config.bgColor}`}>
                  <Icon size={16} className={config.textColor} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#CBD5E1]">{component.name}</p>
                  <p className="text-[10px] text-[#475569] font-mono">
                    Sync: {component.lastSync}
                  </p>
                </div>
              </div>

              {/* Right: Status + Metrics */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-mono text-[#94A3B8]">
                    {component.latency}
                  </p>
                  <p className="text-[10px] text-[#475569]">
                    {component.throughput}
                  </p>
                </div>
                
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${config.bgColor}`}>
                  {component.status === 'active' ? (
                    <CheckCircle size={12} className={config.textColor} />
                  ) : component.status === 'error' ? (
                    <AlertCircle size={12} className={config.textColor} />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${config.bgColor.replace('/10', '')}`} />
                  )}
                  <span className={`text-[10px] font-bold uppercase ${config.textColor}`}>
                    {component.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-[#334155] grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-[#0D9488]">
            {displayComponents.filter(c => c.status === 'active').length}/{displayComponents.length}
          </p>
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Active</p>
        </div>
        <div className="text-center border-x border-[#334155]">
          <p className="text-lg font-bold font-mono text-[#F59E0B]">
            {Math.round(displayComponents.reduce((acc, c) => acc + parseInt(c.latency), 0) / displayComponents.length)}ms
          </p>
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Avg Latency</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold font-mono text-[#10B981]">
            99.9%
          </p>
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Uptime</p>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function EngineMonitorSkeleton() {
  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div className="w-32 h-3 bg-[#1E293B] rounded" />
        <div className="w-20 h-4 bg-[#1E293B] rounded" />
      </div>
      <div className="mb-5">
        <div className="w-48 h-6 bg-[#1E293B] rounded mb-2" />
        <div className="w-64 h-3 bg-[#1E293B] rounded" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#334155]" />
              <div>
                <div className="w-32 h-4 rounded bg-[#334155] mb-1" />
                <div className="w-20 h-3 rounded bg-[#1E293B]" />
              </div>
            </div>
            <div className="w-16 h-6 rounded bg-[#334155]" />
          </div>
        ))}
      </div>
    </div>
  );
}

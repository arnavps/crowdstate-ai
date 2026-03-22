import { useState } from 'react';
import { Activity, Server, Cloud, Cpu, HardDrive, Wifi, AlertCircle } from 'lucide-react';
import EngineMonitor, { EngineMonitorSkeleton } from '../components/EngineMonitor';
import AuditLogStream, { AuditLogStreamSkeleton } from '../components/AuditLogStream';
import InferenceLatencyChart, { InferenceLatencyChartSkeleton } from '../components/InferenceLatencyChart';

type DeploymentMode = 'edge' | 'cloud';

interface SystemMetric {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  status: 'good' | 'warning' | 'critical';
}

export default function SystemHealth() {
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>('edge');
  const [isLoading, setIsLoading] = useState(false);

  const handleModeChange = (mode: DeploymentMode) => {
    setIsLoading(true);
    setDeploymentMode(mode);
    // Simulate loading state
    setTimeout(() => setIsLoading(false), 800);
  };

  const systemMetrics: SystemMetric[] = [
    {
      label: 'CPU Usage',
      value: '42',
      unit: '%',
      icon: <Cpu size={18} className="text-[#3B82F6]" />,
      status: 'good',
    },
    {
      label: 'Memory',
      value: '3.2',
      unit: 'GB',
      icon: <HardDrive size={18} className="text-[#F59E0B]" />,
      status: 'good',
    },
    {
      label: 'Network',
      value: '12',
      unit: 'ms',
      icon: <Wifi size={18} className="text-[#10B981]" />,
      status: 'good',
    },
    {
      label: 'GPU Util',
      value: '67',
      unit: '%',
      icon: <Activity size={18} className="text-[#8B5CF6]" />,
      status: 'warning',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-[#10B981] bg-[#10B981]/10';
      case 'warning':
        return 'text-[#F59E0B] bg-[#F59E0B]/10';
      case 'critical':
        return 'text-[#EF4444] bg-[#EF4444]/10';
      default:
        return 'text-[#64748B] bg-[#64748B]/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-1">
            System Health
          </h1>
          <p className="text-2xl font-bold text-[#0F172A] font-helvetica">
            Forensic Technical Engine
          </p>
        </div>

        {/* Deployment Mode Toggle */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-lg p-1">
          <button
            onClick={() => handleModeChange('edge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              deploymentMode === 'edge'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Server size={14} />
            Edge Inference
          </button>
          <button
            onClick={() => handleModeChange('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              deploymentMode === 'cloud'
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Cloud size={14} />
            Cloud Assembly
          </button>
        </div>
      </div>

      {/* System Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                {metric.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getStatusColor(metric.status)}`}>
                {metric.status}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-[#0F172A]">
                {metric.value}
              </span>
              <span className="text-sm text-[#64748B]">{metric.unit}</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Engine Monitor & Audit Log */}
        <div className="space-y-6">
          {/* Engine Monitor */}
          {isLoading ? (
            <EngineMonitorSkeleton />
          ) : (
            <EngineMonitor isEdge={deploymentMode === 'edge'} />
          )}

          {/* Audit Log Stream */}
          {isLoading ? (
            <AuditLogStreamSkeleton />
          ) : (
            <AuditLogStream maxEntries={50} />
          )}
        </div>

        {/* Right Column - Inference Latency & Additional Info */}
        <div className="space-y-6">
          {/* Inference Latency Chart */}
          {isLoading ? (
            <InferenceLatencyChartSkeleton />
          ) : (
            <InferenceLatencyChart showThreshold={200} />
          )}

          {/* System Status Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* API Status */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-bold uppercase text-[#64748B]">API Status</span>
              </div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">OPERATIONAL</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">24ms avg response</p>
            </div>

            {/* WebSocket Status */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-xs font-bold uppercase text-[#64748B]">WebSocket</span>
              </div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">CONNECTED</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">12ms latency</p>
            </div>

            {/* Database Status */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-xs font-bold uppercase text-[#64748B]">Database</span>
              </div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">HEALTHY</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">98 queries/sec</p>
            </div>

            {/* AI Models Status */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-xs font-bold uppercase text-[#64748B]">AI Models</span>
              </div>
              <p className="text-lg font-bold text-[#0F172A] font-mono">ACTIVE</p>
              <p className="text-[10px] text-[#94A3B8] mt-1">156ms inference</p>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="flex items-center gap-3 px-4 py-3 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-lg">
            <AlertCircle size={18} className="text-[#F59E0B] shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#F59E0B]">Performance Notice</p>
              <p className="text-xs text-[#64748B]">
                GPU utilization elevated. Consider scaling edge inference nodes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

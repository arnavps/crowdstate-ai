import { useState, useEffect } from 'react';
import { Activity, Server, Cloud, AlertCircle } from 'lucide-react';
import EngineMonitor, { EngineMonitorSkeleton } from '../components/EngineMonitor';
import LiveAuditStream, { LiveAuditStreamSkeleton } from '../components/LiveAuditStream';
import InferenceLatency, { InferenceLatencySkeleton } from '../components/InferenceLatency';
import SystemMetrics, { SystemMetricsSkeleton } from '../components/SystemMetrics';

// API health check hook
function useHealthStatus() {
  const [status, setStatus] = useState({
    api: 'operational',
    websocket: 'connected',
    database: 'healthy',
    ai: 'active',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setLoading(false);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return { status, loading };
}

export default function SystemHealth() {
  const [deploymentMode, setDeploymentMode] = useState<'edge' | 'cloud'>('edge');
  const { status, loading } = useHealthStatus();

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

        {/* Deployment Toggle */}
        <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-lg p-1">
          <button
            onClick={() => setDeploymentMode('edge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${deploymentMode === 'edge'
              ? 'bg-white text-[#0F172A] shadow-sm'
              : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
          >
            <Server size={14} />
            Edge Inference
          </button>
          <button
            onClick={() => setDeploymentMode('cloud')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${deploymentMode === 'cloud'
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
      {loading ? (
        <SystemMetricsSkeleton />
      ) : (
        <SystemMetrics />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Engine Monitor */}
        <div className="lg:col-span-1">
          {loading ? (
            <EngineMonitorSkeleton />
          ) : (
            <EngineMonitor />
          )}
        </div>

        {/* Middle Column - Live Audit Stream */}
        <div className="lg:col-span-1">
          {loading ? (
            <LiveAuditStreamSkeleton />
          ) : (
            <LiveAuditStream />
          )}
        </div>

        {/* Right Column - Inference Latency */}
        <div className="lg:col-span-1">
          {loading ? (
            <InferenceLatencySkeleton />
          ) : (
            <InferenceLatency />
          )}
        </div>
      </div>

      {/* Alert Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0B1120] border border-[#F59E0B]/30 rounded-lg">
        <AlertCircle size={18} className="text-[#F59E0B] shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#F59E0B]">Performance Notice</p>
          <p className="text-xs text-[#64748B]">
            TRI-AXIAL STATE ENCODER at 88% CPU. Consider scaling edge inference nodes.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Download, Users, Building, Shield, AlertTriangle } from 'lucide-react';
import { useAppState, personaConfig } from '../context/AppContext';
import { useWebSocket, useMockWebSocket } from '../hooks/useWebSocket';
import MetricCard, { MetricCardSkeleton } from '../components/MetricCard';
import RadarChart, { RadarChartSkeleton } from '../components/RadarChart';
import NodeMap, { NodeMapSkeleton } from '../components/NodeMap';

// Type definitions
type Persona = 'commuter' | 'station_manager' | 'first_responder';

export default function Overview() {
  const { 
    currentPersona, 
    setCurrentPersona, 
    currentLocationId,
    setCurrentLocationId,
    locations,
    exportData 
  } = useAppState();
  
  // Use mock WebSocket for development (switch to useWebSocket for production)
  const { state: wsState, isConnected } = useMockWebSocket(currentLocationId);

  const handleExport = useCallback(() => {
    const csv = exportData();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crowdstate_export_${new Date().toISOString().slice(0, 19)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportData]);

  const currentLocation = locations.find(l => l.id === currentLocationId) || locations[0];
  const activeNodesCount = locations.length;

  // Get current metrics from WebSocket or fallback
  const rho = wsState?.rho ?? 0.35;
  const sigma = wsState?.sigma ?? 0.28;
  const delta = wsState?.delta ?? 0.22;
  const predictedDelta = Math.min(1, delta * 1.2); // Simple prediction

  // Determine metric status
  const getMetricStatus = (value: number): 'NORMAL' | 'ELEVATED' | 'CRITICAL' => {
    if (value > 0.7) return 'CRITICAL';
    if (value > 0.4) return 'ELEVATED';
    return 'NORMAL';
  };

  const getMetricDescription = (label: string, status: string): string => {
    const descriptions: Record<string, Record<string, string>> = {
      'Density (ρ)': {
        'NORMAL': 'Low crowd density',
        'ELEVATED': 'Moderate crowding',
        'CRITICAL': 'High density warning',
      },
      'Sensory (Σ)': {
        'NORMAL': 'Quiet environment',
        'ELEVATED': 'Elevated noise levels',
        'CRITICAL': 'High sensory load',
      },
      'Volatility (Δ)': {
        'NORMAL': 'Stable conditions',
        'ELEVATED': 'Some movement detected',
        'CRITICAL': 'Erratic movement patterns',
      },
    };
    return descriptions[label]?.[status] || 'Monitoring...';
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-2">
            Stakeholder Overview
          </h1>
          
          {/* Persona Tabs */}
          <div className="flex items-center gap-1 bg-[#F1F5F9] rounded-lg p-1 w-fit">
            {(Object.keys(personaConfig) as Persona[]).map((persona) => {
              const config = personaConfig[persona];
              const isActive = currentPersona === persona;
              
              return (
                <button
                  key={persona}
                  onClick={() => setCurrentPersona(persona)}
                  className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive 
                      ? 'bg-white text-[#0F172A] shadow-sm' 
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl font-bold text-[#0F172A] font-helvetica">
                {activeNodesCount}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Distributed
              </span>
            </div>
            <span className="text-xs text-[#94A3B8]">Active Nodes</span>
          </div>
          
          <div className="h-10 w-px bg-[#E2E8F0]" />
          
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              {personaConfig[currentPersona].description}
            </span>
            <div className="text-xs text-[#94A3B8]">Persona Profile</div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Map + Radar */}
        <div className="space-y-4">
          {/* Node Map */}
          {isConnected ? (
            <NodeMap
              nodes={locations}
              selectedNodeId={currentLocationId}
              onNodeSelect={setCurrentLocationId}
              width={400}
              height={300}
            />
          ) : (
            <NodeMapSkeleton width={400} height={300} />
          )}

          {/* Radar Chart */}
          {isConnected ? (
            <RadarChart
              rho={rho}
              sigma={sigma}
              delta={delta}
              predicted_rho={rho}
              predicted_sigma={sigma}
              predicted_delta={predictedDelta}
              size={400}
            />
          ) : (
            <RadarChartSkeleton size={400} />
          )}
        </div>

        {/* Right Column - Node Details + Metrics */}
        <div className="space-y-4">
          {/* Selected Node Info */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#0F172A] font-helvetica">
                {currentLocation.name}
              </h3>
              <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                currentLocation.status === 'OPTIMAL' 
                  ? 'bg-[#F0FDF4] text-[#10B981]' 
                  : 'bg-[#FFFBEB] text-[#F59E0B]'
              }`}>
                {currentLocation.status}
              </div>
            </div>
            
            {/* Mini metrics preview */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#F8FAFC] rounded p-2">
                <div className="text-lg font-bold text-[#0F172A] font-mono">
                  {rho.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#64748B] uppercase">Density</div>
              </div>
              <div className="bg-[#F8FAFC] rounded p-2">
                <div className="text-lg font-bold text-[#0F172A] font-mono">
                  {sigma.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#64748B] uppercase">Sensory</div>
              </div>
              <div className="bg-[#F8FAFC] rounded p-2">
                <div className="text-lg font-bold text-[#0F172A] font-mono">
                  {delta.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#64748B] uppercase">Volatility</div>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="flex flex-col gap-4">
            {isConnected ? (
              <>
                <MetricCard
                  label="Density (ρ)"
                  value={rho}
                  status={getMetricStatus(rho)}
                  icon="rho"
                  description={getMetricDescription('Density (ρ)', getMetricStatus(rho))}
                  technical_details={{
                    raw_value: rho,
                    threshold: 0.4,
                    confidence: 0.92,
                  }}
                />
                <MetricCard
                  label="Sensory (Σ)"
                  value={sigma}
                  status={getMetricStatus(sigma)}
                  icon="sigma"
                  description={getMetricDescription('Sensory (Σ)', getMetricStatus(sigma))}
                  technical_details={{
                    raw_value: sigma,
                    threshold: 0.5,
                    confidence: 0.88,
                  }}
                />
                <MetricCard
                  label="Volatility (Δ)"
                  value={delta}
                  status={getMetricStatus(delta)}
                  icon="delta"
                  description={getMetricDescription('Volatility (Δ)', getMetricStatus(delta))}
                  technical_details={{
                    raw_value: delta,
                    threshold: 0.5,
                    confidence: 0.85,
                  }}
                />
              </>
            ) : (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0F172A] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-colors"
          >
            <Download size={16} />
            Technical Export (CSV)
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {wsState?.alerts && wsState.alerts.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E2E8F0] p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-[#0F172A] font-helvetica">
              Active Alerts ({wsState.alerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {wsState.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  alert.priority === 'CRITICAL'
                    ? 'bg-[#FEF2F2] border border-[#EF4444]/20'
                    : alert.priority === 'WARNING'
                    ? 'bg-[#FFFBEB] border border-[#F59E0B]/20'
                    : 'bg-[#F8FAFC] border border-[#E2E8F0]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    alert.priority === 'CRITICAL'
                      ? 'bg-[#EF4444]'
                      : alert.priority === 'WARNING'
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#10B981]'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#0F172A]">{alert.message}</p>
                  <p className="text-xs text-[#64748B]">{alert.type}</p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    alert.priority === 'CRITICAL'
                      ? 'bg-[#EF4444]/10 text-[#EF4444]'
                      : alert.priority === 'WARNING'
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      : 'bg-[#10B981]/10 text-[#10B981]'
                  }`}
                >
                  {alert.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

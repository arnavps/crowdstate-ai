import { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';
  rho: number;
  sigma: number;
  delta: number;
}

interface NodeMapProps {
  nodes: Node[];
  selectedNodeId: string;
  onNodeSelect: (nodeId: string) => void;
  width?: number;
  height?: number;
}

const statusColors = {
  OPTIMAL: '#10B981',
  ELEVATED: '#F59E0B',
  CRITICAL: '#EF4444',
};

export default function NodeMap({
  nodes,
  selectedNodeId,
  onNodeSelect,
  width = 400,
  height = 300,
}: NodeMapProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div 
      className="relative bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] overflow-hidden"
      style={{ width, height }}
    >
      {/* Map Background - Grid pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(#E2E8F0 1px, transparent 1px),
            linear-gradient(90deg, #E2E8F0 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Map Labels */}
      <div className="absolute top-4 left-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Regional Nodes
        </span>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span className="text-[10px] text-[#64748B]">Optimal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-[10px] text-[#64748B]">Elevated</span>
        </div>
      </div>

      {/* Node Markers */}
      {nodes.map((node) => {
        const isSelected = node.id === selectedNodeId;
        const isHovered = node.id === hoveredNode;
        const statusColor = statusColors[node.status];

        return (
          <div
            key={node.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              zIndex: isSelected || isHovered ? 10 : 1,
            }}
            onClick={() => onNodeSelect(node.id)}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Pin Icon */}
            <div
              className={`relative transition-transform duration-200 ${
                isSelected ? 'scale-125' : isHovered ? 'scale-110' : 'scale-100'
              }`}
            >
              <MapPin
                size={isSelected ? 32 : 28}
                fill={isSelected ? '#F59E0B' : '#CBD5E1'}
                color={isSelected ? '#F59E0B' : '#64748B'}
                strokeWidth={2}
              />
              
              {/* Status indicator dot */}
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: statusColor }}
              />
            </div>

            {/* Tooltip */}
            {(isHovered || isSelected) && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-white rounded-lg shadow-lg border border-[#E2E8F0] p-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0F172A]">{node.name}</span>
                  {node.status === 'CRITICAL' && (
                    <AlertCircle size={14} className="text-[#EF4444]" />
                  )}
                </div>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">ρ (Density)</span>
                    <span className="font-mono font-semibold">{node.rho.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Σ (Sensory)</span>
                    <span className="font-mono font-semibold">{node.sigma.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Δ (Volatility)</span>
                    <span className="font-mono font-semibold">{node.delta.toFixed(2)}</span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-white border-r border-b border-[#E2E8F0] transform rotate-45" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Connection lines between nodes (visual only) */}
      <svg className="absolute inset-0 pointer-events-none opacity-20">
        {nodes.map((node, i) =>
          nodes.slice(i + 1).map((otherNode) => (
            <line
              key={`${node.id}-${otherNode.id}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${otherNode.x}%`}
              y2={`${otherNode.y}%`}
              stroke="#94A3B8"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))
        )}
      </svg>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-[#64748B]">
          <span className="font-bold text-[#0F172A]">{nodes.length}</span> Active Nodes
        </span>
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
          {nodes.filter(n => n.status === 'OPTIMAL').length} Optimal
        </span>
      </div>
    </div>
  );
}

// Skeleton loader
export function NodeMapSkeleton({ width = 400, height = 300 }: { width?: number; height?: number }) {
  return (
    <div 
      className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] animate-pulse"
      style={{ width, height }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full" style={{
          backgroundImage: `linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      {/* Placeholder pins */}
      <div className="absolute" style={{ left: '30%', top: '40%' }}>
        <div className="w-7 h-7 rounded-full bg-[#E2E8F0]" />
      </div>
      <div className="absolute" style={{ left: '60%', top: '30%' }}>
        <div className="w-7 h-7 rounded-full bg-[#E2E8F0]" />
      </div>
      <div className="absolute" style={{ left: '45%', top: '60%' }}>
        <div className="w-7 h-7 rounded-full bg-[#E2E8F0]" />
      </div>
    </div>
  );
}

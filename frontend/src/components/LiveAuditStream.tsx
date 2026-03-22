import { useEffect, useState, useRef } from 'react';
import { Terminal, AlertCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'SUCCESS';
  message: string;
}

// Hook for audit stream
export function useAuditStream() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial logs
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 60000).toLocaleTimeString('en-US', { hour12: false }),
        level: 'INFO',
        message: 'INITIALIZING...',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 59000).toLocaleTimeString('en-US', { hour12: false }),
        level: 'SUCCESS',
        message: 'SYNC_COMPLETE',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 55000).toLocaleTimeString('en-US', { hour12: false }),
        level: 'INFO',
        message: 'MODEL_LOADED_YOLOV9',
      },
    ];
    setLogs(initialLogs);
    setIsConnected(true);

    // Simulate real-time log streaming
    const messages = [
      { level: 'INFO' as const, message: 'INFERENCE_BATCH_024_COMPLETE' },
      { level: 'WARNING' as const, message: 'SIGMA_FLUX_DETECTED_0.02' },
      { level: 'INFO' as const, message: 'STATE_VECTOR_UPDATED' },
      { level: 'SUCCESS' as const, message: 'ROUTE_CALCULATED_C' },
      { level: 'INFO' as const, message: 'WEBSOCKET_HEARTBEAT_12MS' },
      { level: 'INFO' as const, message: 'DENSITY_RHO_0.42_UPDATED' },
      { level: 'WARNING' as const, message: 'LATENCY_SPIKE_156MS' },
      { level: 'SUCCESS' as const, message: 'AURAPATH_SYNC_OK' },
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const newLog: LogEntry = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        level: randomMsg.level,
        message: randomMsg.message,
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 100));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { logs, isConnected };
}

interface LiveAuditStreamProps {
  logs?: LogEntry[];
  maxEntries?: number;
}

const levelColors = {
  INFO: 'text-[#3B82F6]',     // Blue
  WARNING: 'text-[#F59E0B]',  // Yellow/Orange
  SUCCESS: 'text-[#10B981]',  // Green
};

export default function LiveAuditStream({ 
  logs: propLogs,
  maxEntries = 50 
}: LiveAuditStreamProps) {
  const { logs: streamLogs } = useAuditStream();
  const logs = propLogs ?? streamLogs;
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayLogs = logs.slice(0, maxEntries);

  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#06B6D4]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Live Audit Stream
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-mono text-[#10B981]">LIVE</span>
        </div>
      </div>

      {/* Log Count */}
      <div className="mb-2">
        <span className="text-[10px] font-mono text-[#475569]">
          {displayLogs.length} entries
        </span>
      </div>

      {/* Log Stream - Terminal Style */}
      <div 
        ref={scrollRef}
        className="space-y-0 max-h-[280px] overflow-y-auto font-mono text-xs scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent"
      >
        {displayLogs.map((log, index) => {
          const colorClass = levelColors[log.level];
          const isLatest = index === 0;
          
          return (
            <div
              key={log.id}
              className={`py-1 border-b border-[#1E293B]/30 last:border-0 ${
                isLatest ? 'animate-in fade-in duration-300' : ''
              }`}
            >
              <span className="text-[#475569]">[{log.timestamp}]</span>{' '}
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}

        {displayLogs.length === 0 && (
          <div className="py-8 text-center text-[#475569]">
            <AlertCircle size={16} className="mx-auto mb-2" />
            <span className="text-xs">No logs available</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-[#3B82F6]">● INFO</span>
          <span className="text-[#F59E0B]">● WARNING</span>
          <span className="text-[#10B981]">● SUCCESS</span>
        </div>
        
        <button
          onClick={() => {}}
          className="text-[10px] text-[#64748B] hover:text-[#94A3B8] transition-colors font-mono"
        >
          [CLEAR]
        </button>
      </div>
    </div>
  );
}

// Skeleton loader
export function LiveAuditStreamSkeleton() {
  return (
    <div className="bg-[#0B1120] rounded-lg border border-[#1E293B] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-28 h-3 bg-[#1E293B] rounded" />
        <div className="w-12 h-4 bg-[#1E293B] rounded" />
      </div>
      <div className="space-y-1">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex gap-2 py-1">
            <div className="w-16 h-3 bg-[#1E293B] rounded" />
            <div className="w-48 h-3 bg-[#334155] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

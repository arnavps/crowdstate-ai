import { useEffect, useState, useRef } from 'react';
import { Terminal, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  component: string;
  message: string;
  details?: string;
}

interface AuditLogStreamProps {
  maxEntries?: number;
  filter?: 'all' | 'errors' | 'warnings';
}

const levelConfig = {
  INFO: {
    icon: Info,
    color: '#3B82F6',
    bgColor: 'bg-[#3B82F6]/10',
    textColor: 'text-[#3B82F6]',
  },
  WARNING: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bgColor: 'bg-[#F59E0B]/10',
    textColor: 'text-[#F59E0B]',
  },
  ERROR: {
    icon: AlertTriangle,
    color: '#EF4444',
    bgColor: 'bg-[#EF4444]/10',
    textColor: 'text-[#EF4444]',
  },
  SUCCESS: {
    icon: CheckCircle,
    color: '#10B981',
    bgColor: 'bg-[#10B981]/10',
    textColor: 'text-[#10B981]',
  },
};

// Generate mock log entries
function generateMockLog(): LogEntry {
  const components = ['YOLOv8', 'LSTM', 'StateFusion', 'WebSocket', 'API', 'Database'];
  const messages = [
    { level: 'INFO' as const, message: 'Inference batch completed', details: 'Processed 24 frames' },
    { level: 'SUCCESS' as const, message: 'Model synchronization complete', details: 'All nodes aligned' },
    { level: 'WARNING' as const, message: 'Latency spike detected', details: '156ms > threshold' },
    { level: 'INFO' as const, message: 'State vector updated', details: 'ρ=0.42, Σ=0.38' },
    { level: 'INFO' as const, message: 'WebSocket heartbeat received', details: 'latency: 12ms' },
    { level: 'SUCCESS' as const, message: 'AuraPath route calculated', details: '3 routes generated' },
  ];
  
  const entry = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toLocaleTimeString(),
    level: entry.level,
    component: components[Math.floor(Math.random() * components.length)],
    message: entry.message,
    details: entry.details,
  };
}

export default function AuditLogStream({ 
  maxEntries = 50,
  filter = 'all' 
}: AuditLogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Initial logs
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
        level: 'SUCCESS',
        component: 'System',
        message: 'Engine initialization complete',
        details: 'All modules loaded',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3000).toLocaleTimeString(),
        level: 'INFO',
        component: 'YOLOv8',
        message: 'Model loaded',
        details: 'yolov8n.pt - 6.2MB',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 2000).toLocaleTimeString(),
        level: 'INFO',
        component: 'LSTM',
        message: 'Temporal model ready',
        details: 'Sequence length: 60',
      },
    ];
    setLogs(initialLogs);
  }, []);

  // Real-time log streaming
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog = generateMockLog();
      setLogs(prev => {
        const updated = [newLog, ...prev].slice(0, maxEntries);
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused, maxEntries]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => 
        filter === 'errors' ? log.level === 'ERROR' : log.level === 'WARNING'
      );

  const errorCount = logs.filter(l => l.level === 'ERROR').length;
  const warningCount = logs.filter(l => l.level === 'WARNING').length;

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#0D9488]" />
          <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
            Real-Time Audit Log
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="flex items-center gap-2 text-[10px]">
            {errorCount > 0 && (
              <span className="px-2 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded">
                {errorCount} ERRORS
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-0.5 bg-[#F59E0B]/10 text-[#F59E0B] rounded">
                {warningCount} WARNINGS
              </span>
            )}
          </div>

          {/* Pause/Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
              isPaused 
                ? 'bg-[#F59E0B]/20 text-[#F59E0B]' 
                : 'bg-[#1E293B] text-[#64748B] hover:text-[#CBD5E1]'
            }`}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Log Count */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-[#64748B]">
          Showing {filteredLogs.length} entries
        </span>
        <span className="text-[10px] text-[#475569]">
          (Total: {logs.length})
        </span>
      </div>

      {/* Log Stream */}
      <div 
        ref={scrollRef}
        className="space-y-1.5 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#334155] scrollbar-track-transparent"
      >
        {filteredLogs.map((log) => {
          const config = levelConfig[log.level];
          const Icon = config.icon;

          return (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2.5 bg-[#1E293B]/30 rounded border border-[#334155]/30 hover:border-[#334155] transition-colors group"
            >
              {/* Level Icon */}
              <div className={`p-1 rounded ${config.bgColor} shrink-0`}>
                <Icon size={12} className={config.textColor} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-[#475569] font-mono">
                    {log.timestamp}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}>
                    {log.level}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    [{log.component}]
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] font-mono truncate">
                  {log.message}
                </p>
                {log.details && (
                  <p className="text-[10px] text-[#475569] font-mono mt-0.5">
                    → {log.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex items-center justify-center py-8 text-[#475569]">
            <Clock size={16} className="mr-2" />
            <span className="text-xs">No logs to display</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-[#334155] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-[#F59E0B]' : 'bg-[#10B981] animate-pulse'}`} />
          <span className="text-[10px] text-[#64748B] uppercase tracking-wider">
            {isPaused ? 'STREAM PAUSED' : 'LIVE STREAM'}
          </span>
        </div>
        
        <button
          onClick={() => setLogs([])}
          className="text-[10px] text-[#64748B] hover:text-[#CBD5E1] transition-colors"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}

// Skeleton loader
export function AuditLogStreamSkeleton() {
  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-32 h-3 bg-[#1E293B] rounded" />
        <div className="w-16 h-5 bg-[#1E293B] rounded" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 bg-[#1E293B]/30 rounded">
            <div className="w-5 h-5 rounded bg-[#334155]" />
            <div className="flex-1">
              <div className="w-3/4 h-3 rounded bg-[#334155] mb-1" />
              <div className="w-1/2 h-2 rounded bg-[#1E293B]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

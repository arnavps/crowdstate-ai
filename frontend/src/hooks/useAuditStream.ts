import { useEffect, useRef, useState, useCallback } from 'react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  component: string;
  message: string;
  details?: string;
  location_id?: string;
}

interface UseAuditStreamReturn {
  logs: AuditLogEntry[];
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnect: () => void;
  clearLogs: () => void;
  connectionAttempts: number;
}

export function useAuditStream(locationId?: string): UseAuditStreamReturn {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsBufferRef = useRef<AuditLogEntry[]>([]);
  const maxBufferSize = 100;

  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;
  const heartbeatInterval = 30000;

  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const addLog = useCallback((entry: AuditLogEntry) => {
    logsBufferRef.current = [entry, ...logsBufferRef.current].slice(0, maxBufferSize);
    setLogs([...logsBufferRef.current]);
  }, []);

  const connect = useCallback(() => {
    const WS_URL = import.meta.env.VITE_AUDIT_WS_URL ||
      (locationId
        ? `ws://localhost:8000/ws/audit/${locationId}`
        : 'ws://localhost:8000/ws/audit');

    try {
      setIsReconnecting(connectionAttempts > 0);

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AuditStream] Connected');
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        setConnectionAttempts(0);

        // Request initial log history
        ws.send(JSON.stringify({
          type: 'init',
          location_id: locationId,
          buffer_size: maxBufferSize,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'audit_log') {
            addLog(message.data);
          } else if (message.type === 'audit_history') {
            // Receive batch of historical logs
            const history: AuditLogEntry[] = message.data;
            logsBufferRef.current = [...history, ...logsBufferRef.current].slice(0, maxBufferSize);
            setLogs([...logsBufferRef.current]);
          } else if (message.type === 'heartbeat') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
        } catch (err) {
          console.error('[AuditStream] Failed to parse message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('[AuditStream] Connection error:', err);
        setError(new Error('Audit stream connection error'));
      };

      ws.onclose = (event) => {
        console.log(`[AuditStream] Disconnected (code: ${event.code})`);
        setIsConnected(false);
        wsRef.current = null;

        const nextAttempt = connectionAttempts + 1;

        if (!event.wasClean && nextAttempt <= maxReconnectAttempts) {
          setConnectionAttempts(nextAttempt);

          const delay = Math.min(
            baseReconnectDelay * Math.pow(2, nextAttempt - 1) + Math.random() * 1000,
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (nextAttempt > maxReconnectAttempts) {
          setError(new Error(`Max reconnection attempts reached`));
          setIsReconnecting(false);
        }
      };

      // Start heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
      }, heartbeatInterval);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create WebSocket'));
      setIsReconnecting(false);
    }
  }, [locationId, connectionAttempts, addLog]);

  const reconnect = useCallback(() => {
    clearTimeouts();
    setConnectionAttempts(0);
    setError(null);
    connect();
  }, [clearTimeouts, connect]);

  const clearLogs = useCallback(() => {
    logsBufferRef.current = [];
    setLogs([]);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      clearTimeouts();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect, clearTimeouts]);

  return {
    logs,
    isConnected,
    isReconnecting,
    error,
    reconnect,
    clearLogs,
    connectionAttempts,
  };
}

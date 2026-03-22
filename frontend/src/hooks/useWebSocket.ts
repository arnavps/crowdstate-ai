import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketState {
  rho: number;
  sigma: number;
  delta: number;
  state_score: number;
  status: 'SAFE' | 'CAUTION' | 'DANGER';
  message: string;
  alerts: Array<{
    type: string;
    message: string;
    priority: 'INFO' | 'WARNING' | 'CRITICAL';
  }>;
  recommendations: string[];
  timestamp: number;
}

interface UseWebSocketReturn {
  state: WebSocketState | null;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

const defaultState: WebSocketState = {
  rho: 0.3,
  sigma: 0.25,
  delta: 0.2,
  state_score: 45,
  status: 'SAFE',
  message: 'Normal conditions',
  alerts: [],
  recommendations: ['Optimal conditions - proceed normally'],
  timestamp: Date.now(),
};

export function useWebSocket(locationId: string): UseWebSocketReturn {
  const [state, setState] = useState<WebSocketState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const WS_URL = import.meta.env.VITE_WS_URL ?? `ws://localhost:8000/ws/live/${locationId}`;
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'state_update') {
            setState({
              rho: data.state.rho,
              sigma: data.state.sigma,
              delta: data.state.delta,
              state_score: data.state.state_score,
              status: data.state.status,
              message: data.state.message,
              alerts: data.alerts || [],
              recommendations: data.recommendations || [],
              timestamp: data.timestamp,
            });
          } else if (data.type === 'initial_state') {
            setState(data.state);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Attempt reconnection
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Reconnecting... attempt ${reconnectAttemptsRef.current}`);
            connect();
          }, delay);
        } else {
          setError('Max reconnection attempts reached');
        }
      };
    } catch (err) {
      setError('Failed to create WebSocket connection');
      setIsConnected(false);
    }
  }, [locationId]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { state, isConnected, error, reconnect };
}

// Fallback mock hook for development without backend
export function useMockWebSocket(locationId: string): UseWebSocketReturn {
  const [state, setState] = useState<WebSocketState>(defaultState);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setState(prev => {
        const variation = () => (Math.random() - 0.5) * 0.05;
        const newRho = Math.max(0, Math.min(1, prev.rho + variation()));
        const newSigma = Math.max(0, Math.min(1, prev.sigma + variation()));
        const newDelta = Math.max(0, Math.min(1, prev.delta + variation()));
        
        const score = (newRho * 0.6 + newSigma * 0.2 + newDelta * 0.2) * 100;
        
        let status: 'SAFE' | 'CAUTION' | 'DANGER' = 'SAFE';
        if (score > 70) status = 'DANGER';
        else if (score > 40) status = 'CAUTION';
        
        return {
          ...prev,
          rho: newRho,
          sigma: newSigma,
          delta: newDelta,
          state_score: score,
          status,
          timestamp: Date.now(),
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { 
    state, 
    isConnected, 
    error: null, 
    reconnect: () => console.log('Mock reconnect') 
  };
}

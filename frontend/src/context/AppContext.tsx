import { createContext, useContext, useState, ReactNode } from 'react';

type Persona = 'commuter' | 'station_manager' | 'first_responder';
type LocationStatus = 'OPTIMAL' | 'ELEVATED' | 'CRITICAL';

interface Location {
  id: string;
  name: string;
  x: number;
  y: number;
  status: LocationStatus;
  rho: number;
  sigma: number;
  delta: number;
}

interface StateData {
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

interface AppState {
  // Persona
  currentPersona: Persona;
  setCurrentPersona: (persona: Persona) => void;
  
  // Location
  currentLocationId: string;
  setCurrentLocationId: (id: string) => void;
  locations: Location[];
  
  // Live Data
  stateData: StateData | null;
  setStateData: (data: StateData) => void;
  
  // WebSocket Status
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  
  // Export
  exportData: () => string;
}

const defaultLocations: Location[] = [
  { id: 'central-station', name: 'Central Station', x: 30, y: 40, status: 'OPTIMAL', rho: 0.35, sigma: 0.28, delta: 0.22 },
  { id: 'platform-2', name: 'Platform 2', x: 60, y: 30, status: 'ELEVATED', rho: 0.55, sigma: 0.42, delta: 0.38 },
  { id: 'west-entrance', name: 'West Entrance', x: 45, y: 60, status: 'OPTIMAL', rho: 0.28, sigma: 0.35, delta: 0.18 },
];

const defaultStateData: StateData = {
  rho: 0.35,
  sigma: 0.28,
  delta: 0.22,
  state_score: 42,
  status: 'SAFE',
  message: 'Low density, stable conditions',
  alerts: [],
  recommendations: ['Optimal conditions - proceed normally'],
  timestamp: Date.now(),
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona>('commuter');
  const [currentLocationId, setCurrentLocationId] = useState<string>('central-station');
  const [locations] = useState<Location[]>(defaultLocations);
  const [stateData, setStateData] = useState<StateData | null>(defaultStateData);
  const [isConnected, setIsConnected] = useState(false);

  const exportData = () => {
    if (!stateData) return '';
    
    const headers = ['Timestamp', 'Location ID', 'Rho (Density)', 'Sigma (Sensory)', 'Delta (Volatility)', 'State Score', 'Status'];
    const row = [
      new Date(stateData.timestamp).toISOString(),
      currentLocationId,
      stateData.rho.toFixed(4),
      stateData.sigma.toFixed(4),
      stateData.delta.toFixed(4),
      stateData.state_score.toFixed(2),
      stateData.status,
    ];
    
    return [headers.join(','), row.join(',')].join('\n');
  };

  const value: AppState = {
    currentPersona,
    setCurrentPersona,
    currentLocationId,
    setCurrentLocationId,
    locations,
    stateData,
    setStateData,
    isConnected,
    setIsConnected,
    exportData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

// Persona display config
export const personaConfig = {
  commuter: {
    label: 'COMMUTER',
    description: 'Sensory-First',
    color: '#0D9488',
    icon: 'users',
  },
  station_manager: {
    label: 'STATION MGR',
    description: 'Operations-Focused',
    color: '#6366F1',
    icon: 'building',
  },
  first_responder: {
    label: '1ST RESPONDER',
    description: 'Critical-First',
    color: '#EF4444',
    icon: 'shield',
  },
} as const;

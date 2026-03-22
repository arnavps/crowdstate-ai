import { useState, useCallback, useEffect } from 'react';
import { MapPin, Navigation, Share2, AlertCircle } from 'lucide-react';
import { useAppState } from '../context/AppContext';
import { useWebSocket, useMockWebSocket } from '../hooks/useWebSocket';
import RouteMap, { RouteMapSkeleton } from '../components/Map/RouteMap';
import RouteOptions, { RouteOptionsSkeleton } from '../components/Map/RouteOptions';
import StateVectorPanel, { StateVectorPanelSkeleton } from '../components/Map/StateVectorPanel';

// Route calculation utilities
interface Persona {
  id: string;
  weights: {
    rho: number;
    sigma: number;
    delta: number;
  };
}

interface RouteSegment {
  lat: number;
  lng: number;
  rho: number;
  sigma: number;
  delta: number;
}

interface CalculatedRoute {
  id: string;
  segments: RouteSegment[];
  score: number;
  color: string;
  isSelected: boolean;
}

const personas: Record<string, Persona> = {
  commuter: {
    id: 'commuter',
    weights: { rho: 0.6, sigma: 0.2, delta: 0.2 },
  },
  station_manager: {
    id: 'station_manager',
    weights: { rho: 0.4, sigma: 0.3, delta: 0.3 },
  },
  first_responder: {
    id: 'first_responder',
    weights: { rho: 0.2, sigma: 0.2, delta: 0.6 },
  },
  neurodivergent: {
    id: 'neurodivergent',
    weights: { rho: 0.2, sigma: 0.6, delta: 0.2 },
  },
};

function calculateRouteScore(segments: RouteSegment[], persona: Persona): number {
  if (segments.length === 0) return 0;

  const totalScore = segments.reduce((score, seg) => {
    const weighted =
      seg.rho * persona.weights.rho +
      seg.sigma * persona.weights.sigma +
      seg.delta * persona.weights.delta;
    return score + weighted;
  }, 0);

  return totalScore / segments.length;
}

// Mock route data generator
function generateMockRoutes(center: { lat: number; lng: number }): CalculatedRoute[] {
  const routeA: RouteSegment[] = [
    { lat: center.lat, lng: center.lng, rho: 0.35, sigma: 0.28, delta: 0.22 },
    { lat: center.lat + 0.001, lng: center.lng + 0.002, rho: 0.55, sigma: 0.42, delta: 0.38 },
    { lat: center.lat + 0.002, lng: center.lng + 0.003, rho: 0.72, sigma: 0.58, delta: 0.45 },
    { lat: center.lat + 0.003, lng: center.lng + 0.004, rho: 0.92, sigma: 0.65, delta: 0.52 },
  ];

  const routeB: RouteSegment[] = [
    { lat: center.lat, lng: center.lng, rho: 0.35, sigma: 0.28, delta: 0.22 },
    { lat: center.lat + 0.002, lng: center.lng + 0.001, rho: 0.42, sigma: 0.75, delta: 0.35 },
    { lat: center.lat + 0.003, lng: center.lng + 0.002, rho: 0.38, sigma: 0.82, delta: 0.42 },
    { lat: center.lat + 0.004, lng: center.lng + 0.003, rho: 0.45, sigma: 0.68, delta: 0.48 },
  ];

  const routeC: RouteSegment[] = [
    { lat: center.lat, lng: center.lng, rho: 0.35, sigma: 0.28, delta: 0.22 },
    { lat: center.lat + 0.0015, lng: center.lng - 0.001, rho: 0.25, sigma: 0.15, delta: 0.12 },
    { lat: center.lat + 0.003, lng: center.lng - 0.002, rho: 0.18, sigma: 0.12, delta: 0.08 },
    { lat: center.lat + 0.0045, lng: center.lng - 0.003, rho: 0.22, sigma: 0.18, delta: 0.15 },
  ];

  const persona = personas.neurodivergent;

  return [
    {
      id: 'Route A: Standard Path',
      segments: routeA,
      score: calculateRouteScore(routeA, persona),
      color: '#94A3B8',
      isSelected: false,
    },
    {
      id: 'Route B: High Σ Distress',
      segments: routeB,
      score: calculateRouteScore(routeB, persona),
      color: '#F472B6',
      isSelected: false,
    },
    {
      id: 'Route C: AuraPath™',
      segments: routeC,
      score: calculateRouteScore(routeC, persona),
      color: '#0D9488',
      isSelected: true,
    },
  ];
}

export default function AuraPathMap() {
  const { currentPersona, stateData } = useAppState();
  const { state: wsState, isConnected } = useMockWebSocket('aurapath-demo');

  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState('Route C: AuraPath™');
  const [routes, setRoutes] = useState<CalculatedRoute[]>([]);
  const [origin, setOrigin] = useState({ lat: 40.7128, lng: -74.006, name: 'Current Location' });
  const [destination, setDestination] = useState({ lat: 40.717, lng: -74.002, name: 'Platform 4' });
  const [alert, setAlert] = useState<string | null>(null);

  // Generate routes on mount
  useEffect(() => {
    const mockRoutes = generateMockRoutes(origin);
    setRoutes(mockRoutes);
  }, [origin]);

  // Check for route condition changes
  useEffect(() => {
    if (wsState?.status === 'DANGER') {
      setAlert('Route conditions have changed. Recalculating...');
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [wsState?.status]);

  const handleSelectRoute = useCallback((routeId: string) => {
    setSelectedRouteId(routeId);
    setRoutes(prev =>
      prev.map(r => ({ ...r, isSelected: r.id === routeId }))
    );
  }, []);

  const handleShareRoute = () => {
    const route = routes.find(r => r.id === selectedRouteId);
    if (route) {
      const url = `${window.location.origin}/aurapath?route=${encodeURIComponent(route.id)}&origin=${origin.lat},${origin.lng}&dest=${destination.lat},${destination.lng}`;
      navigator.clipboard.writeText(url);
      window.alert('Route link copied to clipboard!');
    }
  };

  const currentMetrics = wsState || stateData || { rho: 0.142, sigma: 0.088, delta: 0.021, status: 'SAFE' as const };

  // Convert routes for RouteOptions component
  const routeOptions = routes.map(route => ({
    id: route.id,
    name: route.id.split(':')[1]?.trim() || route.id,
    icon: route.id.includes('AuraPath') ? 'leaf' : route.id.includes('Distress') ? 'volume' : 'zap' as 'zap' | 'volume' | 'leaf',
    duration: route.id.includes('AuraPath') ? '18m' : route.id.includes('Standard') ? '12m' : '15m',
    details: route.id.includes('AuraPath')
      ? 'Sensory Isolated (Calm)'
      : route.id.includes('Distress')
        ? 'Acoustic texture stress (Elevated)'
        : '92% density (Busy)',
    subDetails: route.id.includes('AuraPath')
      ? 'Low sensory exposure route'
      : route.id.includes('Distress')
        ? 'High noise environment'
        : 'Direct but crowded',
    color: route.id.includes('AuraPath') ? 'teal' : route.id.includes('Distress') ? 'red' : 'gray' as 'gray' | 'red' | 'teal',
    isRecommended: route.id.includes('AuraPath'),
    isSelected: route.isSelected,
    score: route.score,
    metrics: {
      distance: route.segments.length * 0.1,
      density: route.segments.reduce((s, seg) => s + seg.rho, 0) / route.segments.length,
      sensory: route.segments.reduce((s, seg) => s + seg.sigma, 0) / route.segments.length,
      volatility: route.segments.reduce((s, seg) => s + seg.delta, 0) / route.segments.length,
    },
  }));

  const conditionStatus = currentMetrics.status === 'SAFE'
    ? 'OPTIMAL FOR SENSORY NEEDS'
    : currentMetrics.status === 'CAUTION'
      ? 'ELEVATED CONDITIONS'
      : 'HIGH SENSORY ALERT';

  const statusColor = currentMetrics.status === 'SAFE'
    ? 'bg-[#F0FDF4] text-[#10B981]'
    : currentMetrics.status === 'CAUTION'
      ? 'bg-[#FFFBEB] text-[#F59E0B]'
      : 'bg-[#FEF2F2] text-[#EF4444]';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-1">
            AuraPath™ Live Map
          </h1>
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
            {currentMetrics.status === 'SAFE' && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />}
            {conditionStatus}
          </span>
        </div>

        {/* Origin/Destination Inputs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E2E8F0] px-3 py-2">
            <MapPin size={14} className="text-[#10B981]" />
            <input
              type="text"
              value={origin.name}
              onChange={(e) => setOrigin(o => ({ ...o, name: e.target.value }))}
              className="text-sm text-[#0F172A] outline-none w-32"
              placeholder="Origin"
            />
          </div>

          <Navigation size={16} className="text-[#94A3B8]" />

          <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E2E8F0] px-3 py-2">
            <MapPin size={14} className="text-[#EF4444]" />
            <input
              type="text"
              value={destination.name}
              onChange={(e) => setDestination(d => ({ ...d, name: e.target.value }))}
              className="text-sm text-[#0F172A] outline-none w-32"
              placeholder="Destination"
            />
          </div>

          <button
            onClick={handleShareRoute}
            className="flex items-center gap-2 px-3 py-2 bg-[#0F172A] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#FFFBEB] border border-[#F59E0B]/30 rounded-lg">
          <AlertCircle size={16} className="text-[#F59E0B]" />
          <span className="text-sm font-medium text-[#F59E0B]">{alert}</span>
        </div>
      )}

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 grid grid-cols-[1fr_360px] gap-4 min-h-0">
        {/* Left Panel - Map */}
        <div className="min-h-0 rounded-lg overflow-hidden">
          {routes.length > 0 ? (
            <RouteMap
              routes={routes}
              showHeatmap={showHeatmap}
              onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
              center={origin}
              origin={origin}
              destination={destination}
            />
          ) : (
            <RouteMapSkeleton />
          )}
        </div>

        {/* Right Panel - Route Options + State Vector */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Route Options */}
          {routeOptions.length > 0 ? (
            <RouteOptions
              routes={routeOptions}
              onSelectRoute={handleSelectRoute}
            />
          ) : (
            <RouteOptionsSkeleton />
          )}

          {/* State Vector Panel */}
          <StateVectorPanel
            rho={currentMetrics.rho}
            sigma={currentMetrics.sigma}
            delta={currentMetrics.delta}
          />
        </div>
      </div>
    </div>
  );
}

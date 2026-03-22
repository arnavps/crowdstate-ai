import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers, ZoomIn, ZoomOut } from 'lucide-react';

interface RouteSegment {
  lat: number;
  lng: number;
  rho: number;
  sigma: number;
  delta: number;
}

interface Route {
  id: string;
  segments: RouteSegment[];
  color: string;
  isSelected: boolean;
}

interface RouteMapProps {
  routes: Route[];
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  center?: { lat: number; lng: number };
  origin?: { lat: number; lng: number; name: string };
  destination?: { lat: number; lng: number; name: string };
}

// Mock canvas-based map component (replace with Mapbox/Leaflet in production)
export default function RouteMap({
  routes,
  showHeatmap,
  onToggleHeatmap,
  center = { lat: 40.7128, lng: -74.006 },
  origin,
  destination,
}: RouteMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(14);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Draw grid (simulating map tiles)
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    const gridSize = 50 * (zoom / 14);
    for (let x = offset.x % gridSize; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = offset.y % gridSize; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw heatmap overlay if enabled
    if (showHeatmap) {
      // Simulate heatmap with gradient circles
      const heatPoints = [
        { x: width * 0.3, y: height * 0.4, intensity: 0.8 },
        { x: width * 0.6, y: height * 0.5, intensity: 0.6 },
        { x: width * 0.5, y: height * 0.7, intensity: 0.4 },
      ];

      heatPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, 80 * (zoom / 14)
        );
        gradient.addColorStop(0, `rgba(245, 158, 11, ${point.intensity * 0.4})`);
        gradient.addColorStop(0.5, `rgba(245, 158, 11, ${point.intensity * 0.2})`);
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 80 * (zoom / 14), 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw routes
    routes.forEach(route => {
      if (route.segments.length < 2) return;

      ctx.strokeStyle = route.color;
      ctx.lineWidth = route.isSelected ? 4 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add glow effect for selected route
      if (route.isSelected) {
        ctx.shadowColor = route.color;
        ctx.shadowBlur = 15;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      route.segments.forEach((segment, i) => {
        const x = (segment.lng - center.lng) * 1000 * (zoom / 14) + width / 2 + offset.x;
        const y = (center.lat - segment.lat) * 1000 * (zoom / 14) + height / 2 + offset.y;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw origin marker
    if (origin) {
      const x = (origin.lng - center.lng) * 1000 * (zoom / 14) + width / 2 + offset.x;
      const y = (center.lat - origin.lat) * 1000 * (zoom / 14) + height / 2 + offset.y;
      
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(origin.name, x + 12, y + 4);
    }

    // Draw destination marker
    if (destination) {
      const x = (destination.lng - center.lng) * 1000 * (zoom / 14) + width / 2 + offset.x;
      const y = (center.lat - destination.lat) * 1000 * (zoom / 14) + height / 2 + offset.y;
      
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(destination.name, x + 12, y + 4);
    }

  }, [routes, showHeatmap, center, zoom, offset]);

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(z => Math.min(20, z + 1));
  const handleZoomOut = () => setZoom(z => Math.max(10, z - 1));

  return (
    <div className="relative w-full h-full bg-[#0F172A] rounded-lg overflow-hidden">
      {/* Map Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Heatmap Toggle */}
      <div className="absolute top-4 left-4">
        <button
          onClick={onToggleHeatmap}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            showHeatmap
              ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
              : 'bg-[#1E293B]/80 text-[#94A3B8] border border-[#334155]'
          }`}
        >
          <Layers size={14} />
          Sensory Heatmap: {showHeatmap ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-[#1E293B]/80 text-white rounded-lg border border-[#334155] hover:bg-[#334155] transition-colors"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-[#1E293B]/80 text-white rounded-lg border border-[#334155] hover:bg-[#334155] transition-colors"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[#1E293B]/90 backdrop-blur-sm rounded-lg border border-[#334155] p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
          Sensory Levels
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-xs text-[#CBD5E1]">Low (Calm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <span className="text-xs text-[#CBD5E1]">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <span className="text-xs text-[#CBD5E1]">High (Stress)</span>
          </div>
        </div>
      </div>

      {/* Route Legend */}
      <div className="absolute top-4 right-4 bg-[#1E293B]/90 backdrop-blur-sm rounded-lg border border-[#334155] p-3">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
          Routes
        </div>
        <div className="space-y-1.5">
          {routes.map(route => (
            <div key={route.id} className="flex items-center gap-2">
              <div 
                className="w-4 h-1 rounded" 
                style={{ backgroundColor: route.color }}
              />
              <span className={`text-xs ${route.isSelected ? 'text-white font-medium' : 'text-[#94A3B8]'}`}>
                {route.id}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function RouteMapSkeleton() {
  return (
    <div className="w-full h-full bg-[#0F172A] rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-[#475569]">
        <MapPin size={48} className="opacity-30" />
      </div>
    </div>
  );
}

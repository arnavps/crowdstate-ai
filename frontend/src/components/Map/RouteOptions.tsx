import { Zap, Volume2, Leaf, Check, Clock, Users, AlertTriangle } from 'lucide-react';

export interface RouteOption {
  id: string;
  name: string;
  icon: 'zap' | 'volume' | 'leaf';
  duration: string;
  details: string;
  subDetails: string;
  color: 'gray' | 'red' | 'teal';
  isRecommended: boolean;
  isSelected: boolean;
  score: number;
  metrics: {
    distance: number;
    density: number;
    sensory: number;
    volatility: number;
  };
}

interface RouteOptionsProps {
  routes: RouteOption[];
  onSelectRoute: (routeId: string) => void;
}

const iconMap = {
  zap: Zap,
  volume: Volume2,
  leaf: Leaf,
};

const colorConfig = {
  gray: {
    bg: 'bg-[#F8FAFC]',
    border: 'border-[#E2E8F0]',
    text: 'text-[#64748B]',
    iconBg: 'bg-[#E2E8F0]',
    iconColor: 'text-[#94A3B8]',
  },
  red: {
    bg: 'bg-[#FEF2F2]',
    border: 'border-[#EF4444]/30',
    text: 'text-[#EF4444]',
    iconBg: 'bg-[#FEE2E2]',
    iconColor: 'text-[#EF4444]',
  },
  teal: {
    bg: 'bg-[#F0FDFA]',
    border: 'border-[#0D9488]/30',
    text: 'text-[#0D9488]',
    iconBg: 'bg-[#CCFBF1]',
    iconColor: 'text-[#0D9488]',
  },
};

export default function RouteOptions({ routes, onSelectRoute }: RouteOptionsProps) {
  // Sort by recommendation first, then by score
  const sortedRoutes = [...routes].sort((a, b) => {
    if (a.isRecommended && !b.isRecommended) return -1;
    if (!a.isRecommended && b.isRecommended) return 1;
    return a.score - b.score;
  });

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-4">
        Route Options
      </h3>
      
      {sortedRoutes.map((route) => {
        const Icon = iconMap[route.icon];
        const colors = colorConfig[route.color];
        const isAvoid = route.color === 'red';
        const isNeutral = route.color === 'gray';

        return (
          <button
            key={route.id}
            onClick={() => onSelectRoute(route.id)}
            className={`w-full text-left rounded-lg border-2 p-4 transition-all duration-200 ${
              route.isSelected
                ? `${colors.bg} ${colors.border} shadow-md ring-2 ring-[#0D9488]/20`
                : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm'
            }`}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                  <Icon size={18} className={colors.iconColor} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A] font-helvetica">
                    {route.name}
                  </h4>
                  {route.isRecommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0D9488] mt-0.5">
                      <Check size={10} />
                      Recommended
                    </span>
                  )}
                  {isAvoid && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#EF4444] mt-0.5">
                      <AlertTriangle size={10} />
                      Avoid
                    </span>
                  )}
                </div>
              </div>
              
              {/* Selection indicator */}
              {route.isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#0D9488] flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>

            {/* Details */}
            <div className="pl-11">
              <p className={`text-xs font-medium ${colors.text}`}>
                {route.details}
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-0.5 font-garamond">
                {route.subDetails}
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="pl-11 mt-3 flex items-center gap-4 text-[10px] text-[#64748B]">
              <div className="flex items-center gap-1">
                <Clock size={10} />
                <span>{route.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users size={10} />
                <span>{(route.metrics.density * 100).toFixed(0)}% density</span>
              </div>
            </div>

            {/* Sensory Score Mini-Bar */}
            <div className="pl-11 mt-2">
              <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-[#94A3B8] mb-1">
                <span>Sensory Load</span>
                <span className={route.metrics.sensory > 0.5 ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                  {(route.metrics.sensory * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    route.metrics.sensory > 0.5 ? 'bg-[#EF4444]' : 'bg-[#10B981]'
                  }`}
                  style={{ width: `${route.metrics.sensory * 100}%` }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Skeleton loader
export function RouteOptionsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="w-24 h-3 bg-[#E2E8F0] rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-[#E2E8F0] p-4 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#F1F5F9]" />
            <div className="space-y-1">
              <div className="w-32 h-4 rounded bg-[#F1F5F9]" />
              <div className="w-20 h-3 rounded bg-[#F1F5F9]" />
            </div>
          </div>
          <div className="pl-13 space-y-2">
            <div className="w-full h-3 rounded bg-[#F1F5F9]" />
            <div className="w-2/3 h-3 rounded bg-[#F1F5F9]" />
          </div>
        </div>
      ))}
    </div>
  );
}

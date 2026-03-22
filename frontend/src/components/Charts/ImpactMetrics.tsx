import { RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  icon: 'recycle' | 'chart' | 'trend';
  value: string;
  label: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const iconMap = {
  recycle: RefreshCw,
  chart: BarChart3,
  trend: TrendingUp,
};

function MetricCard({ icon, value, label, description, trend, trendValue }: MetricCardProps) {
  const Icon = iconMap[icon];
  
  const trendColors = {
    up: 'text-[#10B981]',
    down: 'text-[#EF4444]',
    neutral: 'text-[#64748B]',
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
      {/* Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-[#F0FDFA] rounded-lg">
          <Icon size={24} className="text-[#0D9488]" />
        </div>
        {trend && trendValue && (
          <span className={`text-xs font-bold ${trendColors[trend]}`}>
            {trend === 'up' && '↑ '}
            {trend === 'down' && '↓ '}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-3xl font-bold font-mono text-[#0F172A] tracking-tight">
          {value}
        </span>
      </div>

      {/* Label */}
      <h4 className="text-sm font-bold text-[#0F172A] font-helvetica mb-1">
        {label}
      </h4>

      {/* Description */}
      <p className="text-xs text-[#64748B] font-garamond leading-relaxed">
        {description}
      </p>
    </div>
  );
}

interface ImpactMetricsProps {
  recoveredCapacity?: string;
  congestionAvoided?: string;
  systemicUptime?: string;
}

export default function ImpactMetrics({
  recoveredCapacity = '14.2%',
  congestionAvoided = '84k',
  systemicUptime = '99.98%',
}: ImpactMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        icon="recycle"
        value={recoveredCapacity}
        label="Recovered Capacity"
        description="Transit flow throughput gain from optimized routing."
        trend="up"
        trendValue="+2.3% this week"
      />
      
      <MetricCard
        icon="chart"
        value={congestionAvoided}
        label="Congestion Avoided"
        description="Commuters rerouted via AuraPath™ sensory-friendly navigation."
        trend="up"
        trendValue="+12k today"
      />
      
      <MetricCard
        icon="trend"
        value={systemicUptime}
        label="Systemic Uptime"
        description="Across all regional node clusters and monitoring stations."
        trend="neutral"
        trendValue="No outages"
      />
    </div>
  );
}

// Skeleton loader
export function ImpactMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#F1F5F9]" />
          </div>
          <div className="w-20 h-8 rounded bg-[#F1F5F9] mb-2" />
          <div className="w-32 h-4 rounded bg-[#E2E8F0] mb-1" />
          <div className="w-full h-3 rounded bg-[#F1F5F9]" />
        </div>
      ))}
    </div>
  );
}

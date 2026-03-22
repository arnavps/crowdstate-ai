import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';

interface LatencyPoint {
  timestamp: number;
  timeLabel: string;
  yolo: number;
  lstm: number;
  fusion: number;
  threshold: number;
}

interface InferenceLatencyChartProps {
  data?: LatencyPoint[];
  showThreshold?: number;
}

function formatTimeLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function generateMockData(): LatencyPoint[] {
  const now = Date.now();
  const data: LatencyPoint[] = [];

  for (let i = 30; i >= 0; i--) {
    const time = now - i * 10 * 1000; // Every 10 seconds
    const base = 100 + Math.sin(i * 0.3) * 30;
    
    data.push({
      timestamp: time,
      timeLabel: formatTimeLabel(time),
      yolo: Math.max(20, base + (Math.random() - 0.5) * 20),
      lstm: Math.max(80, base * 1.5 + (Math.random() - 0.5) * 40),
      fusion: Math.max(5, 15 + (Math.random() - 0.5) * 10),
      threshold: 200,
    });
  }

  return data;
}

export default function InferenceLatencyChart({
  data: propData,
  showThreshold = 200,
}: InferenceLatencyChartProps) {
  const data = useMemo(() => propData ?? generateMockData(), [propData]);

  // Calculate stats
  const stats = useMemo(() => {
    const yoloAvg = data.reduce((sum, d) => sum + d.yolo, 0) / data.length;
    const lstmAvg = data.reduce((sum, d) => sum + d.lstm, 0) / data.length;
    const fusionAvg = data.reduce((sum, d) => sum + d.fusion, 0) / data.length;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2] || latest;
    
    const totalLatency = latest.yolo + latest.lstm + latest.fusion;
    const prevTotal = previous.yolo + previous.lstm + previous.fusion;
    const trend = totalLatency > prevTotal ? 'up' : totalLatency < prevTotal ? 'down' : 'neutral';
    
    return {
      yoloAvg: Math.round(yoloAvg),
      lstmAvg: Math.round(lstmAvg),
      fusionAvg: Math.round(fusionAvg),
      totalLatency: Math.round(totalLatency),
      trend,
    };
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E293B] p-3 rounded-lg shadow-lg border border-[#334155]">
          <p className="text-xs text-[#64748B] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-mono" style={{ color: entry.color }}>
              {entry.name}: {entry.value}ms
            </p>
          ))}
          <p className="text-[10px] text-[#475569] mt-1 pt-1 border-t border-[#334155]">
            Total: {payload.reduce((sum: number, p: any) => sum + p.value, 0)}ms
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-[#0D9488]" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#64748B]">
              Inference Latency
            </h3>
          </div>
          <p className="text-xs text-[#475569]">
            Real-time processing performance (last 5 min)
          </p>
        </div>

        {/* Current Stats */}
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-2xl font-bold font-mono text-[#F1F5F9]">
              {stats.totalLatency}ms
            </span>
            {stats.trend === 'up' ? (
              <TrendingUp size={16} className="text-[#EF4444]" />
            ) : stats.trend === 'down' ? (
              <TrendingDown size={16} className="text-[#10B981]" />
            ) : null}
          </div>
          <p className="text-[10px] text-[#64748B] uppercase tracking-wider">
            Current Total
          </p>
        </div>
      </div>

      {/* Average Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="text-center p-2 bg-[#1E293B]/50 rounded">
          <p className="text-sm font-bold font-mono text-[#3B82F6]">
            {stats.yoloAvg}ms
          </p>
          <p className="text-[10px] text-[#64748B] uppercase">YOLOv8 Avg</p>
        </div>
        <div className="text-center p-2 bg-[#1E293B]/50 rounded border-x border-[#334155]">
          <p className="text-sm font-bold font-mono text-[#F59E0B]">
            {stats.lstmAvg}ms
          </p>
          <p className="text-[10px] text-[#64748B] uppercase">LSTM Avg</p>
        </div>
        <div className="text-center p-2 bg-[#1E293B]/50 rounded">
          <p className="text-sm font-bold font-mono text-[#10B981]">
            {stats.fusionAvg}ms
          </p>
          <p className="text-[10px] text-[#64748B] uppercase">Fusion Avg</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#475569" 
              fontSize={10}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickMargin={5}
              minTickGap={20}
            />
            <YAxis 
              stroke="#475569"
              fontSize={10}
              tick={{ fill: '#475569', fontSize: 10 }}
              tickFormatter={(value) => `${value}ms`}
              label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold line */}
            <ReferenceLine 
              y={showThreshold} 
              stroke="#EF4444" 
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{ value: 'THRESHOLD', position: 'right', fill: '#EF4444', fontSize: 9 }}
            />

            {/* YOLO Area */}
            <Area
              type="monotone"
              dataKey="yolo"
              name="YOLOv8"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.2}
              strokeWidth={2}
              stackId="1"
            />

            {/* LSTM Area */}
            <Area
              type="monotone"
              dataKey="lstm"
              name="LSTM"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.2}
              strokeWidth={2}
              stackId="1"
            />

            {/* Fusion Area */}
            <Area
              type="monotone"
              dataKey="fusion"
              name="Fusion"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
              strokeWidth={2}
              stackId="1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#3B82F6]/20 border border-[#3B82F6]" />
          <span className="text-[10px] text-[#64748B] uppercase">YOLOv8 Edge</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#F59E0B]/20 border border-[#F59E0B]" />
          <span className="text-[10px] text-[#64748B] uppercase">LSTM Temporal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#10B981]/20 border border-[#10B981]" />
          <span className="text-[10px] text-[#64748B] uppercase">State Fusion</span>
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
export function InferenceLatencyChartSkeleton() {
  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-5 animate-pulse">
      <div className="flex items-start justify-between mb-5">
        <div className="w-32 h-3 bg-[#1E293B] rounded" />
        <div className="w-20 h-6 bg-[#1E293B] rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[#1E293B]/50 rounded" />
        ))}
      </div>
      <div className="h-[200px] bg-[#1E293B]/30 rounded" />
    </div>
  );
}

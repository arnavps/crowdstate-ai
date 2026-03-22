import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';

interface DataPoint {
  timestamp: number;
  timeLabel: string;
  actual: number | null;
  predicted: number | null;
  confidenceUpper: number | null;
  confidenceLower: number | null;
  isPrediction: boolean;
}

interface VolatilityTimelineProps {
  historicalData: Array<{ timestamp: number; delta: number }>;
  predictedData: Array<{ timestamp: number; delta: number; confidence: number }>;
  predictionAccuracy?: number;
}

function formatTimeLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function generateMockData(): {
  historicalData: Array<{ timestamp: number; delta: number }>;
  predictedData: Array<{ timestamp: number; delta: number; confidence: number }>;
} {
  const now = Date.now();
  const historicalData: Array<{ timestamp: number; delta: number }> = [];
  const predictedData: Array<{ timestamp: number; delta: number; confidence: number }> = [];

  // Generate 60 minutes of historical data (every 2 minutes)
  for (let i = 30; i >= 0; i--) {
    const time = now - i * 2 * 60 * 1000;
    const baseValue = 0.3 + Math.sin(i * 0.2) * 0.15;
    const noise = (Math.random() - 0.5) * 0.1;
    historicalData.push({
      timestamp: time,
      delta: Math.max(0, Math.min(1, baseValue + noise)),
    });
  }

  // Generate 40 minutes of predicted data (every 2 minutes)
  let lastHistoricalValue = historicalData[historicalData.length - 1].delta;
  for (let i = 1; i <= 20; i++) {
    const time = now + i * 2 * 60 * 1000;
    const trend = Math.sin(i * 0.15) * 0.1;
    const predictedValue = Math.max(0, Math.min(1, lastHistoricalValue + trend + (Math.random() - 0.5) * 0.05));
    const confidence = Math.max(0.5, 1 - i * 0.02); // Confidence decreases with time
    
    predictedData.push({
      timestamp: time,
      delta: predictedValue,
      confidence,
    });
    
    lastHistoricalValue = predictedValue;
  }

  return { historicalData, predictedData };
}

export default function VolatilityTimeline({
  historicalData: propHistorical,
  predictedData: propPredicted,
  predictionAccuracy = 98.4,
}: VolatilityTimelineProps) {
  // Use mock data if no props provided
  const mockData = useMemo(() => generateMockData(), []);
  const historicalData = propHistorical?.length ? propHistorical : mockData.historicalData;
  const predictedData = propPredicted?.length ? propPredicted : mockData.predictedData;

  // Combine data for the chart
  const chartData: DataPoint[] = useMemo(() => {
    const now = Date.now();
    const combined: DataPoint[] = [];

    // Historical points
    historicalData.forEach(point => {
      combined.push({
        timestamp: point.timestamp,
        timeLabel: formatTimeLabel(point.timestamp),
        actual: point.delta,
        predicted: null,
        confidenceUpper: null,
        confidenceLower: null,
        isPrediction: point.timestamp > now,
      });
    });

    // Current point (connects historical and predicted)
    const lastHistorical = historicalData[historicalData.length - 1];
    combined.push({
      timestamp: lastHistorical.timestamp,
      timeLabel: formatTimeLabel(lastHistorical.timestamp),
      actual: lastHistorical.delta,
      predicted: lastHistorical.delta,
      confidenceUpper: lastHistorical.delta,
      confidenceLower: lastHistorical.delta,
      isPrediction: false,
    });

    // Predicted points
    predictedData.forEach(point => {
      const confidenceRange = (1 - point.confidence) * 0.2;
      combined.push({
        timestamp: point.timestamp,
        timeLabel: formatTimeLabel(point.timestamp),
        actual: null,
        predicted: point.delta,
        confidenceUpper: Math.min(1, point.delta + confidenceRange),
        confidenceLower: Math.max(0, point.delta - confidenceRange),
        isPrediction: true,
      });
    });

    return combined;
  }, [historicalData, predictedData]);

  const now = Date.now();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-[#E2E8F0]">
          <p className="text-xs font-bold text-[#64748B] mb-2">{label}</p>
          {data.actual !== null && (
            <p className="text-sm font-mono">
              <span className="text-[#94A3B8]">Actual: </span>
              <span className="font-bold text-[#0F172A]">{data.actual.toFixed(3)}</span>
            </p>
          )}
          {data.predicted !== null && data.isPrediction && (
            <p className="text-sm font-mono">
              <span className="text-[#F59E0B]">Predicted: </span>
              <span className="font-bold text-[#0F172A]">{data.predicted.toFixed(3)}</span>
            </p>
          )}
          {data.confidenceUpper !== null && data.confidenceLower !== null && data.isPrediction && (
            <p className="text-xs text-[#94A3B8] mt-1">
              Confidence: ±{((data.confidenceUpper - data.confidenceLower) / 2 * 100).toFixed(1)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B] mb-1">
            Volatility Timeline
          </h3>
          <p className="text-sm text-[#94A3B8] font-garamond">
            Historical actual vs. LSTM predicted (40m forecast)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-[#94A3B8]" />
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Historical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-[#F59E0B]" />
              <span className="text-[10px] text-[#64748B] uppercase tracking-wider">Predicted</span>
            </div>
          </div>
          
          {/* Accuracy Badge */}
          <div className="px-3 py-1.5 bg-[#F0FDF4] rounded-full">
            <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">
              Accuracy: {predictionAccuracy.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis 
              dataKey="timeLabel" 
              stroke="#94A3B8" 
              fontSize={10}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              domain={[0, 1]} 
              stroke="#94A3B8"
              fontSize={10}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickFormatter={(value) => value.toFixed(1)}
              label={{ value: 'Δ (Volatility)', angle: -90, position: 'insideLeft', style: { fill: '#94A3B8', fontSize: 10 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Confidence band for predictions */}
            <ReferenceArea
              x1={formatTimeLabel(chartData.find(d => d.isPrediction)?.timestamp || now)}
              x2={formatTimeLabel(chartData[chartData.length - 1].timestamp)}
              fill="#F59E0B"
              fillOpacity={0.05}
            />
            
            {/* Now line */}
            <ReferenceLine 
              x={formatTimeLabel(now)} 
              stroke="#0D9488" 
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{ value: 'NOW', position: 'top', fill: '#0D9488', fontSize: 10, fontWeight: 'bold' }}
            />

            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#94A3B8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#94A3B8' }}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={1000}
            />

            {/* Predicted line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#F59E0B"
              strokeWidth={2}
              strokeDasharray="0"
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                if (payload.isPrediction) {
                  return <circle cx={cx} cy={cy} r={3} fill="#F59E0B" />;
                }
                return <circle cx={cx} cy={cy} r={0} />;
              }}
              activeDot={{ r: 5, fill: '#F59E0B' }}
              connectNulls={true}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time range indicator */}
      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
          -60m
        </span>
        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
          Past Hour
        </span>
        <span className="text-[10px] text-[#0D9488] font-bold uppercase tracking-wider">
          NOW
        </span>
        <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
          +40m Forecast
        </span>
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
          +40m
        </span>
      </div>
    </div>
  );
}

// Skeleton loader
export function VolatilityTimelineSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="w-32 h-3 bg-[#E2E8F0] rounded" />
          <div className="w-48 h-3 bg-[#F1F5F9] rounded" />
        </div>
        <div className="w-24 h-6 bg-[#F0FDF4] rounded-full" />
      </div>
      <div className="h-[300px] bg-[#F8FAFC] rounded-lg animate-pulse" />
    </div>
  );
}

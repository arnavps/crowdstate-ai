import { useState, useEffect } from 'react';
import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface RadarChartProps {
  rho: number;
  sigma: number;
  delta: number;
  predicted_rho?: number;
  predicted_sigma?: number;
  predicted_delta?: number;
  size?: number;
}

interface ChartDataPoint {
  metric: string;
  full: string;
  current: number;
  predicted: number;
}

function getSeverityColor(rho: number, sigma: number, delta: number): string {
  // Red: Any > 0.7
  if (rho > 0.7 || sigma > 0.7 || delta > 0.7) {
    return '#EF4444';
  }
  // Yellow: Any 0.4-0.7
  if (rho >= 0.4 || sigma >= 0.4 || delta >= 0.4) {
    return '#F59E0B';
  }
  // Green: All < 0.4
  return '#10B981';
}

function getSeverityBg(rho: number, sigma: number, delta: number): string {
  if (rho > 0.7 || sigma > 0.7 || delta > 0.7) {
    return 'rgba(239, 68, 68, 0.15)';
  }
  if (rho >= 0.4 || sigma >= 0.4 || delta >= 0.4) {
    return 'rgba(245, 158, 11, 0.15)';
  }
  return 'rgba(16, 185, 129, 0.15)';
}

export default function RadarChart({
  rho,
  sigma,
  delta,
  predicted_rho = rho,
  predicted_sigma = sigma,
  predicted_delta = delta,
  size = 400,
}: RadarChartProps) {
  const [showPrediction, setShowPrediction] = useState(false);
  const [animatedData, setAnimatedData] = useState<ChartDataPoint[]>([
    { metric: 'ρ', full: 'Density', current: 0, predicted: 0 },
    { metric: 'Σ', full: 'Sensory', current: 0, predicted: 0 },
    { metric: 'Δ', full: 'Volatility', current: 0, predicted: 0 },
  ]);

  // Animate values on change
  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = animatedData.map(d => d.current);
    const targetValues = [rho, sigma, delta];
    const targetPredicted = [predicted_rho, predicted_sigma, predicted_delta];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedData([
        {
          metric: 'ρ',
          full: 'Density',
          current: startValues[0] + (targetValues[0] - startValues[0]) * easeOut,
          predicted: targetPredicted[0],
        },
        {
          metric: 'Σ',
          full: 'Sensory',
          current: startValues[1] + (targetValues[1] - startValues[1]) * easeOut,
          predicted: targetPredicted[1],
        },
        {
          metric: 'Δ',
          full: 'Volatility',
          current: startValues[2] + (targetValues[2] - startValues[2]) * easeOut,
          predicted: targetPredicted[2],
        },
      ]);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [rho, sigma, delta, predicted_rho, predicted_sigma, predicted_delta]);

  const strokeColor = getSeverityColor(rho, sigma, delta);
  const fillColor = getSeverityBg(rho, sigma, delta);

  return (
    <div className="flex flex-col items-center">
      {/* Radar Chart Container */}
      <div 
        className="relative bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4"
        style={{ width: size, height: size }}
      >
        {/* Header */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Tri-Axial State
          </span>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={animatedData}>
            <PolarGrid 
              stroke="#E2E8F0" 
              strokeWidth={1}
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ 
                fill: '#64748B', 
                fontSize: 14, 
                fontWeight: 700,
                fontFamily: '"JetBrains Mono", monospace'
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 1]} 
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              tickCount={6}
              stroke="#E2E8F0"
            />
            
            {/* Current State (Filled) */}
            <Radar
              name="Current"
              dataKey="current"
              stroke={strokeColor}
              strokeWidth={3}
              fill={fillColor}
              fillOpacity={0.6}
              isAnimationActive={false}
            />
            
            {/* Predicted State (Outline only) */}
            {showPrediction && (
              <Radar
                name="Predicted"
                dataKey="predicted"
                stroke={strokeColor}
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="transparent"
                isAnimationActive={false}
              />
            )}
          </RechartsRadar>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-[10px]">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-1.5 rounded"
              style={{ backgroundColor: strokeColor }}
            />
            <span className="text-[#64748B] uppercase tracking-wider">Actual</span>
          </div>
          {showPrediction && (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-1.5 rounded border-2"
                style={{ 
                  borderColor: strokeColor,
                  borderStyle: 'dashed'
                }}
              />
              <span className="text-[#64748B] uppercase tracking-wider">Predicted</span>
            </div>
          )}
        </div>

        {/* Metric Labels around the chart */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Density (top) */}
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Density
            </span>
          </div>
          {/* Sensory (bottom left) */}
          <div className="absolute bottom-[15%] left-[15%] text-center">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Sensory
            </span>
          </div>
          {/* Volatility (bottom right) */}
          <div className="absolute bottom-[15%] right-[15%] text-center">
            <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
              Volatility
            </span>
          </div>
        </div>
      </div>

      {/* Time Slider */}
      <div className="mt-6 flex items-center gap-4 w-full max-w-[360px]">
        <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
          Real-Time
        </span>
        
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="1"
            step="1"
            value={showPrediction ? 1 : 0}
            onChange={(e) => setShowPrediction(e.target.value === '1')}
            className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#0D9488]"
          />
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[#94A3B8]">NOW</span>
            <span className="text-[9px] text-[#94A3B8]">+10M</span>
          </div>
        </div>
        
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          +10M Prediction
        </span>
      </div>
    </div>
  );
}

// Skeleton loader
export function RadarChartSkeleton({ size = 400 }: { size?: number }) {
  return (
    <div 
      className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 animate-pulse"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full rounded-full bg-[#F1F5F9] border-4 border-[#E2E8F0]" 
        style={{ 
          background: 'radial-gradient(circle, #F1F5F9 0%, #E2E8F0 100%)'
        }}
      />
    </div>
  );
}

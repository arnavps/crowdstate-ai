import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Clock } from 'lucide-react';

interface SafetyWindowProps {
  initialSeconds?: number;
  volatility?: number;
}

export default function SafetyWindow({ 
  initialSeconds = 180,
  volatility = 0.3 
}: SafetyWindowProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    // Adjust window based on volatility
    const adjustedWindow = Math.max(60, Math.min(300, initialSeconds - volatility * 100));
    setSeconds(Math.floor(adjustedWindow));
  }, [initialSeconds, volatility]);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setSeconds(prev => {
        const newValue = Math.max(0, prev - 1);
        setIsWarning(newValue < 60);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progress = (seconds / 300) * 100; // Max 300 seconds
  const circumference = 2 * Math.PI * 80; // radius 80
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine confidence based on time remaining
  const getConfidence = () => {
    if (seconds > 240) return { label: 'CRITICAL RANGE', color: '#10B981' };
    if (seconds > 120) return { label: 'HIGH RANGE', color: '#F59E0B' };
    return { label: 'LOW RANGE', color: '#EF4444' };
  };

  const confidence = getConfidence();

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Shield size={14} className="text-[#F59E0B]" />
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#64748B]">
          180S Safety Window
        </h3>
      </div>

      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Background circle */}
          <svg width="180" height="180" className="-rotate-90">
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke={confidence.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isWarning ? (
              <AlertTriangle size={24} className="text-[#EF4444] mb-1 animate-pulse" />
            ) : (
              <Clock size={24} className="text-[#F59E0B] mb-1" />
            )}
            <span className="text-4xl font-bold font-mono text-[#0F172A] tracking-tight">
              {seconds}
            </span>
            <span className="text-xs text-[#64748B] uppercase tracking-wider">
              SECONDS
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[#64748B] text-center font-garamond mb-4">
        Current lead time for automated evacuation protocols
      </p>

      {/* Confidence bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#64748B] uppercase tracking-wider">Confidence</span>
          <span className="font-bold" style={{ color: confidence.color }}>
            {confidence.label}
          </span>
        </div>
        <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${(seconds / 300) * 100}%`,
              backgroundColor: confidence.color
            }}
          />
        </div>
      </div>

      {/* Status indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div 
          className={`w-2 h-2 rounded-full ${isWarning ? 'bg-[#EF4444] animate-pulse' : 'bg-[#10B981]'}`} 
        />
        <span className={`text-xs font-bold uppercase tracking-wider ${isWarning ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
          {isWarning ? 'EVACUATE IMMINENT' : 'PROTOCOLS STANDBY'}
        </span>
      </div>
    </div>
  );
}

// Skeleton loader
export function SafetyWindowSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm animate-pulse">
      <div className="w-32 h-3 bg-[#E2E8F0] rounded mb-6" />
      <div className="flex items-center justify-center mb-6">
        <div className="w-[180px] h-[180px] rounded-full bg-[#F1F5F9]" />
      </div>
      <div className="w-full h-2 bg-[#E2E8F0] rounded-full" />
    </div>
  );
}

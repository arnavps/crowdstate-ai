import { useState } from "react";
import {
  Wifi,
  Shield,
  Moon,
  Sun,
  User,
  ChevronDown,
  MapPin,
} from "lucide-react";

interface TopBarProps {
  locationName?: string;
  wsStatus?: "connected" | "disconnected" | "error";
}

export default function TopBar({
  locationName = "Central Station",
  wsStatus = "connected",
}: TopBarProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would toggle the theme class on the document
  };

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case "connected":
        return "bg-[#10B981]";
      case "error":
        return "bg-[#EF4444]";
      default:
        return "bg-[#F59E0B]";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 fixed top-0 right-0 left-[220px] z-40">
      {/* Left Section - Status & Location */}
      <div className="flex items-center gap-6">
        {/* Network Status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getWsStatusColor()}`}></div>
          <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider font-helvetica">
            Operational
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#E2E8F0]"></div>

        {/* Location Info */}
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-[#64748B]" />
          <span className="text-sm text-[#0F172A] font-garamond">
            {locationName}
          </span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        {/* Secure Feed Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0FDF4] rounded-full border border-[#10B981]/20">
          <Shield size={14} className="text-[#10B981]" />
          <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider font-helvetica">
            Secure Feed
          </span>
        </div>

        {/* WebSocket Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            wsStatus === "connected"
              ? "bg-[#F0FDF4] border-[#10B981]/20"
              : wsStatus === "error"
              ? "bg-[#FEF2F2] border-[#EF4444]/20"
              : "bg-[#FFFBEB] border-[#F59E0B]/20"
          }`}
        >
          <Wifi
            size={14}
            className={
              wsStatus === "connected"
                ? "text-[#10B981]"
                : wsStatus === "error"
                ? "text-[#EF4444]"
                : "text-[#F59E0B]"
            }
          />
          <span
            className={`text-xs font-bold uppercase tracking-wider font-helvetica ${
              wsStatus === "connected"
                ? "text-[#10B981]"
                : wsStatus === "error"
                ? "text-[#EF4444]"
                : "text-[#F59E0B]"
            }`}
          >
            {wsStatus === "connected" ? "Live" : wsStatus === "error" ? "Error" : "Offline"}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#E2E8F0]"></div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun size={20} className="text-[#F59E0B]" />
          ) : (
            <Moon size={20} className="text-[#64748B]" />
          )
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <ChevronDown size={16} className="text-[#64748B]" />
        </button>
      </div>
    </header>
  );
}

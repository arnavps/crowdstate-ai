import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface DashboardLayoutProps {
  wsStatus?: "connected" | "disconnected" | "error";
  isLoading?: boolean;
}

export default function DashboardLayout({
  wsStatus: initialWsStatus = "disconnected",
  isLoading = false,
}: DashboardLayoutProps) {
  const [wsStatus, setWsStatus] = useState(initialWsStatus);
  const [locationName, setLocationName] = useState("Central Station");

  useEffect(() => {
    // WebSocket connection setup
    const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws";
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setWsStatus("connected");
      console.log("WebSocket connected");
    };

    ws.onclose = () => {
      setWsStatus("disconnected");
      console.log("WebSocket disconnected");
    };

    ws.onerror = () => {
      setWsStatus("error");
      console.error("WebSocket error");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Top Bar */}
      <TopBar locationName={locationName} wsStatus={wsStatus} />

      {/* Main Content Area */}
      <main className="ml-[220px] mt-16 p-8 min-h-[calc(100vh-64px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-[#0D9488] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-[#64748B] font-garamond">
                Loading dashboard data...
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Outlet />
          </div>
        )}
      </main>

      {/* WebSocket Status Toast */}
      {wsStatus !== "connected" && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
            wsStatus === "error"
              ? "bg-[#FEF2F2] border border-[#EF4444]/20"
              : "bg-[#FFFBEB] border border-[#F59E0B]/20"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                wsStatus === "error" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
              }`}
            ></div>
            <span
              className={`text-sm font-bold font-helvetica ${
                wsStatus === "error" ? "text-[#EF4444]" : "text-[#F59E0B]"
              }`}
            >
              {wsStatus === "error"
                ? "Connection Error"
                : "Reconnecting..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

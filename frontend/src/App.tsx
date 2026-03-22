import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Overview from "./pages/Overview";
import AuraPathMap from "./pages/AuraPathMap";
import Analytics from "./pages/Analytics";

// View components
function SystemHealth() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-helvetica font-bold text-[#0F172A]">
        System Health
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <HealthCard service="API" status="operational" latency="24ms" />
        <HealthCard service="WebSocket" status="operational" latency="12ms" />
        <HealthCard service="AI Models" status="operational" latency="156ms" />
      </div>
    </div>
  );
}

function HealthCard({
  service,
  status,
  latency,
}: {
  service: string;
  status: "operational" | "degraded" | "down";
  latency: string;
}) {
  const statusColors = {
    operational: "bg-[#10B981]",
    degraded: "bg-[#F59E0B]",
    down: "bg-[#EF4444]",
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-helvetica font-bold text-[#0F172A]">{service}</h3>
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`}></div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B] font-garamond">Status</span>
          <span className="font-bold text-[#0F172A] font-helvetica uppercase">
            {status}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#64748B] font-garamond">Latency</span>
          <span className="font-bold text-[#0F172A] font-helvetica">
            {latency}
          </span>
        </div>
      </div>
    </div>
  );
}

function Privacy() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-helvetica font-bold text-[#0F172A]">
        Privacy
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-8">
        <h2 className="text-xl font-helvetica font-bold text-[#0F172A] mb-4">
          Data Protection
        </h2>
        <p className="text-[#64748B] font-garamond leading-relaxed">
          CrowdState AI is committed to protecting personal privacy. All video
          and audio data is processed locally and in real-time. No personally
          identifiable information is stored. Aggregate metrics are anonymized
          and retained for up to 7 days for operational purposes.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="aurapath" element={<AuraPathMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="health" element={<SystemHealth />} />
          <Route path="privacy" element={<Privacy />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

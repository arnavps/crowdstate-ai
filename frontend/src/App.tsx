import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import axios from "axios";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type HealthResponse = {
  status: string;
  service: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws";

function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [wsStatus, setWsStatus] = useState("disconnected");

  useEffect(() => {
    axios
      .get<HealthResponse>(`${API_BASE_URL}/health`)
      .then((res) => setHealth(res.data))
      .catch(() => setHealth({ status: "unavailable", service: "backend" }));
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => setWsStatus("connected");
    ws.onclose = () => setWsStatus("disconnected");
    ws.onerror = () => setWsStatus("error");
    return () => ws.close();
  }, []);

  const mockSeries = useMemo(
    () => [
      { minute: "09:00", sentiment: 42 },
      { minute: "09:05", sentiment: 55 },
      { minute: "09:10", sentiment: 61 },
      { minute: "09:15", sentiment: 58 },
      { minute: "09:20", sentiment: 69 }
    ],
    []
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">CrowdState AI Mission Control</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-2 text-lg font-medium">API Health</h2>
          <p className="text-sm text-slate-300">
            {health ? `${health.service}: ${health.status}` : "Checking backend..."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-2 text-lg font-medium">Realtime Channel</h2>
          <p className="text-sm text-slate-300">WebSocket status: {wsStatus}</p>
        </div>
      </div>

      <div className="h-72 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-4 text-lg font-medium">Live Sentiment Trend</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockSeries}>
            <XAxis dataKey="minute" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line type="monotone" dataKey="sentiment" stroke="#22d3ee" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold">About CrowdState AI</h1>
      <p className="text-slate-300">
        This starter project provides a scalable baseline for real-time market intelligence.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <nav className="mb-8 flex gap-4 text-sm">
        <Link className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700" to="/">
          Dashboard
        </Link>
        <Link className="rounded bg-slate-800 px-3 py-2 hover:bg-slate-700" to="/about">
          About
        </Link>
      </nav>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </div>
  );
}

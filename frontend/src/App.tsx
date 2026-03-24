import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/Layout/DashboardLayout";
import Overview from "./pages/Overview";
import AuraPathMap from "./pages/AuraPathMap";
import Analytics from "./pages/Analytics";
import SystemHealth from "./pages/SystemHealth";
import Privacy from "./pages/Privacy";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="aurapath" element={<AuraPathMap />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="health" element={<SystemHealth />} />
        <Route path="privacy" element={<Privacy />} />
      </Route>
    </Routes>
  );
}

import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Map,
  BarChart3,
  Activity,
  Shield,
  Settings,
  User,
} from "lucide-react";

const navItems = [
  { name: "Overview", path: "/", icon: LayoutGrid },
  { name: "AuraPath Map", path: "/aurapath", icon: Map },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "System Health", path: "/health", icon: Activity },
  { name: "Privacy", path: "/privacy", icon: Shield },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] h-screen bg-[#F1F5F9] border-r border-[#E2E8F0] flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="p-6">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <span className="font-helvetica font-bold text-[#0F172A] text-lg tracking-tight">
            CrowdState<span className="text-[#0D9488]">AI</span>
          </span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#0D9488] shadow-sm border border-[#E2E8F0]"
                  : "text-[#64748B] hover:bg-white hover:text-[#0F172A]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={isActive ? "text-[#0D9488]" : "text-[#94A3B8]"}
                />
                <span className="font-helvetica">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isActive
                ? "bg-white text-[#0D9488] shadow-sm"
                : "text-[#64748B] hover:bg-white hover:text-[#0F172A]"
            }`
          }
        >
          <Settings size={18} className="text-[#94A3B8]" />
          <span className="font-helvetica">Settings</span>
        </NavLink>

        {/* System Live Indicator */}
        <div className="mt-4 flex items-center gap-3 px-4">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </div>
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-[0.2em] font-helvetica">
            System Live
          </span>
        </div>

        {/* User Avatar */}
        <div className="mt-4 flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0F172A] font-helvetica">
              Admin
            </span>
            <span className="text-[10px] text-[#64748B] font-garamond">
              admin@crowdstate.ai
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

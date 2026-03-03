"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Map as MapIcon,
    BarChart3,
    Settings,
    ShieldCheck,
    Activity
} from "lucide-react";

const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AuraPath Map", href: "/dashboard/map", icon: MapIcon },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "System Health", href: "/dashboard/health", icon: Activity },
    { name: "Privacy", href: "/dashboard/privacy", icon: ShieldCheck },
];

import Image from "next/image";

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col fixed left-0 top-0 z-50 transition-colors duration-500">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2 mb-8 group">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm transition-transform group-hover:scale-110">
                        <Image
                            src="/logo.jpg"
                            alt="CrowdState AI Logo"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-xl tracking-tight transition-colors text-[#1E293B] group-hover:text-brand-teal">CrowdState<span className="text-brand-teal">AI</span></span>
                </Link>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider transition-all ${isActive
                                    ? "bg-white text-brand-teal shadow-sm border border-[#E2E8F0]"
                                    : "text-[#64748B] hover:bg-white hover:text-[#1E293B]"
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? "text-brand-teal" : "text-[#94A3B8]"} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-[#E2E8F0]">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider text-[#64748B] hover:bg-white hover:text-[#1E293B] transition-all"
                >
                    <Settings size={18} className="text-[#94A3B8]" />
                    Settings
                </Link>
                <div className="mt-4 flex items-center gap-3 px-4">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                    <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">System Live</span>
                </div>
            </div>
        </aside>
    );
}

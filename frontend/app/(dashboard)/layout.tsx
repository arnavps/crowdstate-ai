"use client";

import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] transition-colors duration-500">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <header className="h-20 border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 bg-white/80 backdrop-blur-md z-40">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[0.2em]">Network Status</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-green-600 uppercase">Operational</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                            <ShieldCheck size={16} className="text-brand-teal" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E293B]">Secure Feed</span>
                        </div>
                        <ThemeToggle />
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#E2E8F0] shadow-sm ring-2 ring-brand-teal/5 hover:ring-brand-teal/20 transition-all cursor-pointer">
                            <Image
                                src="/logo.jpg"
                                alt="User Profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </header>
                <main className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}

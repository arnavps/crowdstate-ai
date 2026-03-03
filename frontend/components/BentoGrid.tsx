import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BentoCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    description?: string;
}

export function BentoCard({ title, children, className, description }: BentoCardProps) {
    return (
        <div
            className={cn(
                "bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-all group",
                className
            )}
        >
            <div className="flex flex-col gap-2">
                <h3 className="font-sans text-xl font-bold tracking-tight text-[#1E293B] group-hover:text-brand-teal transition-colors">
                    {title}
                </h3>
                {description && (
                    <p className="text-[13px] text-[#64748B] font-medium leading-relaxed">{description}</p>
                )}
            </div>
            <div className="flex-1 overflow-hidden">{children}</div>
        </div>
    );
}

export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]",
                className
            )}
        >
            {children}
        </div>
    );
}

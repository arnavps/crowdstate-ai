"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    }, [theme]);

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}

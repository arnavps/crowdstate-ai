/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary palette
        "brand-teal": "#0D9488",
        "brand-teal-light": "#14B8A6",
        "brand-teal-dark": "#0F766E",
        // Semantic colors
        "safe-green": "#10B981",
        "caution-yellow": "#F59E0B",
        "danger-red": "#EF4444",
        // Neutral palette
        "neutral-50": "#F8FAFC",
        "neutral-100": "#F1F5F9",
        "neutral-200": "#E2E8F0",
        "neutral-300": "#CBD5E1",
        "neutral-400": "#94A3B8",
        "neutral-500": "#64748B",
        "neutral-600": "#475569",
        "neutral-700": "#334155",
        "neutral-800": "#1E293B",
        "neutral-900": "#0F172A",
      },
      fontFamily: {
        helvetica: ['Helvetica', 'Arial', 'sans-serif'],
        garamond: ['"Apple Garamond"', 'Garamond', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'metric-xl': ['72px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'metric-lg': ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'label': ['12px', { lineHeight: '1.5', letterSpacing: '0.05em' }],
      },
      spacing: {
        'sidebar': '220px',
        'topbar': '64px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};

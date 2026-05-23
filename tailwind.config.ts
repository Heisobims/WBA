import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand orange palette
        brand: {
          50:  "#FFF4EB",
          100: "#FFE4CC",
          200: "#FFC999",
          300: "#FFA866",
          400: "#FF8833",
          500: "#F97316",
          600: "#EA5504",
          700: "#C23F00",
          800: "#9A3202",
          900: "#7A2802",
          950: "#3D1200",
        },
        // Sidebar surface
        ink: {
          950: "#0A0908",
          900: "#111110",
          800: "#1C1917",
          700: "#292524",
          600: "#44403C",
          500: "#57534E",
          400: "#78716C",
          300: "#A8A29E",
          200: "#D6D3D1",
          100: "#F5F5F4",
          50:  "#FAFAF9",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "glow-sm": "0 0 10px rgba(234,85,4,.2)",
        glow:      "0 0 20px rgba(234,85,4,.3)",
        "glow-lg": "0 0 40px rgba(234,85,4,.35)",
        card:      "0 1px 3px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.04)",
        "card-md": "0 2px 6px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.06)",
        "card-lg": "0 4px 12px rgba(0,0,0,.08), 0 16px 48px rgba(0,0,0,.08)",
        "orange":  "0 4px 14px rgba(234,85,4,.35)",
        "orange-lg":"0 8px 30px rgba(234,85,4,.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(234,85,4,0.5)" },
          "70%":  { transform: "scale(1)",    boxShadow: "0 0 0 10px rgba(234,85,4,0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(234,85,4,0)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in":   "fade-in 0.25s ease-out",
        "slide-in":  "slide-in 0.3s ease-out",
        shimmer:     "shimmer 1.8s infinite linear",
        float:       "float 3s ease-in-out infinite",
        "pulse-ring":"pulse-ring 2s cubic-bezier(0.455,0.03,0.515,0.955) infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "orange-gradient": "linear-gradient(135deg, #EA5504 0%, #F97316 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

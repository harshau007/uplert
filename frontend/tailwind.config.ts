import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

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
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#09090B", // Black for borders
        input: "#1A1A1D", // Dark gray for input backgrounds
        ring: "hsl(0, 0%, 90%)", // Light gray for focus rings
        background: "#09090B", // Deep black for background
        foreground: "#FFFFFF", // White for text on black backgrounds
        primary: {
          DEFAULT: "#FFFFFF", // White as primary color
          foreground: "#09090B", // Black text on white primary buttons
        },
        secondary: {
          DEFAULT: "#1A1A1D", // Dark gray as secondary
          foreground: "#FFFFFF", // White text for contrast
        },
        destructive: {
          DEFAULT: "#E63946", // Red for destructive actions
          foreground: "#FFFFFF", // White text on destructive buttons
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#FFFFFF", // White accent for emphasis
          foreground: "#09090B", // Black text on white accents
        },
        popover: {
          DEFAULT: "#FFFFFF", // White popovers
          foreground: "#09090B", // Black text inside popovers
        },
        card: {
          DEFAULT: "#1A1A1D", // Dark gray card background
          foreground: "#FFFFFF", // White text for cards
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
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
        heartbeat: {
          "0%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.3)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.3)" },
          "70%": { transform: "scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        fadeIn: "fadeIn 0.5s ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

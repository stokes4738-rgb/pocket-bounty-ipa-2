import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Pocket Bounty custom colors
        'pocket-red': {
          DEFAULT: 'var(--pocket-red)',
          dark: 'var(--pocket-red-dark)',
        },
        'pocket-gold': {
          DEFAULT: 'var(--pocket-gold)',
          light: 'var(--pocket-gold-light)',
        },
        'dark-bg': 'var(--dark-bg)',
        'dark-panel': 'var(--dark-panel)',
        'dark-card': 'var(--dark-card)',
        'dark-line': 'var(--dark-line)',
        'dark-ink': 'var(--dark-ink)',
        'dark-muted': 'var(--dark-muted)',
        'light-bg': 'var(--light-bg)',
        'light-panel': 'var(--light-panel)',
        'light-card': 'var(--light-card)',
        'light-line': 'var(--light-line)',
        'light-ink': 'var(--light-ink)',
        'light-muted': 'var(--light-muted)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        pulse: {
          "0%": { 
            boxShadow: "0 0 0 6px rgba(255, 219, 112, 0.28)" 
          },
          "70%": { 
            boxShadow: "0 0 0 16px rgba(255, 219, 112, 0)" 
          },
          "100%": { 
            boxShadow: "0 0 0 6px rgba(255, 219, 112, 0.28)" 
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 1.2s ease-in-out infinite",
      },
      spacing: {
        'safe-bottom': 'calc(66px + env(safe-area-inset-bottom))',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

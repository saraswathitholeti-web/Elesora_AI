/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          bg: "#080B1A",
          card: "#13152B",
          surface: "#1A1D36",
          border: "rgba(139, 92, 246, 0.2)",
        },
        electric: {
          purple: "#8B5CF6",
          cyan: "#22D3EE",
          pink: "#EC4899",
          indigo: "#6366F1",
        },
        content: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
        },
        status: {
          success: "#34D399",
          error: "#F87171",
          warning: "#FBBF24",
          info: "#38BDF8",
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
        cyanGlow: "0 0 25px -5px rgba(34, 211, 238, 0.3)",
        card: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

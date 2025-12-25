import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#1e3a5f",
          50: "#f0f5fa",
          100: "#e1ebf4",
          200: "#c3d7e9",
          300: "#94b8d8",
          400: "#6393c1",
          500: "#3d6f9f",
          600: "#2d5580",
          700: "#1e3a5f",
          800: "#162c47",
          900: "#0f1e30",
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "system-ui", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateX(10px) translateY(-50%)' },
          '100%': { opacity: '1', transform: 'translateX(0) translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;

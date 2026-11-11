import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        term: {
          bg: "#0c0c0c",
          panel: "#1f1f1f",
          line: "#3a3a3a",
          fg: "#cccccc",
          dim: "#767676",
          neon: "#61d6d6",
          amber: "#f9f1a5",
          danger: "#e74856",
          ink: "#0c0c0c",
        },
        // Design system do "Universo" (buraco negro)
        bh: {
          void: "#040203",
          surface: "#120a07",
          line: "#3a2218",
          ember: "#ff7a1a",
          amber: "#ffb454",
          flare: "#ffe9b8",
          plasma: "#ff4d1a",
          text: "#f3e7dc",
          mute: "#a08a7a",
          star: "#aebcff",
        },
      },
      keyframes: {
        // o buraco negro cresce enquanto o site carrega
        approach: {
          "0%": { transform: "scale(0.15)", opacity: "0" },
          "15%": { opacity: "1" },
          "100%": { transform: "scale(2.3)", opacity: "1" },
        },
      },
      animation: {
        approach: "approach 3.2s cubic-bezier(0.55, 0, 0.9, 0.45) infinite",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        code: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
        mono: ["Cascadia Mono", "Consolas", "var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

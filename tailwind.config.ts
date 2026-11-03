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
      },
      fontFamily: {
        mono: ["Cascadia Mono", "Consolas", "var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

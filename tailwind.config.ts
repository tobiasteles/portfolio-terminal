import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        term: {
          bg: "#040805",
          panel: "#08110a",
          line: "#14301a",
          fg: "#cdf5d3",
          dim: "#6b9275",
          neon: "#3dff8b",
          amber: "#ffc24b",
          danger: "#ff6b6b",
          ink: "#031006",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

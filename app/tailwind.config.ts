import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#0f172a",
        line: "rgba(148, 163, 184, 0.18)",
      },
      boxShadow: {
        panel: "0 24px 60px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

import path from "node:path";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "~db": path.resolve(__dirname, "./src/db"),
      "~entities": path.resolve(__dirname, "./src/entities"),
      "~src": path.resolve(__dirname, "./src"),
      "~e2e": path.resolve(__dirname, "./e2e"),
    },
  },
  test: {
    coverage: {
      exclude: [
        "dist/**",
        "e2e/**",
        "scripts/**",
        "src/db/seeds/**",
      ],
      include: ["src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
    },
    environment: "node",
    setupFiles: ["./e2e/setup-tests.ts"],
  },
});

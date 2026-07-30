import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 4316,
    strictPort: true,
  },
  preview: {
    port: 4316,
    strictPort: true,
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
  test: {
    exclude: ["e2e/**", "node_modules/**"],
  },
});

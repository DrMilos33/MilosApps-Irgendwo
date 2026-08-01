import { defineConfig } from "vitest/config";
import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL(".", import.meta.url));
const vendorSource = fileURLToPath(new URL("vendor/milosapps-shell/v2", import.meta.url));
const vendorOutput = fileURLToPath(new URL("dist/vendor/milosapps-shell/v2", import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "copy-locked-milosapps-shell",
      apply: "build",
      async closeBundle() {
        if (!vendorSource.startsWith(repositoryRoot) || !vendorOutput.startsWith(repositoryRoot)) {
          throw new Error("Vendorpfad liegt außerhalb des App-Repositorys.");
        }
        await cp(vendorSource, vendorOutput, { recursive: true });
      },
    },
  ],
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

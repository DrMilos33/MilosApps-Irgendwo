import { spawn } from "node:child_process";

const baseUrl = process.env.E2E_BASE_URL;
const expectedSourceSha = process.env.E2E_EXPECTED_SOURCE_SHA;

let parsedUrl;
try {
  parsedUrl = new URL(baseUrl ?? "");
} catch {
  throw new Error("E2E_BASE_URL muss für externe E2E eine gültige absolute HTTPS-URL sein.");
}
if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
  throw new Error("E2E_BASE_URL muss eine credential-freie absolute HTTPS-URL sein.");
}
if (!/^[0-9a-f]{40}$/.test(expectedSourceSha ?? "")) {
  throw new Error("E2E_EXPECTED_SOURCE_SHA muss der vollständige deployte Source-SHA sein.");
}

const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const child = spawn(executable, ["exec", "playwright", "test"], {
  env: process.env,
  stdio: "inherit",
});
child.on("error", (error) => {
  throw error;
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

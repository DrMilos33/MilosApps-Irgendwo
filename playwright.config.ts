import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4316",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  },
  webServer: {
    command: "pnpm preview",
    url: "http://127.0.0.1:4316/health/somewhere-now.json",
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    {
      name: "smartphone",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["iPad (gen 7)"],
        browserName: "chromium",
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
});

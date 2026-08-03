import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.E2E_BASE_URL;
const pagesPreview = process.env.E2E_PAGES === "true";
const localOrigin = "http://127.0.0.1:4316";
const localAppUrl = pagesPreview ? `${localOrigin}/MilosApps-Irgendwo/` : `${localOrigin}/`;
const targetAppUrl = externalBaseUrl ?? localAppUrl;
const baseOrigin = new URL(targetAppUrl).origin;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  workers: 4,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: baseOrigin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: pagesPreview ? "pnpm preview:pages" : "pnpm preview",
        url: new URL("health/somewhere-now.json", targetAppUrl).href,
        reuseExistingServer: false,
        timeout: 60_000,
      },
  projects: [
    {
      name: "smartphone",
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 390, height: 844 },
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
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});

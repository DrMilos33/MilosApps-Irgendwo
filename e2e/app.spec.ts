import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

interface WeatherOverrides {
  time?: string;
  weather_code?: number;
  temperature_2m?: number;
  cloud_cover?: number;
  precipitation?: number;
  rain?: number;
  showers?: number;
  snowfall?: number;
  wind_speed_10m?: number;
  wind_gusts_10m?: number;
}

function weatherBody(overrides: WeatherOverrides = {}) {
  return {
    latitude: 64.1,
    longitude: -21.9,
    timezone: "GMT",
    utc_offset_seconds: 0,
    current_units: {
      time: "iso8601",
      temperature_2m: "°C",
    },
    current: {
      time: "2026-07-30T12:00",
      interval: 900,
      temperature_2m: 18.4,
      apparent_temperature: 17.8,
      is_day: 1,
      precipitation: 0,
      rain: 0,
      showers: 0,
      snowfall: 0,
      weather_code: 1,
      cloud_cover: 18,
      wind_speed_10m: 12,
      wind_gusts_10m: 24,
      ...overrides,
    },
  };
}

async function mockWeather(page: Page, overrides: WeatherOverrides = {}): Promise<void> {
  await page.route("https://api.open-meteo.com/**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherBody(overrides)),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-07-30T12:10:00Z"));
});

test("lädt ohne Login und zeigt einen vollständigen Moment", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await mockWeather(page);

  await page.goto("/?place=reykjavik");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Reykjavík · Island")).toBeVisible();
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  const travel = page.getByRole("button", { name: "Noch einmal" });
  await expect(travel).toBeEnabled();
  const travelIsInInitialViewport = await travel.evaluate(
    (element) => element.getBoundingClientRect().top < window.innerHeight,
  );
  expect(travelIsInInitialViewport).toBe(true);
  await expect(page.getByRole("button", { name: "Moment teilen" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Klang einschalten" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("body")).not.toContainText(/anmelden|login|konto erforderlich/i);
  expect(consoleErrors).toEqual([]);
});

test("hat in der Hauptansicht keine automatisch erkannten Accessibility-Verstöße", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto("/?place=kathmandu");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("bleibt auch im dunklen Systemdesign kontrastreich", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await mockWeather(page);
  await page.goto("/?place=kathmandu");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("Dialog und Hauptaktion funktionieren vollständig per Tastatur", async ({ page }) => {
  await mockWeather(page);
  await page.goto("/?place=waitangi");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const about = page.getByRole("button", { name: "Über diese Reise" });
  await about.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "So entsteht der Moment" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(about).toBeFocused();

  await page.getByRole("button", { name: "Noch einmal" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
});

test("schnelle Wiederholungen lassen nur die letzte Anfrage gewinnen", async ({ page }) => {
  let requestCount = 0;
  await page.route("https://api.open-meteo.com/**", async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 80));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherBody({ temperature_2m: 10 + requestCount })),
    });
  });
  await page.goto("/?place=reykjavik");

  const travel = page.getByRole("button", { name: "Noch einmal" });
  await expect(travel).toBeVisible();
  await travel.click({ clickCount: 8, delay: 15 });

  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
  expect(requestCount).toBeGreaterThan(1);
});

test("bleibt bei fehlendem Wetter nutzbar und kann erneut versuchen", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (route) => route.abort("failed"));
  await page.goto("/?place=quito");

  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/Zeit und Tageslicht bleiben aktuell/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Wetter erneut laden" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Noch einmal" })).toBeEnabled();
});

test("erholt sich nach einem Wetterfehler über den sichtbaren Retry", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Zustandsübergang reicht einmal.");
  let shouldFail = true;
  await page.route("https://api.open-meteo.com/**", async (route) => {
    if (shouldFail) {
      await route.abort("failed");
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherBody()),
    });
  });
  await page.goto("/?place=quito");
  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();

  shouldFail = false;
  await page.getByRole("button", { name: "Wetter erneut laden" }).click();
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  await expect(page.getByText("Wetterdaten sind wieder da.")).toBeVisible();
});

test("markiert langsame Daten nach Timeout als Fallback", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Timeout reicht einmal in der Browsermatrix.");
  await page.route("https://api.open-meteo.com/**", async () => {
    await new Promise(() => {});
  });
  await page.goto("/?place=tokyo");
  await page.clock.fastForward("00:00:07");

  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/zu lange/)).toBeVisible();
});

test("stellt ältere Wetterdaten und einen Wiederholweg ehrlich dar", async ({ page }) => {
  await mockWeather(page, { time: "2026-07-30T09:00" });
  await page.goto("/?place=istanbul");

  await expect(page.getByText("älter", { exact: true })).toBeVisible();
  await expect(page.getByText(/älter markiert/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Wetter erneut laden" })).toBeVisible();
});

test("inszeniert gefährliche Wettercodes nicht", async ({ page }) => {
  await mockWeather(page, {
    weather_code: 95,
    precipitation: 5,
    wind_gusts_10m: 90,
  });
  await page.goto("/?place=tromso");

  await expect(page.getByText("bewusst ruhig", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Heute nur Zeit und Licht." })).toBeVisible();
  await expect(page.locator("#scene")).toHaveAttribute("data-weather", "clear");
});

test("bleibt bei blockiertem Audio still und erklärt den Zustand", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined, configurable: true });
  });
  await mockWeather(page);
  await page.goto("/?place=dakar");

  await page.getByRole("button", { name: "Klang einschalten" }).click();
  await expect(page.getByText("Der Browser hat den Klang nicht freigegeben.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Klang einschalten" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("Klang bleibt nach App-Resume kontrollierbar", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "App-Resume reicht einmal.");
  await mockWeather(page);
  await page.goto("/?place=dakar");
  const sound = page.getByRole("button", { name: "Klang einschalten" });
  await sound.click();
  await expect(page.getByRole("button", { name: "Klang ausschalten" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const otherPage = await context.newPage();
  await otherPage.goto("about:blank");
  await otherPage.bringToFront();
  await page.bringToFront();
  await page.getByRole("button", { name: "Klang ausschalten" }).click();
  await expect(page.getByRole("button", { name: "Klang einschalten" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await otherPage.close();
});

test("respektiert reduzierte Bewegung und bleibt bei 200 Prozent Zoom reflow-fähig", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const zoomedViewport =
    testInfo.project.name === "desktop"
      ? { width: 720, height: 900 }
      : testInfo.project.name === "tablet"
        ? { width: 512, height: 900 }
        : { width: 320, height: 780 };
  await page.setViewportSize(zoomedViewport);
  await mockWeather(page);
  await page.goto("/?place=longyearbyen");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  const animationDuration = await page.locator(".cloud-a").evaluate(
    (element) => getComputedStyle(element).animationDuration,
  );
  expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.001);
});

test("zeigt Polartag, Polarnacht und eine Datumsgrenze korrekt", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Zeitgrenzen reichen einmal in der Browsermatrix.");
  await mockWeather(page);

  await page.clock.setFixedTime(new Date("2026-06-21T12:00:00Z"));
  await page.goto("/?place=longyearbyen");
  await expect(page.getByText("Polartag", { exact: true })).toBeVisible();

  await page.clock.setFixedTime(new Date("2026-12-21T12:00:00Z"));
  await page.reload();
  await expect(page.getByText("Polarnacht", { exact: true })).toBeVisible();

  await page.clock.setFixedTime(new Date("2026-01-01T10:30:00Z"));
  await page.goto("/?place=waitangi");
  await expect(page.locator("#fact-time")).toContainText("Freitag, 2. Januar");
  await expect(page.locator("#scene-time")).toHaveText("00:15 Uhr");
});

test("funktioniert nach erstem Laden auch ohne Netz als App-Hülle", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Service-Worker-Prüfung reicht einmal.");
  await page.goto("/?place=reykjavik");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/nicht erreichbar|Offline/)).toBeVisible();
});

test("hält Interaktions- und Ressourcenbudget ein", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Performancebudget reicht einmal.");
  let requestCount = 0;
  await page.route("https://api.open-meteo.com/**", async (route) => {
    requestCount += 1;
    if (requestCount > 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherBody()),
    });
  });
  await page.goto("/?place=reykjavik");
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const resourceCount = await page.evaluate(() => performance.getEntriesByType("resource").length);
  expect(resourceCount).toBeLessThanOrEqual(10);

  const interactionLatency = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const app = document.querySelector("#app");
        const travel = document.querySelector<HTMLButtonElement>("#travel-button");
        if (!app || !travel) throw new Error("Interaktionsziel fehlt.");
        const started = performance.now();
        const observer = new MutationObserver(() => {
          if (app.getAttribute("aria-busy") === "true") {
            observer.disconnect();
            resolve(performance.now() - started);
          }
        });
        observer.observe(app, { attributes: true, attributeFilter: ["aria-busy"] });
        travel.click();
      }),
  );
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "true");
  expect(interactionLatency).toBeLessThan(100);
});

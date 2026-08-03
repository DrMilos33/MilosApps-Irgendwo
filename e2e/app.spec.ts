import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

const APP_PATH =
  process.env.E2E_BASE_URL || process.env.E2E_PAGES === "true"
    ? new URL(process.env.E2E_BASE_URL ?? "http://127.0.0.1:4316/MilosApps-Irgendwo/")
        .pathname.replace(/\/$/, "")
    : "";
const appPath = (search = "") => `${APP_PATH}/${search}`;

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

  await page.goto(appPath("?place=reykjavik"));

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Reykjavík · Island")).toBeVisible();
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  await expect(page.getByText(/Echte Ortszeit, Licht und Wetter/)).toBeVisible();
  await expect(page.locator("#selection-reason")).toContainText("Ausgewählt");
  const travel = page.getByRole("button", { name: "Nächsten Moment entdecken" });
  await expect(travel).toBeEnabled();
  const travelIsInInitialViewport = await travel.evaluate(
    (element) => element.getBoundingClientRect().top < window.innerHeight,
  );
  expect(travelIsInInitialViewport).toBe(true);
  await expect(page.getByRole("button", { name: "Teilen" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Klang einschalten" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.locator("body")).not.toContainText(/anmelden|login|konto erforderlich/i);
  expect(consoleErrors).toEqual([]);
});

test("hält die Einstiegshierarchie kompakt und die Hauptaktion im ersten Viewport", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const metrics = await page.evaluate(() => {
    const title = document.querySelector<HTMLElement>("#moment-title")!;
    const appTitle = document.querySelector<HTMLElement>(".app-title")!;
    const detail = document.querySelector<HTMLElement>("#moment-detail")!;
    const travel = document.querySelector<HTMLElement>("#travel-button")!;
    const copy = document.querySelector<HTMLElement>(".moment-copy")!;
    const scene = document.querySelector<HTMLElement>(".scene-column")!;
    const secondary = document.querySelector<HTMLElement>(".moment-secondary")!;
    const titleRect = title.getBoundingClientRect();
    const travelRect = travel.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const secondaryRect = secondary.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
      appTitleFontSize: Number.parseFloat(getComputedStyle(appTitle).fontSize),
      detailFontSize: Number.parseFloat(getComputedStyle(detail).fontSize),
      titleHeight: titleRect.height,
      travelTop: travelRect.top,
      travelHeight: travelRect.height,
      copyWidth: copyRect.width,
      sceneWidth: sceneRect.width,
      sceneTop: sceneRect.top,
      secondaryTop: secondaryRect.top,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  const narrow = metrics.viewportWidth <= 768;
  expect(metrics.titleFontSize).toBeLessThanOrEqual(narrow ? 31 : 34);
  expect(metrics.titleHeight).toBeLessThanOrEqual(narrow ? 70 : 75);
  expect(metrics.appTitleFontSize).toBeLessThanOrEqual(15);
  expect(metrics.detailFontSize).toBeLessThanOrEqual(15);
  expect(metrics.travelTop).toBeLessThan(metrics.viewportHeight);
  expect(metrics.travelHeight).toBeGreaterThanOrEqual(44);
  expect(metrics.overflow).toBeLessThanOrEqual(1);
  if (narrow) {
    expect(metrics.sceneTop).toBeLessThan(metrics.secondaryTop);
  } else {
    const minimumSceneRatio = metrics.viewportWidth >= 1200 ? 1.75 : 1.5;
    expect(metrics.sceneWidth / metrics.copyWidth).toBeGreaterThanOrEqual(minimumSceneRatio);
  }
});

test("hält die Hauptaktion bei kurzen und langen Momenttexten an derselben Position", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const metricsFor = async (title: string, detail: string, reason: string) =>
    page.evaluate(
      ({ title, detail, reason }) => {
        const titleElement = document.querySelector<HTMLElement>("#moment-title")!;
        const detailElement = document.querySelector<HTMLElement>("#moment-detail")!;
        const reasonElement = document.querySelector<HTMLElement>("#selection-reason")!;
        titleElement.textContent = title;
        detailElement.textContent = detail;
        reasonElement.textContent = reason;
        return {
          travelTop: document.querySelector<HTMLElement>("#travel-button")!.getBoundingClientRect().top,
          titleHeight: titleElement.getBoundingClientRect().height,
          detailHeight: detailElement.getBoundingClientRect().height,
          reasonHeight: reasonElement.getBoundingClientRect().height,
        };
      },
      { title, detail, reason },
    );

  const short = await metricsFor("Tag.", "Jetzt.", "Ausgewählt.");
  const long = await metricsFor(
    "Die Stadtseite der Erde schläft.",
    "Über Longyearbyen sinkt die Sonne an diesem Tag nicht unter den Horizont.",
    "Ausgewählt, weil in Longyearbyen der Sonnenaufgang in weniger als einer Stunde beginnt.",
  );

  expect(
    Math.abs(long.travelTop - short.travelTop),
    JSON.stringify({ short, long }),
  ).toBeLessThanOrEqual(1);
});

test("lässt die gesuchte Momentart wählen und zeigt ein ehrliches Live-Fenster", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const sunrise = page.getByRole("radio", { name: "Morgenlicht" });
  await sunrise.check();
  await expect(sunrise).toBeChecked();
  await expect(page.getByRole("button", { name: "Morgenlicht finden" })).toBeVisible();
  await page.getByRole("button", { name: "Morgenlicht finden" }).click();
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  await expect(page.locator("#selection-reason")).toContainText(/Sonnenaufgang|Morgenlicht/);

  const shell = page.locator("milos-app-shell");
  await shell.locator('button[data-locale="en"]').click();
  await expect(page.getByRole("button", { name: "Find morning light" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Morning light" })).toBeChecked();
  await shell.locator('button[data-locale="de"]').click();

  await expect(page.locator("#scene")).toContainText("LIVE-FENSTER");
  await expect(page.locator("#scene")).toContainText("keine Kamera");
  await expect(page.locator(".fact-card")).toHaveCSS("margin-left", "0px");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});

test("hält die Warum-jetzt-Aussage stabil, während Wetter ergänzt wird", async ({ page }) => {
  let releaseWeather!: () => void;
  const weatherGate = new Promise<void>((resolve) => {
    releaseWeather = resolve;
  });
  await page.route("https://api.open-meteo.com/**", async (route) => {
    await weatherGate;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(weatherBody({ cloud_cover: 92 })),
    });
  });

  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("lädt", { exact: true })).toBeVisible();
  const momentBefore = await page.locator("#moment-title").textContent();
  const reasonBefore = await page.locator("#selection-reason").textContent();
  releaseWeather();
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  await expect(page.locator("#moment-title")).toHaveText(momentBefore ?? "");
  await expect(page.locator("#selection-reason")).toHaveText(reasonBefore ?? "");
  await expect(page.locator("#fact-weather")).toContainText("bedeckt");
});

test("zeigt in einer realen Reise neue Orte, Szenenprofile und Fortschritt", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Die deterministische Sitzungsregel reicht einmal.");
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const seen: string[] = [await page.locator("#place-label").innerText()];
  const variants: string[] = [await page.locator("#scene").getAttribute("data-scene-variant") ?? ""];
  await expect(page.locator("#session-note")).toContainText("Ein Ort entdeckt");
  const travel = page.getByRole("button", { name: "Nächsten Moment entdecken" });
  for (let index = 0; index < 6; index += 1) {
    await travel.click();
    await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
    seen.push(await page.locator("#place-label").innerText());
    variants.push(await page.locator("#scene").getAttribute("data-scene-variant") ?? "");
  }

  expect(new Set(seen).size).toBe(seen.length);
  expect(new Set(variants).size).toBeGreaterThanOrEqual(6);
  await expect(page.locator("#session-note")).toContainText("7 verschiedene Orte");
  await expect(page.locator("#session-note")).toContainText("Landschaften in dieser Reise");
  await expect(page.locator("#journey-trail li")).toHaveCount(3);
  await expect(page.locator("#journey-trail li[aria-current='true']")).toHaveCount(1);
  await expect(page.locator("#journey-trail li[aria-current='true']")).toContainText(
    seen.at(-1)?.split("·")[0]?.trim() ?? "",
    { ignoreCase: true },
  );
});

test("bindet genau eine DEV-Shell mit absoluten Portfolio-Links und ehrlicher Grenze ein", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const shell = page.locator("milos-app-shell");
  await expect(shell).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(shell.locator(".dev")).toHaveText("DEV");
  await expect(shell.locator(".brand")).toHaveAttribute("href", "https://dev.milos-apps.de/");
  await expect(shell.getByRole("link", { name: /Alle Apps/ })).toHaveAttribute(
    "href",
    "https://dev.milos-apps.de/apps",
  );
  const legalNavigation = shell.getByRole("navigation", { name: "Rechtliches" });
  await expect(legalNavigation.getByRole("link", { name: "Impressum" })).toHaveAttribute(
    "href",
    "https://dev.milos-apps.de/impressum",
  );
  await expect(legalNavigation.getByRole("link", { name: "Datenschutz" })).toHaveAttribute(
    "href",
    "https://dev.milos-apps.de/datenschutz",
  );
  await expect(shell.locator("footer")).toContainText(
    "Ein stilles Fenster zu einem realen Moment irgendwo auf der Erde.",
  );
  await expect(page.locator("body")).not.toContainText(/anmelden|login|konto erforderlich/i);
  await expect(page.locator("milos-date-picker, milos-place-search")).toHaveCount(0);
});

test("zeigt beim frischen und langsamen Start einen kleinen lokalisierten Loader", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "smartphone") {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  if (testInfo.project.name === "desktop") {
    await page.addInitScript(() => {
      localStorage.setItem("milosapps.somewhere-now.language", "en");
    });
  }
  let releaseAppModule!: () => void;
  const appModuleGate = new Promise<void>((resolve) => {
    releaseAppModule = resolve;
  });
  await page.route("**/src/entry.js", async (route) => {
    await appModuleGate;
    await route.continue();
  });
  await mockWeather(page);

  const navigation = page.goto(appPath("?place=reykjavik"));
  const loader = page.locator("[data-milos-app-loading]");
  await expect(loader).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(loader.getByText("Irgendwo ist gerade …", { exact: true })).toBeVisible();
  await expect(
    loader.getByText(
      testInfo.project.name === "desktop" ? "Opening app …" : "App wird geöffnet …",
      { exact: true },
    ),
  ).toBeVisible();
  if (testInfo.project.name === "smartphone") {
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
  }
  const loaderState = await loader.evaluate((element) => {
    const icon = element.querySelector<HTMLElement>("[data-milos-loading-icon]");
    return {
      iconWidth: icon?.getBoundingClientRect().width ?? 0,
      iconHeight: icon?.getBoundingClientRect().height ?? 0,
      iconMaxWidth: icon ? getComputedStyle(icon).maxWidth : "",
      iconMaxHeight: icon ? getComputedStyle(icon).maxHeight : "",
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      visible: getComputedStyle(element).display !== "none",
      progressExists: Boolean(element.querySelector("[data-milos-loading-progress]")),
      progressAnimation: getComputedStyle(
        element.querySelector<HTMLElement>("[data-milos-loading-progress]")!,
        "::after",
      ).animationDuration,
    };
  });
  expect(loaderState.visible).toBe(true);
  expect(loaderState.progressExists).toBe(true);
  expect(loaderState.overflow).toBeLessThanOrEqual(1);
  expect(loaderState.iconWidth).toBeCloseTo(32, 0);
  expect(loaderState.iconHeight).toBeCloseTo(32, 0);
  expect(loaderState.iconMaxWidth).toBe("32px");
  expect(loaderState.iconMaxHeight).toBe("32px");
  if (testInfo.project.name === "smartphone") {
    expect(Number.parseFloat(loaderState.progressAnimation)).toBeLessThanOrEqual(0.001);
  }

  releaseAppModule();
  await navigation;
  await expect(loader).toBeHidden();
  await expect(
    page.getByText(testInfo.project.name === "desktop" ? "current" : "aktuell", {
      exact: true,
    }),
  ).toBeVisible();
});

test("begrenzt das Shell-Slot-Icon während des gesamten Komponentenübergangs", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "smartphone", "Die responsive Übergangsmatrix läuft einmal.");

  const baseUrl = String(testInfo.project.use.baseURL);
  const scenarios = [
    { name: "390 × 844", width: 390, height: 844, zoom200: false },
    { name: "360 × 800 bei 200 %", width: 360, height: 800, zoom200: true },
  ] as const;

  for (const scenario of scenarios) {
    const transitionContext = await browser.newContext({
      baseURL: baseUrl,
      locale: "de-DE",
      timezoneId: "Europe/Berlin",
      viewport: { width: scenario.width, height: scenario.height },
      reducedMotion: scenario.zoom200 ? "reduce" : "no-preference",
      serviceWorkers: "block",
    });
    const transitionPage = await transitionContext.newPage();
    if (scenario.zoom200) {
      await transitionPage.addInitScript(() => {
        document.documentElement.style.fontSize = "200%";
      });
    }

    const createGate = () => {
      let released = false;
      let resolveGate!: () => void;
      const promise = new Promise<void>((resolve) => {
        resolveGate = resolve;
      });
      return {
        promise,
        release: () => {
          if (released) return;
          released = true;
          resolveGate();
        },
      };
    };
    const bootstrapGate = createGate();
    const componentCssGate = createGate();
    const appModuleGate = createGate();
    let signalComponentCssRequest!: () => void;
    const componentCssRequested = new Promise<void>((resolve) => {
      signalComponentCssRequest = resolve;
    });

    await transitionPage.route("**/vendor/milosapps-shell/v2/bootstrap.js", async (route) => {
      await bootstrapGate.promise;
      await route.continue();
    });
    await transitionPage.route(
      "**/vendor/milosapps-shell/v2/milos-app-shell.css",
      async (route) => {
        signalComponentCssRequest();
        await componentCssGate.promise;
        await route.continue();
      },
    );
    await transitionPage.route("**/src/entry.js", async (route) => {
      await appModuleGate.promise;
      await route.continue();
    });
    await mockWeather(transitionPage);

    const navigation = transitionPage.goto(
      new URL(appPath("?place=reykjavik"), baseUrl).href,
    );
    const shellIcon = transitionPage.locator('milos-app-shell > svg[slot="app-icon"]');
    const loaderIcon = transitionPage.locator("[data-milos-loading-icon]");
    const readState = () =>
      transitionPage.evaluate(() => {
        const shellIconElement = document.querySelector<SVGSVGElement>(
          'milos-app-shell > svg[slot="app-icon"]',
        );
        const loaderIconElement = document.querySelector<HTMLElement>(
          "[data-milos-loading-icon]",
        );
        const componentLink = document
          .querySelector("milos-app-shell")
          ?.shadowRoot?.querySelector<HTMLLinkElement>(
            'link[data-milos-app-shell-component="2.0.3"]',
          );
        const essentialsLink = document.querySelector<HTMLLinkElement>(
          'link[href*="milos-app-essentials.css"]',
        );
        const shellRect = shellIconElement?.getBoundingClientRect();
        const loaderRect = loaderIconElement?.getBoundingClientRect();
        return {
          shellWidth: shellRect?.width ?? 0,
          shellHeight: shellRect?.height ?? 0,
          shellVisibility: shellIconElement
            ? getComputedStyle(shellIconElement).visibility
            : "missing",
          loaderWidth: loaderRect?.width ?? 0,
          loaderHeight: loaderRect?.height ?? 0,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          essentialsCssLoaded: Boolean(essentialsLink?.sheet),
          shellDefined: Boolean(customElements.get("milos-app-shell")),
          componentCssLoaded: Boolean(componentLink?.sheet),
        };
      });

    try {
      await expect(shellIcon, scenario.name).toBeAttached();
      await expect(loaderIcon, scenario.name).toBeVisible();
      await transitionPage.waitForFunction(() => {
        const essentialsLink = document.querySelector<HTMLLinkElement>(
          'link[href*="milos-app-essentials.css"]',
        );
        return Boolean(essentialsLink?.sheet);
      });

      const beforeUpgrade = await readState();
      expect(beforeUpgrade.essentialsCssLoaded, scenario.name).toBe(true);
      expect(beforeUpgrade.shellDefined, scenario.name).toBe(false);
      expect(beforeUpgrade.shellVisibility, scenario.name).toBe("hidden");
      expect.soft(beforeUpgrade.shellWidth, scenario.name).toBeLessThanOrEqual(38.01);
      expect.soft(beforeUpgrade.shellHeight, scenario.name).toBeLessThanOrEqual(38.01);
      expect(beforeUpgrade.loaderWidth, scenario.name).toBeCloseTo(32, 0);
      expect(beforeUpgrade.loaderHeight, scenario.name).toBeCloseTo(32, 0);
      expect(beforeUpgrade.scrollWidth - beforeUpgrade.clientWidth, scenario.name).toBeLessThanOrEqual(
        1,
      );

      bootstrapGate.release();
      await componentCssRequested;
      await transitionPage.waitForFunction(() => customElements.get("milos-app-shell"));

      const duringDelayedCss = await readState();
      expect(duringDelayedCss.shellDefined, scenario.name).toBe(true);
      expect(duringDelayedCss.componentCssLoaded, scenario.name).toBe(false);
      expect(duringDelayedCss.shellVisibility, scenario.name).toBe("visible");
      expect(duringDelayedCss.shellWidth, scenario.name).toBeLessThanOrEqual(38.01);
      expect(duringDelayedCss.shellHeight, scenario.name).toBeLessThanOrEqual(38.01);
      expect(duringDelayedCss.loaderWidth, scenario.name).toBeCloseTo(32, 0);
      expect(duringDelayedCss.loaderHeight, scenario.name).toBeCloseTo(32, 0);
      expect(
        duringDelayedCss.scrollWidth - duringDelayedCss.clientWidth,
        scenario.name,
      ).toBeLessThanOrEqual(1);

      componentCssGate.release();
      await transitionPage.waitForFunction(() => {
        const componentLink = document
          .querySelector("milos-app-shell")
          ?.shadowRoot?.querySelector<HTMLLinkElement>(
            'link[data-milos-app-shell-component="2.0.3"]',
          );
        return Boolean(componentLink?.sheet);
      });

      const afterCss = await readState();
      expect(afterCss.componentCssLoaded, scenario.name).toBe(true);
      expect(afterCss.shellVisibility, scenario.name).toBe("visible");
      expect(afterCss.shellWidth, scenario.name).toBeCloseTo(38, 0);
      expect(afterCss.shellHeight, scenario.name).toBeCloseTo(38, 0);
      expect(afterCss.loaderWidth, scenario.name).toBeCloseTo(32, 0);
      expect(afterCss.loaderHeight, scenario.name).toBeCloseTo(32, 0);
      expect(afterCss.scrollWidth - afterCss.clientWidth, scenario.name).toBeLessThanOrEqual(1);
      await expect(shellIcon, scenario.name).toHaveAttribute("width", "38");
      await expect(shellIcon, scenario.name).toHaveAttribute("height", "38");

      appModuleGate.release();
      await navigation;
      await expect(transitionPage.locator("[data-milos-app-loading]"), scenario.name).toBeHidden();
      await expect(transitionPage.locator("#place-label"), scenario.name).toContainText("Reykjavík");
    } finally {
      bootstrapGate.release();
      componentCssGate.release();
      appModuleGate.release();
      await navigation.catch(() => undefined);
      await transitionContext.close();
    }
  }
});

test("zeigt ohne Schein-Einwilligung eine dauerhafte Datenschutzinformation", async ({
  page,
}, testInfo) => {
  if (testInfo.project.name === "smartphone") {
    await page.setViewportSize({ width: 360, height: 800 });
  }
  await page.addInitScript(() => {
    localStorage.setItem("milosapps.somewhere-now.privacyNotice.v1", "dismissed");
  });
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));

  await expect(page.locator("[data-milos-privacy-notice]")).toHaveCount(0);
  const privacyLink = page.locator("[data-milos-privacy-info]");
  await expect(privacyLink).toBeVisible();
  await expect(privacyLink).toHaveAttribute(
    "href",
    "https://dev.milos-apps.de/datenschutz",
  );
  await expect(privacyLink).toHaveText("Datenschutz");
  await expect(privacyLink).toHaveCSS("min-height", "44px");
  expect(
    await page.evaluate(() => localStorage.getItem("milosapps.somewhere-now.privacyNotice.v1")),
  ).toBeNull();
  if (testInfo.project.name === "smartphone") {
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const layout = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
  }

  if (testInfo.project.name !== "desktop") return;

  await page.locator("milos-app-shell").locator('button[data-locale="en"]').click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("[data-milos-privacy-notice]")).toHaveCount(0);
  await expect(page.locator("[data-milos-privacy-info]")).toHaveText("Privacy");
});

test("teilt den Moment nativ ohne Ortsparameter in der URL", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Native Share reicht einmal.");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (payload: ShareData) => {
        (window as typeof window & { sharedPayload?: ShareData }).sharedPayload = payload;
      },
    });
  });
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  const share = page.getByRole("button", { name: "Teilen" });
  const before = await share.evaluate((element) => element.getBoundingClientRect().toJSON());
  await share.click();
  await expect(page.locator("[data-milos-share-status]")).toHaveText("");
  const after = await share.evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(after.width).toBeCloseTo(before.width, 1);
  expect(after.height).toBeCloseTo(before.height, 1);
  const payload = await page.evaluate(
    () => (window as typeof window & { sharedPayload?: ShareData }).sharedPayload,
  );
  expect(payload?.text).toContain("Reykjavík");
  expect(payload?.text).toContain("Ortszeit:");
  expect(payload?.text).toContain("„Irgendwo ist gerade …“");
  expect(payload?.url).toBe(new URL(appPath(), page.url()).href);
  expect(payload?.url).not.toContain("place=");
});

test("kopiert beim Share-Fallback Text und sicheren Root-Link", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Clipboard-Fallback reicht einmal.");
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { copiedShare?: string }).copiedShare = value;
        },
      },
    });
  });
  await mockWeather(page);
  await page.goto(appPath("?place=waitangi"));
  const share = page.getByRole("button", { name: "Teilen" });
  const before = await share.evaluate((element) => element.getBoundingClientRect().toJSON());
  await share.click();
  await expect(page.getByText("Link kopiert", { exact: true })).toBeVisible();
  const after = await share.evaluate((element) => element.getBoundingClientRect().toJSON());
  expect(after.width).toBeCloseTo(before.width, 1);
  expect(after.height).toBeCloseTo(before.height, 1);
  await expect(page.locator("[data-milos-share-status]")).toHaveCSS("position", "fixed");
  const copied = await page.evaluate(
    () => (window as typeof window & { copiedShare?: string }).copiedShare,
  );
  expect(copied).toContain("Waitangi");
  expect(copied).toContain("Ortszeit:");
  expect(copied).toContain(new URL(appPath(), page.url()).href);
  expect(copied).not.toContain("place=");
});

test("behandelt den Abbruch des nativen Share-Dialogs nicht als Fehler", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Abbruchpfad reicht einmal.");
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("cancelled", "AbortError");
      },
    });
  });
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  const share = page.getByRole("button", { name: "Teilen" });
  await share.click();
  await expect(share).toBeEnabled();
  await expect(page.locator("[data-milos-share-status]")).toHaveText("");
  expect(consoleErrors).toEqual([]);
});

test("bleibt unter strikter Same-Origin-CSP vollständig gestaltet", async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Die CSP-Vertragsprüfung reicht einmal.");
  const cspMessages: string[] = [];
  page.on("console", (message) => {
    if (/content security policy|refused to (?:apply|execute|load)/i.test(message.text())) {
      cspMessages.push(message.text());
    }
  });
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "content-security-policy": [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self'",
          "connect-src 'self' https://api.open-meteo.com",
          "img-src 'self' data:",
          "manifest-src 'self'",
          "worker-src 'self'",
        ].join("; "),
      },
    });
  });
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await page.waitForTimeout(250);
  expect(cspMessages).toEqual([]);
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const shell = page.locator("milos-app-shell");
  await expect(page.locator('link[data-milos-app-shell-theme="somewhere-now"]')).toHaveAttribute(
    "href",
    /\/vendor\/milosapps-shell\/v2\/milos-app-shell-theme\.css$/,
  );
  await expect(shell.locator('link[data-milos-app-shell-component="2.0.3"]')).toHaveAttribute(
    "href",
    /\/vendor\/milosapps-shell\/v2\/milos-app-shell\.css$/,
  );
  const styles = await shell.evaluate((element) => {
    const brand = element.shadowRoot?.querySelector(".brand");
    const icon = element.shadowRoot?.querySelector(".app-icon");
    const controls = [...(element.shadowRoot?.querySelectorAll<HTMLElement>(".control") ?? [])];
    return {
      hostDisplay: getComputedStyle(element).display,
      brandDisplay: brand ? getComputedStyle(brand).display : null,
      iconWidth: icon?.getBoundingClientRect().width ?? 0,
      controls: controls.map((control) => control.getBoundingClientRect().height),
    };
  });
  expect(styles.hostDisplay).toBe("grid");
  expect(styles.brandDisplay).toBe("flex");
  expect(styles.iconWidth).toBeCloseTo(38, 0);
  expect(styles.controls.every((height) => height >= 43.5)).toBe(true);
  await expect(page.locator("[style]")).toHaveCount(0);
  expect(cspMessages).toEqual([]);

  const expectedTypes = [
    ["bootstrap.js", /^(?:text|application)\/javascript(?:;|$)/i],
    ["milos-app-shell.js", /^(?:text|application)\/javascript(?:;|$)/i],
    ["milos-app-shell.css", /^text\/css(?:;|$)/i],
    ["milos-app-shell-theme.css", /^text\/css(?:;|$)/i],
  ] as const;
  for (const [file, expectedType] of expectedTypes) {
    const response = await request.get(appPath(`vendor/milosapps-shell/v2/${file}`));
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(expectedType);
  }

  const expectedEssentialsTypes = [
    ["bootstrap.js", /^(?:text|application)\/javascript(?:;|$)/i],
    ["milos-app-essentials.js", /^(?:text|application)\/javascript(?:;|$)/i],
    ["milos-app-essentials.css", /^text\/css(?:;|$)/i],
    ["milos-app-essentials-theme.css", /^text\/css(?:;|$)/i],
  ] as const;
  for (const [file, expectedType] of expectedEssentialsTypes) {
    const response = await request.get(appPath(`vendor/milosapps-essentials/v1/${file}`));
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toMatch(expectedType);
  }
});

test("übersetzt die vollständige Fach-UI ins Englische und behält die Wahl nach Reload", async ({
  page,
}) => {
  await mockWeather(page);
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const shell = page.locator("milos-app-shell");
  const english = shell.locator('button[data-locale="en"]');
  await english.click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle("Somewhere, right now … – MilosApps");
  await expect(page.getByRole("heading", { level: 1, name: "Somewhere, right now …" })).toBeVisible();
  await expect(page.getByText("Reykjavík · Iceland")).toBeVisible();
  await expect(
    page.getByText("Real local time, light and weather – somewhere on Earth."),
  ).toBeVisible();
  await expect(page.locator("#selection-reason")).toContainText(/^Selected /);
  await expect(page.getByRole("group", { name: "What would you like to see right now?" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Morning light" })).toBeVisible();
  await expect(page.locator("#scene")).toContainText("LIVE WINDOW");
  await expect(page.locator("#scene")).toContainText("no camera");
  await expect(page.locator("#session-note")).toContainText("One place discovered");
  await expect(page.locator("#journey-trail")).toHaveAttribute(
    "aria-label",
    "Recent discoveries",
  );
  await expect(page.locator("#journey-trail li[aria-current='true']")).toHaveText("Reykjavík");
  await expect(page.getByText("current", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Discover another moment" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Turn sound on" })).toBeVisible();
  await expect(shell.getByRole("link", { name: /All apps/ })).toBeVisible();
  await expect(shell.getByRole("link", { name: "Legal notice" })).toBeVisible();
  await expect(shell.locator("footer")).toContainText(
    "A quiet window into a real moment somewhere on Earth.",
  );

  await page.getByRole("button", { name: "About this journey" }).click();
  await expect(page.getByRole("heading", { name: "How this moment is made" })).toBeVisible();
  await expect(page.getByText("No account, no user location and no analytics cookies.")).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();

  expect(
    await page.evaluate(() => localStorage.getItem("milosapps.somewhere-now.language")),
  ).toBe("en");
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("current", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Discover another moment" })).toBeVisible();
  await expect(page.locator("#session-note")).toContainText("One place discovered");
  await expect(english).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#app")).not.toContainText(
    /Nächsten Moment entdecken|Moment teilen|Über diese Reise|Ortszeit|Wetter erneut laden/,
  );
  const skip = shell.locator(".skip");
  await skip.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#app")).toBeFocused();
  await expect(page.locator("#app")).toHaveAttribute("tabindex", "-1");
});

test("bietet sichtbaren Tastaturfokus und mindestens 44 Pixel große Ziele", async ({ page }) => {
  await mockWeather(page);
  await page.goto(appPath("?place=kathmandu"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const english = page.locator("milos-app-shell").locator('button[data-locale="en"]');
  await english.focus();
  await expect(english).toBeFocused();
  const focusStyle = await english.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(focusStyle).not.toBe("none");

  const undersized = await page.evaluate(() => {
    const shell = document.querySelector("milos-app-shell");
    const candidates = [
      ...document.querySelectorAll<HTMLElement>("button, a[href]"),
      ...(shell?.shadowRoot?.querySelectorAll<HTMLElement>("button, a[href]") ?? []),
    ];
    return candidates
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      })
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width < 43.5 || rect.height < 43.5;
      })
      .map((element) => ({ label: element.textContent?.trim() || element.getAttribute("aria-label"), rect: element.getBoundingClientRect().toJSON() }));
  });
  expect(undersized).toEqual([]);
});

test("hat in der Hauptansicht keine automatisch erkannten Accessibility-Verstöße", async ({
  page,
}) => {
  test.slow();
  await mockWeather(page);
  await page.goto(appPath("?place=kathmandu"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const adaptiveTheme = await page.evaluate(() => {
    const app = getComputedStyle(document.documentElement);
    const share = getComputedStyle(document.querySelector("milos-share-button > button")!);
    return {
      appColor: app.color,
      appSurface: app.backgroundColor,
      shareColor: share.color,
      shareSurface: share.backgroundColor,
    };
  });
  expect(adaptiveTheme.shareColor).toBe(adaptiveTheme.appColor);
  expect(adaptiveTheme.shareSurface).toBe(adaptiveTheme.appSurface);

  const results = await new AxeBuilder({ page }).analyze();
  const knownShadowBoundary = results.violations.filter(
    (violation) =>
      ["region", "skip-link"].includes(violation.id) &&
      violation.impact === "moderate" &&
      violation.nodes.every(
        (node) => JSON.stringify(node.target) === JSON.stringify([["milos-app-shell", ".skip"]]),
      ),
  );
  expect(knownShadowBoundary.map((violation) => violation.id).sort()).toEqual([
    "region",
    "skip-link",
  ]);
  expect(results.violations.filter((violation) => !knownShadowBoundary.includes(violation))).toEqual(
    [],
  );
});

test("bleibt auch im dunklen Systemdesign kontrastreich", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ colorScheme: "dark" });
  await mockWeather(page);
  await page.goto(appPath("?place=kathmandu"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const adaptiveTheme = await page.evaluate(() => {
    const app = getComputedStyle(document.documentElement);
    const share = getComputedStyle(document.querySelector("milos-share-button > button")!);
    return {
      appColor: app.color,
      appSurface: app.backgroundColor,
      shareColor: share.color,
      shareSurface: share.backgroundColor,
    };
  });
  expect(adaptiveTheme.shareColor).toBe("rgb(237, 240, 233)");
  expect(adaptiveTheme.shareSurface).toBe("rgb(19, 33, 43)");

  const results = await new AxeBuilder({ page }).analyze();
  const knownShadowBoundary = results.violations.filter(
    (violation) =>
      ["region", "skip-link"].includes(violation.id) &&
      violation.impact === "moderate" &&
      violation.nodes.every(
        (node) => JSON.stringify(node.target) === JSON.stringify([["milos-app-shell", ".skip"]]),
      ),
  );
  expect(knownShadowBoundary.map((violation) => violation.id).sort()).toEqual([
    "region",
    "skip-link",
  ]);
  expect(results.violations.filter((violation) => !knownShadowBoundary.includes(violation))).toEqual(
    [],
  );
});

test("Dialog und Hauptaktion funktionieren vollständig per Tastatur", async ({ page }) => {
  await mockWeather(page);
  await page.goto(appPath("?place=waitangi"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const skip = page.locator("milos-app-shell").locator(".skip");
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#app")).toBeFocused();
  await expect(page.locator("#app")).toHaveAttribute("tabindex", "-1");

  const about = page.getByRole("button", { name: "Über diese Reise" });
  await about.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "So entsteht der Moment" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(about).toBeFocused();

  await page.getByRole("button", { name: "Nächsten Moment entdecken" }).focus();
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
  await page.goto(appPath("?place=reykjavik"));

  const travel = page.getByRole("button", { name: "Nächsten Moment entdecken" });
  await expect(travel).toBeVisible();
  await travel.click({ clickCount: 8, delay: 15 });

  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
  expect(requestCount).toBeGreaterThan(1);
});

test("bleibt bei fehlendem Wetter nutzbar und kann erneut versuchen", async ({ page }) => {
  await page.route("https://api.open-meteo.com/**", (route) => route.abort("failed"));
  await page.goto(appPath("?place=quito"));

  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/Zeit und Tageslicht bleiben aktuell/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Wetter erneut laden" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nächsten Moment entdecken" })).toBeEnabled();
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
  await page.goto(appPath("?place=quito"));
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
  await page.goto(appPath("?place=tokyo"));
  await page.clock.fastForward("00:00:07");

  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/zu lange/)).toBeVisible();
});

test("stellt ältere Wetterdaten und einen Wiederholweg ehrlich dar", async ({ page }) => {
  await mockWeather(page, { time: "2026-07-30T09:00" });
  await page.goto(appPath("?place=istanbul"));

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
  await page.goto(appPath("?place=tromso"));

  await expect(page.getByText("bewusst ruhig", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Heute nur Zeit und Licht." })).toBeVisible();
  await expect(page.locator("#scene")).toHaveAttribute("data-weather", "clear");
});

test("bleibt bei blockiertem Audio still und erklärt den Zustand", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "AudioContext", { value: undefined, configurable: true });
  });
  await mockWeather(page);
  await page.goto(appPath("?place=dakar"));

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
  await page.goto(appPath("?place=dakar"));
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
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 360, height: 800 });
  await mockWeather(page);
  await page.goto(appPath("?place=longyearbyen"));
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const layout = await page.evaluate(() => {
    const shell = document.querySelector("milos-app-shell");
    const footer = shell?.shadowRoot?.querySelector("footer");
    if (!footer) throw new Error("Shell-Footer fehlt.");
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      footerGap: document.documentElement.scrollHeight - footer.getBoundingClientRect().bottom,
    };
  });
  expect(layout.overflow).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.footerGap)).toBeLessThanOrEqual(1);
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
  await page.goto(appPath("?place=longyearbyen"));
  await expect(page.getByText("Polartag", { exact: true })).toBeVisible();

  await page.clock.setFixedTime(new Date("2026-12-21T12:00:00Z"));
  await page.reload();
  await expect(page.getByText("Polarnacht", { exact: true })).toBeVisible();

  await page.clock.setFixedTime(new Date("2026-01-01T10:30:00Z"));
  await page.goto(appPath("?place=waitangi"));
  await expect(page.locator("#fact-time")).toContainText("Freitag, 2. Januar");
  await expect(page.locator("#scene-time")).toHaveText("00:15 Uhr");
});

test("funktioniert nach erstem Laden auch ohne Netz als App-Hülle", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Service-Worker-Prüfung reicht einmal.");
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.locator("[data-milos-app-loading]")).toBeHidden();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise<void>((resolve) => {
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), {
          once: true,
        });
      });
    }
  });
  const appOrigin = new URL(page.url()).origin;
  const failedSameOriginRequests: string[] = [];
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === appOrigin) failedSameOriginRequests.push(request.url());
  });
  await context.setOffline(true);
  await page.reload();

  expect(failedSameOriginRequests).toEqual([]);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("ohne Wetter", { exact: true })).toBeVisible();
  await expect(page.getByText(/nicht erreichbar|Offline/)).toBeVisible();
  const healthStayedNetworkOnly = await page.evaluate(async (healthUrl) => {
    try {
      await fetch(healthUrl, { cache: "no-store" });
      return false;
    } catch {
      return true;
    }
  }, appPath("health/somewhere-now.json"));
  expect(healthStayedNetworkOnly).toBe(true);
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
  await page.goto(appPath("?place=reykjavik"));
  await expect(page.getByText("aktuell", { exact: true })).toBeVisible();

  const resourceCount = await page.evaluate(() => performance.getEntriesByType("resource").length);
  expect(resourceCount).toBeLessThanOrEqual(14);

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

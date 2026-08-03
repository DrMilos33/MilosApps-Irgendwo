const CACHE_NAME = "somewhere-now-shell-v12";
const APP_BASE_URL = new URL("./", self.registration.scope);
const appUrl = (relativePath = "") => new URL(relativePath, APP_BASE_URL).href;
const LIVE_METADATA_PATHS = new Set([
  new URL("health.json", APP_BASE_URL).pathname,
  new URL("health/somewhere-now.json", APP_BASE_URL).pathname,
  new URL("app-metadata.json", APP_BASE_URL).pathname,
  new URL("deployment.json", APP_BASE_URL).pathname,
]);
const SHELL = [
  "favicon.svg",
  "manifest.webmanifest",
  "src/entry.js",
  "vendor/milosapps-shell/v2/bootstrap.js",
  "vendor/milosapps-shell/v2/milos-app-shell.js",
  "vendor/milosapps-shell/v2/milos-app-shell.css",
  "vendor/milosapps-shell/v2/milos-app-shell-theme.css",
  "vendor/milosapps-essentials/v1/bootstrap.js",
  "vendor/milosapps-essentials/v1/milos-app-essentials.js",
  "vendor/milosapps-essentials/v1/milos-app-essentials.css",
  "vendor/milosapps-essentials/v1/milos-app-essentials-theme.css",
].map((relativePath) => appUrl(relativePath));

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  const indexUrl = appUrl("index.html");
  const rootUrl = appUrl();
  const indexResponse = await fetch(indexUrl, { cache: "no-cache" });
  const indexText = await indexResponse.clone().text();
  await cache.put(indexUrl, indexResponse.clone());
  await cache.put(rootUrl, indexResponse);

  const assetPaths = Array.from(
    indexText.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g),
    (match) => new URL(match[1], APP_BASE_URL).href,
  ).filter(Boolean);
  await cache.addAll([...SHELL, ...assetPaths]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_BASE_URL.pathname)) return;

  if (LIVE_METADATA_PATHS.has(url.pathname)) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put(appUrl("index.html"), copy));
          return response;
        })
        .catch(() => caches.match(appUrl("index.html"))),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: true, ignoreVary: true });
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })(),
  );
});

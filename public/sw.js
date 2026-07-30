const CACHE_NAME = "somewhere-now-shell-v4";
const SHELL = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/health.json",
  "/health/somewhere-now.json",
];

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  const indexResponse = await fetch("/index.html", { cache: "no-cache" });
  const indexText = await indexResponse.clone().text();
  await cache.put("/index.html", indexResponse.clone());
  await cache.put("/", indexResponse);

  const assetPaths = Array.from(
    indexText.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g),
    (match) => match[1],
  ).filter(Boolean);
  await cache.addAll([...SHELL.slice(2), ...assetPaths]);
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
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(url.pathname, { ignoreSearch: true });
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

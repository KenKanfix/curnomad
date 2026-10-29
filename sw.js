const VERSION = "dasnomad-v1.5.1";
const SHELL_CACHE = `${VERSION}-shell`;
const RATE_CACHE = `${VERSION}-rates`;
const SCOPE = self.registration.scope;
const API_HOSTS = new Set([
  "open.er-api.com",
  "api.bigdatacloud.net",
  "api.open-meteo.com",
  "geocoding-api.open-meteo.com",
]);
const SHELL_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/icon.svg",
].map((url) => new URL(url, SCOPE).href);

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)));
      await precacheLinkedAssets(cache);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(
        networkFirst(request, SHELL_CACHE, new URL("./index.html", SCOPE).href, 3500),
      );
      return;
    }
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  if (API_HOSTS.has(url.hostname)) {
    event.respondWith(networkFirst(request, RATE_CACHE, null, 8000));
  }
});

async function precacheLinkedAssets(cache) {
  try {
    const indexUrl = new URL("./index.html", SCOPE).href;
    const response = await fetch(indexUrl, { cache: "reload" });
    if (!response.ok) return;
    const html = await response.text();
    const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter(
        (value) =>
          value.startsWith("./") ||
          value.startsWith("/") ||
          value.startsWith("assets/"),
      )
      .map((value) => new URL(value, SCOPE).href)
      .filter((value) => new URL(value).origin === self.location.origin);
    await Promise.allSettled(urls.map((url) => cache.add(url)));
  } catch {}
}

async function networkFirst(request, cacheName, fallbackUrl, timeout) {
  const cache = await caches.open(cacheName);
  try {
    const response = await withTimeout(fetch(request), timeout);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const shell = await caches.open(SHELL_CACHE);
      const fallback = await shell.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;
  return (await network) || new Response("Offline", { status: 503, statusText: "Offline" });
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

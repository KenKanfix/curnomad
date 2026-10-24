import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute([{"revision":"e0644ce530bb132e841e8d27cafdc755","url":"sw.js"},{"revision":"962389f84799540fc26dfc8296a5fb19","url":"registerSW.js"},{"revision":"df1870ca4902a2fdc52597833a2a9b2e","url":"index.html"},{"revision":null,"url":"assets/manifest-DjrWac9g.webmanifest"},{"revision":null,"url":"assets/index-DJANnzOh.css"},{"revision":null,"url":"assets/index-BnQzpdTM.js"},{"revision":null,"url":"assets/icon-DJJc6637.svg"},{"revision":null,"url":"assets/curnomad-app-Ch6CpxT0.png"}] || []);

const VERSION = "curnomad-v0.1.0";
const SHELL_CACHE = `${VERSION}-shell`;
const RATE_CACHE = `${VERSION}-rates`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/curnomad-app.png",
  "./assets/CurNomad.png",
  "./assets/icon.svg",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
];
const RATE_HOST = "open.er-api.com";
const GEO_HOST = "api.bigdatacloud.net";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    if (request.mode === "navigate") {
      event.respondWith(networkFirst(request, SHELL_CACHE, "./index.html", 3500));
      return;
    }
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  if (url.hostname === RATE_HOST) {
    event.respondWith(networkFirst(request, RATE_CACHE, null, 7000));
    return;
  }

  if (url.hostname === GEO_HOST) {
    event.respondWith(networkOnly(request));
  }
});

async function networkFirst(request, cacheName, fallbackUrl, timeout) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request, timeout);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response(
      JSON.stringify({ error: "offline", message: "No cached response is available." }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await network) || new Response("Offline", { status: 503 });
}

async function networkOnly(request) {
  try {
    return await fetchWithTimeout(request, 12000);
  } catch {
    return new Response(
      JSON.stringify({ error: "offline" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

function fetchWithTimeout(request, timeout) {
  if (!timeout) return fetch(request);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

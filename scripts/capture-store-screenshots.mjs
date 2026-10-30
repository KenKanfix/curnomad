import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB_DIR = path.join(ROOT, "dist-native");
const OUT_DIR = path.join(ROOT, "store", "screenshots");
const SERVER_PORT = 4179;
const DEBUG_PORT = 9333;
const CHROME = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 151.4, AUD: 1.52, CAD: 1.38, CHF: 0.88,
  CNY: 7.12, INR: 84.2, SGD: 1.34, HKD: 7.78, NZD: 1.67, THB: 33.8,
  AED: 3.6725, ZAR: 18.3, BRL: 5.75, MXN: 19.8, KRW: 1385, SEK: 10.6,
  NOK: 10.9, DKK: 6.86, PLN: 4.0, TRY: 34.3, IDR: 15700, MYR: 4.4,
  PHP: 58.2, VND: 25300, CZK: 23.2, HUF: 365, RON: 4.58, ILS: 3.72,
  SAR: 3.75, QAR: 3.64, KWD: 0.31, BHD: 0.376, OMR: 0.385, PKR: 278,
  BDT: 119, LKR: 294, NPR: 134, TWD: 32.1, ARS: 980, CLP: 940, COP: 4100,
  PEN: 3.78, UYU: 41.5, EGP: 48.7, NGN: 1650, KES: 129, GHS: 15.8,
  MAD: 9.75, TND: 3.12, DZD: 134, XOF: 604, XAF: 604, ZMW: 27.1,
  BWP: 13.6, MUR: 46.2, JMD: 157, TTD: 6.78, BBD: 2, BSD: 1, BZD: 2.01,
  CRC: 515, GTQ: 7.72, HNL: 24.9, NIO: 36.8, PAB: 1, DOP: 60.4,
  ISK: 138, RSD: 108, BAM: 1.8, MKD: 56.5, ALL: 90.5, MDL: 17.8,
  GEL: 2.72, AMD: 389, AZN: 1.7, KZT: 487, UZS: 12780, KGS: 86.5,
  TJS: 10.7, MNT: 3400, LAK: 21700, KHR: 4050, MMK: 2100, BND: 1.31,
};

const SEED_STATE = {
  home: "USD",
  amountRaw: "100",
  targets: [{ currency: "EUR" }, { currency: "GBP" }, { currency: "JPY" }],
  location: {
    countryCode: "FR",
    countryName: "France",
    city: "Paris",
    localCurrency: "EUR",
    timezone: "Europe/Paris",
    source: "network",
    detectedAt: "2026-10-30T09:00:00.000Z",
    lat: 48.8566,
    lon: 2.3522,
  },
};

const SEED_HOME = {
  timezone: "America/New_York",
  city: "New York",
  countryCode: "US",
  source: "manual",
  lat: 40.7128,
  lon: -74.006,
};

const SEED_RATES = {
  base: "USD",
  rates: RATES,
  updatedAt: "2026-10-30T09:00:00.000Z",
  fetchedAt: "2026-10-30T09:00:00.000Z",
};

const SPECS = [
  { name: "android-phone.png", width: 360, height: 640, dpr: 3, action: "main" },
  { name: "android-phone-2.png", width: 360, height: 640, dpr: 3, action: "tip" },
  { name: "android-tablet-10.png", width: 800, height: 1280, dpr: 2, action: "main" },
  { name: "iphone-6.9.png", width: 440, height: 956, dpr: 3, action: "main" },
  { name: "ipad-13.png", width: 1032, height: 1376, dpr: 2, action: "main" },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const requestPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
        const filePath = path.resolve(WEB_DIR, relative);
        if (!filePath.startsWith(WEB_DIR + path.sep)) {
          res.writeHead(403).end("Forbidden");
          return;
        }
        const stat = await fs.stat(filePath).catch(() => null);
        if (!stat || !stat.isFile()) {
          res.writeHead(404).end("Not found");
          return;
        }
        res.writeHead(200, {
          "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        createReadStream(filePath).pipe(res);
      } catch (error) {
        res.writeHead(500).end(String(error));
      }
    });
    server.once("error", reject);
    server.listen(SERVER_PORT, "127.0.0.1", () => resolve(server));
  });
}

function launchChrome(userDataDir) {
  const args = [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--window-size=1280,1024",
    "about:blank",
  ];
  const child = spawn(CHROME, args, { stdio: "ignore", windowsHide: true });
  child.on("error", (error) => console.error("Chrome launch failed:", error.message));
  return child;
}

async function waitForDebugging() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page) return page;
    } catch {
      // not ready yet
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

function connectCdp(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl);
  const pending = new Map();
  let nextId = 1;

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  });

  return {
    ready,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    },
    close() {
      ws.close();
    },
  };
}

function initScript() {
  const seed = {
    state: SEED_STATE,
    home: SEED_HOME,
    rates: SEED_RATES,
    fetchedAt: Date.now(),
  };
  return `(() => {
    const seed = ${JSON.stringify(seed)};
    const rates = seed.rates.rates;
    const nowSeconds = Math.floor(Date.now() / 1000);

    try {
      localStorage.setItem("roam.state.v1", JSON.stringify(seed.state));
      localStorage.setItem("roam.home.v1", JSON.stringify(seed.home));
      localStorage.setItem("roam.rates.v1", JSON.stringify(seed.rates));
      localStorage.setItem("roam.weather.v1", JSON.stringify({
        current: { temperature: 21.4, unit: "C", condition: "Cloudy", fetchedAt: seed.fetchedAt },
        home: { temperature: 14.2, unit: "C", condition: "Sunny", fetchedAt: seed.fetchedAt },
      }));
    } catch (error) {
      console.error("Seed failed", error);
    }

    const hideInstall = () => {
      const style = document.createElement("style");
      style.textContent = "#installButton{display:none!important}";
      document.head.appendChild(style);
    };
    if (document.head) hideInstall();
    else document.addEventListener("DOMContentLoaded", hideInstall, { once: true });

    const respond = (body) => new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input?.url || "";
      if (url.includes("open.er-api.com")) {
        return respond({
          result: "success",
          provider: "https://www.exchangerate-api.com",
          time_last_update_unix: nowSeconds - 3600,
          time_next_update_unix: nowSeconds + 82800,
          time_last_update_utc: new Date((nowSeconds - 3600) * 1000).toUTCString(),
          base_code: seed.state.home,
          rates,
        });
      }
      if (url.includes("api.bigdatacloud.net")) {
        return respond({
          latitude: 48.8566,
          longitude: 2.3522,
          city: "Paris",
          locality: "Paris",
          principalSubdivision: "Ile-de-France",
          countryCode: "FR",
          countryName: "France",
          localityInfo: {
            informative: [
              { description: "Time zone", name: "Europe/Paris" },
            ],
          },
        });
      }
      if (url.includes("api.open-meteo.com")) {
        const isHome = url.includes("40.7128") || url.includes("-74.006");
        return respond({
          latitude: isHome ? 40.7128 : 48.8566,
          longitude: isHome ? -74.006 : 2.3522,
          timezone: isHome ? "America/New_York" : "Europe/Paris",
          current: {
            temperature_2m: isHome ? 14.2 : 21.4,
            weather_code: isHome ? 0 : 2,
          },
        });
      }
      return nativeFetch(input, init);
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => {});
    }
  })();`;
}

async function waitForApp(cdp) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const { result } = await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const grid = document.getElementById("currencyGrid");
        const tip = document.getElementById("localTipCard");
        return document.readyState === "complete"
          && grid && grid.children.length === 4
          && tip && tip.hidden === false;
      })()`,
      returnByValue: true,
    });
    if (result.value) {
      await sleep(700);
      return;
    }
    await sleep(250);
  }
  throw new Error("App did not finish rendering");
}

async function prepareAction(cdp, action) {
  if (action === "tip") {
    await cdp.send("Runtime.evaluate", {
      expression: `(() => {
        const tip = document.getElementById("localTipCard");
        if (tip) {
          tip.open = true;
          tip.scrollIntoView({ block: "center" });
        }
        return Boolean(tip);
      })()`,
      returnByValue: true,
    });
    await sleep(500);
    return;
  }

  await cdp.send("Runtime.evaluate", {
    expression: `(() => {
      const tip = document.getElementById("localTipCard");
      if (tip) tip.open = false;
      window.scrollTo({ top: 0, behavior: "instant" });
      return true;
    })()`,
    returnByValue: true,
  });
  await sleep(200);
}

function pngSize(buffer) {
  if (buffer.readUInt32BE(0) !== 0x89504e47) throw new Error("Not a PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.access(CHROME).catch(() => {
    throw new Error(`Chrome not found at ${CHROME}. Set CHROME_PATH.`);
  });
  await fs.access(path.join(WEB_DIR, "index.html")).catch(() => {
    throw new Error("dist-native/index.html is missing. Run npm run build:native.");
  });

  const userDataDir = path.join(os.tmpdir(), `dasnomad-shots-${Date.now()}`);
  await fs.mkdir(userDataDir, { recursive: true });
  const server = await startServer();
  const chrome = launchChrome(userDataDir);

  try {
    const target = await waitForDebugging();
    const cdp = connectCdp(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Network.enable");
    await cdp.send("Network.setBypassServiceWorker", { bypass: true });
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: initScript() });

    for (const spec of SPECS) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: spec.width,
        height: spec.height,
        deviceScaleFactor: spec.dpr,
        mobile: true,
        screenWidth: spec.width,
        screenHeight: spec.height,
      });
      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${SERVER_PORT}/` });
      await waitForApp(cdp);
      await prepareAction(cdp, spec.action);
      await sleep(500);

      const capture = await cdp.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      const buffer = Buffer.from(capture.data, "base64");
      const outputPath = path.join(OUT_DIR, spec.name);
      await fs.writeFile(outputPath, buffer);
      const size = pngSize(buffer);
      const expected = `${spec.width * spec.dpr}x${spec.height * spec.dpr}`;
      const actual = `${size.width}x${size.height}`;
      console.log(`${spec.name}: ${actual}${actual === expected ? "" : ` (expected ${expected})`}`);
    }

    cdp.close();
  } finally {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/PID", String(chrome.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      killer.on("exit", resolve);
      killer.on("error", resolve);
    });
    await new Promise((resolve) => server.close(resolve));
    await fs.rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

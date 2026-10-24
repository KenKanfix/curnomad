const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "geolocation=(self)",
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://open.er-api.com https://api.bigdatacloud.net https://api.open-meteo.com https://geocoding-api.open-meteo.com",
    "manifest-src 'self'",
    "worker-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'none'",
  ].join("; "),
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD", ...SECURITY_HEADERS });
    res.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname);
  } catch {
    res.writeHead(400, SECURITY_HEADERS);
    res.end("Bad Request");
    return;
  }

  const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolvedPath = path.resolve(root, requestedPath);

  if (!resolvedPath.startsWith(root + path.sep) && resolvedPath !== path.join(root, "index.html")) {
    res.writeHead(403, SECURITY_HEADERS);
    res.end("Forbidden");
    return;
  }

  try {
    const stats = await fs.stat(resolvedPath);
    const filePath = stats.isDirectory() ? path.join(resolvedPath, "index.html") : resolvedPath;
    const data = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch (error) {
    if (error.code === "ENOENT" && !path.extname(requestedPath)) {
      try {
        const data = await fs.readFile(path.join(root, "index.html"));
        res.writeHead(200, {
          ...SECURITY_HEADERS,
          "Content-Type": MIME_TYPES[".html"],
          "Content-Length": data.length,
          "Cache-Control": "no-cache",
        });
        res.end(req.method === "HEAD" ? undefined : data);
        return;
      } catch {
        res.writeHead(404, SECURITY_HEADERS);
        res.end("Not Found");
        return;
      }
    }

    res.writeHead(404, {
      ...SECURITY_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("Not Found");
  }
});

server.listen(port, () => {
  console.log(`Curnomad is running at http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Try: $env:PORT=3001; npm start`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

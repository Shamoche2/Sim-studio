// Optional: serve Sim Studio on your local network so students can open it
// on their own devices. No dependencies. Usage: node serve.js [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const root = import.meta.dirname;
const port = Number(process.argv[2]) || 8080;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.normalize(path.join(root, url === "/" ? "index.html" : url));
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end("Not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Sim Studio running at http://localhost:${port}`);
  for (const nets of Object.values(os.networkInterfaces())) {
    for (const n of nets || []) if (n.family === "IPv4" && !n.internal) console.log(`Students on the same Wi-Fi can open http://${n.address}:${port}`);
  }
});

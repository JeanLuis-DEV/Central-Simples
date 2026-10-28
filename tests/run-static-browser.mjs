import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { spawn } from "node:child_process";
const root = resolve("out");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const name = pathname.endsWith("/")
      ? pathname + "index.html"
      : extname(pathname)
        ? pathname
        : pathname + ".html";
    const file = resolve(root, "." + name);
    if (!file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    res.setHeader(
      "content-type",
      mime[extname(file)] || "application/octet-stream",
    );
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
try {
  const env = {
    ...process.env,
    TEST_URL: "http://127.0.0.1:" + server.address().port,
    TEST_FINORYA_URL: "https://finorya.centralsimples.com.br",
    TEST_AJUDANTE_URL: "https://ajudante.centralsimples.com.br",
    TEST_MEU_NEGOCIO_URL: "https://meunegocio.centralsimples.com.br",
    TEST_LINGUA_MEMORY_URL: "https://lingua-memory.centralsimples.com.br",
  };
  const code = await new Promise((done, reject) => {
    const child = spawn(process.execPath, ["tests/browser.mjs"], {
      cwd: process.cwd(),
      env,
      stdio: "inherit",
      windowsHide: true,
    });
    child.on("error", reject);
    child.on("exit", (code) => done(code ?? 1));
  });
  if (code) process.exitCode = code;
} finally {
  await new Promise((done) => server.close(done));
}

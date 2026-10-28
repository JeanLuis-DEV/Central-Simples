import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "node:http";
import { test } from "node:test";
import { Miniflare } from "miniflare";
import { chromium } from "playwright";

test("exported Cloudflare assets reject framing independently of API headers", async () => {
  const headers = await readFile("out/_headers", "utf8");
  assert.match(headers, /frame-ancestors 'none'/);
  assert.match(headers, /X-Frame-Options: DENY/);
  const mf = new Miniflare({
    modules: true,
    script:
      'export default {fetch(){return new Response("not an asset",{status:404})}}',
    assets: { directory: resolve("out") },
    compatibilityDate: "2026-05-15",
  });
  const parent = createServer((_req, res) => {
    res.setHeader("content-type", "text/html");
    res.end(`<iframe src="${target}/area-restrita"></iframe>`);
  });
  let browser, target;
  try {
    target = (await mf.ready).origin;
    const response = await mf.dispatchFetch(target + "/area-restrita");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(
      response.headers.get("content-security-policy"),
      "frame-ancestors 'none'",
    );
    await new Promise((r) => parent.listen(0, "127.0.0.1", r));
    browser = await chromium.launch({
      headless: true,
      executablePath:
        process.env.CHROME_PATH ||
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
    });
    const page = await browser.newPage();
    const violations = [];
    page.on("console", (message) => {
      if (/frame-ancestors|X-Frame-Options/.test(message.text()))
        violations.push(message.text());
    });
    await page.route("**/*", (r) =>
      ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
        ? r.continue()
        : r.abort(),
    );
    await page.goto(`http://127.0.0.1:${parent.address().port}`, {
      waitUntil: "networkidle",
    });
    assert.ok(violations.length, "browser must enforce framing policy");
  } finally {
    await browser?.close();
    await mf.dispose();
    if (parent.listening) await new Promise((r) => parent.close(r));
  }
});

import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

await mkdir("artifacts", { recursive: true });
const appUrls = {
  finorya: process.env.TEST_FINORYA_URL || "http://127.0.0.1:5180",
  ajudante: process.env.TEST_AJUDANTE_URL || "http://127.0.0.1:5173",
  negocio: process.env.TEST_MEU_NEGOCIO_URL || "http://127.0.0.1:5181",
  lingua: process.env.TEST_LINGUA_MEMORY_URL || "http://127.0.0.1:5200",
};
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
try {
  const allowedOrigin = new URL(process.env.TEST_URL || "http://127.0.0.1:5190")
    .origin;
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === allowedOrigin) return route.continue();
    // This browser environment injects this antivirus script; it is absent from
    // the static export. Stub it locally instead of contacting its external host.
    if (
      url.hostname === "gc.kis.v2.scr.kaspersky-labs.com" &&
      url.pathname.endsWith("/main.js") &&
      route.request().resourceType() === "script"
    )
      return route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "",
      });
    return route.abort();
  });
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:5190", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page.title(),
    "Central Simples — Aplicativos para facilitar seu dia",
  );
  assert.equal(await page.locator(".app-card").count(), 4);
  assert.ok(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  );
  await page.screenshot({ path: "artifacts/desktop.png", fullPage: true });
  assert.equal(
    await page.getByRole("group", { name: "Filtrar por categoria" }).count(),
    0,
  );
  assert.equal(await page.locator(".phone-preview").count(), 4);
  assert.deepEqual(
    await page.locator(".phone-preview figcaption strong").allTextContents(),
    ["Finorya", "Ajudante Elétrico", "Meu Negócio", "Lingua Memory"],
  );
  for (const screen of await page.locator(".phone-screen img").all()) {
    assert.ok(await screen.isVisible());
    assert.ok(
      await screen.evaluate(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
  }
  for (const [name, destination] of [
    ["Finorya", appUrls.finorya],
    ["Ajudante Elétrico", appUrls.ajudante],
    ["Meu Negócio", appUrls.negocio],
    ["Lingua Memory", appUrls.lingua],
  ]) {
    const link = page.getByRole("link", {
      name: `Conhecer ${name}`,
      exact: true,
    });
    assert.equal(await link.getAttribute("href"), destination);
    assert.equal(await link.getAttribute("target"), "_blank");
    assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
  }
  await page.getByRole("button", { name: "Acessar apps", exact: true }).click();
  const access = page.getByRole("dialog");
  assert.equal(await access.locator(".access-list a").count(), 4);
  assert.equal(
    await access.locator(".access-list a").first().getAttribute("href"),
    `${appUrls.finorya}/login`,
  );
  assert.equal(
    await access.locator(".access-list a").nth(1).getAttribute("href"),
    `${appUrls.ajudante}/login`,
  );
  assert.equal(
    await access.locator(".access-list a").nth(2).getAttribute("href"),
    `${appUrls.negocio}/login`,
  );
  assert.equal(
    await access.locator(".access-list a").nth(3).getAttribute("href"),
    `${appUrls.lingua}/login`,
  );
  await page.screenshot({ path: "artifacts/access-desktop.png" });
  await page.keyboard.press("Escape");
  for (const width of [275, 280, 320, 360, 390, 540, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    );
    for (const selector of [
      ".header-inner",
      ".hero-copy",
      ".hero h1",
      ".hero-actions",
      ".phone-frame",
      ".app-card",
    ]) {
      const boxes = await page.locator(selector).evaluateAll((elements) =>
        elements.map((element) => {
          const bounds = element.getBoundingClientRect();
          return { left: bounds.left, right: bounds.right };
        }),
      );
      assert.ok(
        boxes.every((box) => box.left >= 0 && box.right <= width + 1),
        `${selector} exceeds viewport ${width}`,
      );
    }
    await page.screenshot({
      path: `artifacts/mobile-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Acessar apps", exact: true })
      .click();
    const bounds = await page.getByRole("dialog").boundingBox();
    assert.ok(
      bounds.x >= 0 &&
        bounds.x + bounds.width <= width &&
        bounds.y >= 0 &&
        bounds.y + bounds.height <= 844,
    );
    await page.screenshot({ path: `artifacts/detail-mobile-${width}.png` });
    await page.getByRole("button", { name: "Fechar", exact: true }).click();
  }
  assert.deepEqual(errors, []);
  console.log(
    "OK: catálogo, links diretos das landing pages, telas mobile, diálogo de acesso, teclado, imagens e layouts desktop/mobile.",
  );
} finally {
  await browser.close();
}

import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

await mkdir("artifacts", { recursive: true });
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
  await page.goto(process.env.TEST_URL || "http://127.0.0.1:5190", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await page.title(),
    "Central Simples — Aplicativos para facilitar seu dia",
  );
  assert.equal(await page.locator(".app-card").count(), 2);
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
  assert.equal(await page.locator(".phone-preview").count(), 2);
  assert.deepEqual(
    await page.locator(".phone-preview figcaption strong").allTextContents(),
    ["Finorya", "Ajudante Elétrico"],
  );
  for (const screen of await page.locator(".phone-screen img").all()) {
    assert.ok(await screen.isVisible());
    assert.ok(
      await screen.evaluate(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
  }
  for (const name of ["Finorya", "Ajudante Elétrico"]) {
    const trigger = page.getByRole("button", {
      name: `Conhecer ${name}`,
      exact: true,
    });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.equal(await dialog.getByRole("heading").innerText(), name);
    assert.ok(
      await dialog
        .getByRole("link", { name: /Abrir aplicativo/ })
        .getAttribute("href"),
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden" });
    await page.waitForFunction(
      (label) => document.activeElement?.getAttribute("aria-label") === label,
      `Conhecer ${name}`,
    );
    assert.equal(
      await trigger.evaluate((element) => element === document.activeElement),
      true,
    );
  }
  await page.getByRole("button", { name: "Acessar apps", exact: true }).click();
  const access = page.getByRole("dialog");
  assert.equal(await access.locator(".access-list a").count(), 2);
  assert.equal(
    await access.locator(".access-list a").first().getAttribute("href"),
    "http://127.0.0.1:5180/login",
  );
  assert.equal(
    await access.locator(".access-list a").last().getAttribute("href"),
    "http://127.0.0.1:5173/login",
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
      .getByRole("button", { name: "Conhecer Finorya", exact: true })
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
    "OK: catálogo, telas mobile, diálogos, teclado, imagens e layouts desktop/mobile.",
  );
} finally {
  await browser.close();
}

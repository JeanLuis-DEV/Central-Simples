import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { chromium } from "playwright";

// Serve only the local static build. API responses are isolated browser fixtures.
const root = resolve("out");
const contentTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    const relative = pathname.endsWith("/")
      ? `${pathname}index.html`
      : extname(pathname)
        ? pathname
        : `${pathname}.html`;
    const file = resolve(root, `.${relative}`);
    if (!file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    response.setHeader(
      "Content-Type",
      contentTypes[extname(file)] || "application/octet-stream",
    );
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage();
  const base = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  let loggedIn = true;
  let logoutStatus = 503;
  let createdAccount;
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (!url.pathname.startsWith("/api/central/")) return route.continue();
    let body;
    let status = 200;
    if (url.pathname.endsWith("/session/logout")) {
      status = logoutStatus;
      if (status === 200) loggedIn = false;
      body = status === 200 ? { ok: true } : { error: "Storage unavailable" };
    } else if (url.pathname.endsWith("/session/login")) {
      status = 429;
      body = { error: "Muitas tentativas. Aguarde antes de tentar novamente." };
    } else if (url.pathname.endsWith("/session"))
      body = { user: loggedIn ? { username: "test-admin" } : null };
    else if (url.pathname.endsWith("/apps"))
      body = {
        apps: [
          {
            id: "ajudante",
            name: "Ajudante Elétrico",
            connected: true,
            available: true,
          },
          {
            id: "lingua-memory",
            name: "Lingua Memory",
            connected: true,
            available: true,
          },
        ],
      };
    else if (
      url.pathname.endsWith("/accounts") &&
      route.request().method() === "POST"
    ) {
      createdAccount = route.request().postDataJSON();
      status = 201;
      body = { id: "synthetic-managed-account" };
    } else body = { users: [] };
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.goto(base + "/area-restrita");
  await page
    .getByRole("heading", { name: "Criar conta no Ajudante Elétrico" })
    .waitFor();
  await page.getByRole("tab", { name: "Lingua Memory", exact: true }).click();
  await page
    .getByRole("heading", { name: "Criar conta no Lingua Memory" })
    .waitFor();
  await page.getByLabel("Nome", { exact: true }).fill("Conta de teste");
  await page.getByLabel("E-mail", { exact: true }).fill("managed@example.test");
  await page.getByLabel("Login", { exact: true }).fill("managed.login");
  await page
    .getByLabel("Senha inicial", { exact: true })
    .fill("Synthetic-browser-password!");
  await page.getByRole("button", { name: "Criar conta", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Conta criada no Lingua Memory." })
    .waitFor();
  assert.equal(createdAccount.email, "managed@example.test");
  assert.equal(createdAccount.username, "managed.login");
  assert.equal(createdAccount.appId, "lingua-memory");
  assert.ok(!("cpf" in createdAccount) && !("phone" in createdAccount));
  await page
    .getByRole("tab", { name: "Ajudante Elétrico", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Criar conta no Ajudante Elétrico" })
    .waitFor();
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Não foi possível encerrar a sessão." })
    .waitFor();
  assert.ok(
    await page
      .getByRole("heading", { name: "Criar conta no Ajudante Elétrico" })
      .isVisible(),
  );
  logoutStatus = 200;
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await page
    .getByRole("heading", { name: "Contas dos aplicativos." })
    .waitFor();
  await page.getByLabel("Usuário", { exact: true }).fill("test-admin");
  await page
    .getByLabel("Senha", { exact: true })
    .fill("Synthetic-browser-password");
  await page.getByRole("button", { name: "Entrar na administração" }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Muitas tentativas." })
    .waitFor();
  assert.ok(
    await page
      .getByRole("heading", { name: "Contas dos aplicativos." })
      .isVisible(),
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: managed Lingua identity separates email/login; logout failure stays visible, successful logout exits, throttled login remains blocked.",
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}

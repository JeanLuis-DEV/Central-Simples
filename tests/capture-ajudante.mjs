import { chromium } from "playwright";

// Capture the real app UI with isolated demonstration responses; no account or database writes.
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
try {
  const page = await browser.newPage({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 1,
  });
  const examples = [
    [
      "Modernização do quadro elétrico",
      "Condomínio Horizonte",
      425000,
      "Pendente",
    ],
    ["Iluminação do apartamento", "Mariana Costa", 144000, "Aprovado"],
    ["Novos pontos de energia", "Studio Forma", 180000, "Pendente"],
    ["Instalação elétrica residencial", "Rafael Almeida", 680000, "Aprovado"],
    ["Revisão de instalações", "Condomínio Horizonte", 95000, "Recusado"],
  ];
  const data = {
    clients: examples.map((item, index) => ({
      id: `client-${index}`,
      name: item[1],
      email: "",
      phone: "",
      address: "",
    })),
    catalog: [],
    orders: [],
    transactions: [],
    catalogVersion: 4,
    company: { name: "Elétrica Exemplo", email: "", phone: "" },
    demo: false,
    quotes: examples.map((item, index) => ({
      id: `quote-${index}`,
      number: 1042 - index,
      title: item[0],
      clientId: `client-${index}`,
      date: `2026-10-${String(24 - index).padStart(2, "0")}`,
      validUntil: "2026-11-24",
      status: item[3],
      lines: [
        { id: `line-${index}`, name: item[0], qty: 1, price: item[2], cost: 0 },
      ],
      discount: 0,
      notes: "",
    })),
  };
  await page.route("**/api/auth/session", (route) =>
    route.fulfill({
      json: {
        user: {
          id: "marketing-demo",
          name: "Elétrica Exemplo",
          username: "demo",
          role: "user",
          accountType: "customer",
          expiresAt: null,
          remainingDays: null,
        },
      },
    }),
  );
  await page.route("**/api/workspace", (route) => {
    if (route.request().method() !== "GET")
      throw new Error("Capture must not write workspace data.");
    return route.fulfill({ json: { data, version: 1 } });
  });
  await page.goto("http://127.0.0.1:5173/app#Or%C3%A7amentos", {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("heading", { name: "Orçamentos", exact: true })
    .waitFor();
  await page
    .getByText("Modernização do quadro elétrico", { exact: true })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "public/apps/ajudante-orcamentos-mobile.jpg",
    type: "jpeg",
    quality: 95,
  });
  console.log("Captured real mobile quotes screen with demonstration data.");
} finally {
  await browser.close();
}

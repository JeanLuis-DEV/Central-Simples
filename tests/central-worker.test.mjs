import assert from "node:assert/strict";
import { createHmac, pbkdf2Sync } from "node:crypto";
import { afterEach, mock, test } from "node:test";
import worker from "../worker.ts";

// Synthetic credentials; requests go directly to the Worker and never to production.
const origin = "https://centralsimples.com.br";
const password = "Local-test-password-only-42!";
const salt = Buffer.alloc(16, 7);
const env = {
  CENTRAL_ADMIN_USERNAME: "test-admin",
  CENTRAL_ADMIN_PASSWORD_HASH: `pbkdf2$sha256$100000$${salt.toString("base64url")}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("base64url")}`,
  CENTRAL_SESSION_SECRET: "local-session-secret-only-".repeat(2),
  CENTRAL_INTEGRATION_SECRET: "local-integration-secret-only-".repeat(2),
  AJUDANTE_APP_URL: "https://ajudante.example",
  FINORYA_APP_URL: "https://finorya.example",
  LINGUA_MEMORY_APP_URL: "https://lingua.example",
  ASSETS: { fetch() { throw new Error("Unexpected static asset request"); } },
};

function request(path, method = "GET", body, cookie) {
  return new Request(origin + path, {
    method,
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function session() {
  const response = await worker.fetch(request("/api/central/session/login", "POST", {
    username: env.CENTRAL_ADMIN_USERNAME, password,
  }), env);
  assert.equal(response.status, 200);
  return response.headers.get("set-cookie").split(";")[0];
}

afterEach(() => mock.restoreAll());

for (const [appId, target] of [
  ["ajudante", env.AJUDANTE_APP_URL],
  ["finorya", env.FINORYA_APP_URL],
  ["lingua-memory", env.LINGUA_MEMORY_APP_URL],
]) {
  test(`${appId}: signs empty and JSON bodies using the apps' hexadecimal HMAC contract`, async () => {
    const cookie = await session();
    const nonces = new Set();
    mock.method(globalThis, "fetch", async (url, init) => {
      assert.equal(url, target + "/api/internal/central/accounts");
      const headers = new Headers(init.headers);
      const timestamp = headers.get("x-central-timestamp");
      const nonce = headers.get("x-central-nonce");
      const signature = headers.get("x-central-signature");
      assert.match(timestamp, /^\d{13}$/);
      assert.ok(Math.abs(Date.now() - Number(timestamp)) < 5000);
      assert.match(nonce, /^[-A-Za-z0-9._~]{16,128}$/);
      assert.ok(!nonces.has(nonce));
      nonces.add(nonce);
      const body = init.body ?? "";
      assert.match(signature, /^[a-f0-9]{64}$/);
      assert.equal(signature, createHmac("sha256", env.CENTRAL_INTEGRATION_SECRET)
        .update(`${timestamp}.${nonce}.${body}`).digest("hex"));
      if (init.method === "GET") assert.equal(body, "");
      else assert.deepEqual(JSON.parse(body), { name: "Teste Unicode — João" });
      return Response.json({ users: [] });
    });
    const listing = await worker.fetch(request(`/api/central/accounts?appId=${appId}`, "GET", undefined, cookie), env);
    assert.equal(listing.status, 200);
    const creation = await worker.fetch(request("/api/central/accounts", "POST", {
      appId, name: "Teste Unicode — João",
    }, cookie), env);
    assert.equal(creation.status, 201);
    assert.equal(nonces.size, 2);
  });
}

test("refuses account operations without an authenticated session", async () => {
  const upstream = mock.method(globalThis, "fetch", () => { throw new Error("Must not reach an app"); });
  const response = await worker.fetch(request("/api/central/accounts?appId=finorya"), env);
  assert.equal(response.status, 401);
  assert.equal(upstream.mock.callCount(), 0);
});

import assert from "node:assert/strict";
import { createHash, createHmac, pbkdf2Sync } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { build } from "esbuild";
import { Miniflare } from "miniflare";

// All credentials and upstreams are synthetic. Outbound network access is mocked.
const origin = "https://central.example";
const password = "Local-test-password-only-42!";
const salt = Buffer.alloc(16, 7);
const bindings = {
  CENTRAL_ADMIN_USERNAME: "test-admin",
  CENTRAL_ADMIN_PASSWORD_HASH: `pbkdf2$sha256$100000$${salt.toString("base64url")}$${pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("base64url")}`,
  CENTRAL_SESSION_SECRET: "local-session-secret-only-".repeat(2),
  CENTRAL_INTEGRATION_SECRET: "local-integration-secret-only-".repeat(2),
  AJUDANTE_APP_URL: "https://ajudante.example",
  FINORYA_APP_URL: "https://finorya.example",
  LINGUA_MEMORY_APP_URL: "https://lingua.example",
  MEU_NEGOCIO_APP_URL: "https://meunegocio.example",
  MEU_NEGOCIO_INTEGRATION_SECRET: "meu-negocio-exclusive-secret-only-".repeat(2),
};
const config = JSON.parse(await readFile(new URL("../wrangler.json", import.meta.url), "utf8"));
const { outputFiles } = await build({ entryPoints: ["worker.ts"], bundle: true, write: false, format: "esm", platform: "browser", target: "es2022" });
const script = outputFiles[0].text;
const durableObjects = Object.fromEntries(config.durable_objects.bindings.map((binding) => [binding.name, {
  className: binding.class_name,
  useSQLite: config.migrations.some((migration) => migration.new_sqlite_classes?.includes(binding.class_name)),
}]));

async function fixture(t, overrides = {}) {
  const calls = [];
  const options = {
    modules: true, script, compatibilityDate: config.compatibility_date,
    bindings, durableObjects,
    serviceBindings: { ASSETS: () => new Response("static catalog") },
    outboundService: async (request) => {
      const url = new URL(request.url);
      assert.ok(["ajudante.example", "finorya.example", "lingua.example", "meunegocio.example"].includes(url.hostname), "No real upstream is allowed");
      calls.push({ url: request.url, method: request.method, headers: new Headers(request.headers), body: await request.text() });
      return Response.json({ users: [] });
    },
    ...overrides,
  };
  const mf = new Miniflare(options);
  let disposed = false;
  const dispose = async () => { if (!disposed) { disposed = true; await mf.dispose(); } };
  t.after(dispose);
  const request = (path, { method = "GET", body, cookie, headers = {}, ip = "192.0.2.1" } = {}) => mf.dispatchFetch(origin + path, {
    method, headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": ip, ...(cookie ? { Cookie: cookie } : {}), ...headers },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const login = (body = { username: bindings.CENTRAL_ADMIN_USERNAME, password }, extra = {}) => request("/api/central/session/login", { method: "POST", body, ...extra });
  const session = async () => {
    const response = await login();
    assert.equal(response.status, 200, await response.clone().text());
    assert.match(response.headers.get("set-cookie"), /HttpOnly; SameSite=Strict; Max-Age=43200; Secure/);
    return response.headers.get("set-cookie").split(";")[0];
  };
  return { mf, calls, request, login, session, dispose, options };
}

for (const [appId, target] of [
  ["ajudante", bindings.AJUDANTE_APP_URL], ["finorya", bindings.FINORYA_APP_URL], ["lingua-memory", bindings.LINGUA_MEMORY_APP_URL], ["meu-negocio", bindings.MEU_NEGOCIO_APP_URL],
]) {
  test(`${appId}: preserves signed integration with registered sessions`, async (t) => {
    const f = await fixture(t);
    const cookie = await f.session();
    assert.equal((await f.request(`/api/central/accounts?appId=${appId}`, { cookie })).status, 200);
    assert.equal((await f.request("/api/central/accounts", { method: "POST", body: { appId, name: "Teste Unicode — João" }, cookie })).status, 201);
    const nonces = new Set();
    for (const call of f.calls) {
      assert.equal(call.url, target + "/api/internal/central/accounts");
      const timestamp = call.headers.get("x-central-timestamp");
      const nonce = call.headers.get("x-central-nonce");
      assert.ok(Math.abs(Date.now() - Number(timestamp)) < 5000);
      assert.match(nonce, /^[-A-Za-z0-9._~]{16,128}$/);
      assert.ok(!nonces.has(nonce)); nonces.add(nonce);
      assert.equal(call.headers.get("x-central-signature"), createHmac("sha256", appId === "meu-negocio" ? bindings.MEU_NEGOCIO_INTEGRATION_SECRET : bindings.CENTRAL_INTEGRATION_SECRET).update(`${timestamp}.${nonce}.${call.body}`).digest("hex"));
      if (call.method === "GET") assert.equal(call.body, "");
      else assert.deepEqual(JSON.parse(call.body), { name: "Teste Unicode — João" });
    }
    assert.equal(nonces.size, 2);
  });
}

test("anonymous requests cannot reach any administrative operation", async (t) => {
  const f = await fixture(t);
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
    assert.equal((await f.request("/api/central/accounts?appId=finorya", { method, ...(method === "GET" ? {} : { body: { appId: "finorya" } }) })).status, 401);
  }
  assert.equal(f.calls.length, 0);
});

test("20 failed attempts cannot bypass the account limit; correct credentials remain blocked", async (t) => {
  const f = await fixture(t);
  const statuses = [];
  for (let i = 0; i < 20; i++) statuses.push((await f.login({ username: "test-admin", password: "wrong" })).status);
  assert.deepEqual(statuses, [...Array(10).fill(401), ...Array(10).fill(429)]);
  const blocked = await f.login();
  assert.equal(blocked.status, 429);
  assert.ok(Number(blocked.headers.get("retry-after")) > 0);
  assert.ok(Number(blocked.headers.get("retry-after")) <= 900);
  assert.equal(blocked.headers.get("cache-control"), "no-store");
  assert.equal(blocked.headers.get("set-cookie"), null);
});

test("account throttling survives IP rotation, username casing and parallel attempts", async (t) => {
  const f = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 25 }, (_, i) => f.login({ username: i % 2 ? " TEST-ADMIN " : "test-admin", password: "wrong" }, { ip: `192.0.2.${i + 1}` })));
  assert.equal(responses.filter((r) => r.status === 401).length, 10);
  assert.equal(responses.filter((r) => r.status === 429).length, 15);
});

test("IP throttling cannot be bypassed with changing usernames or forwarded headers", async (t) => {
  const f = await fixture(t);
  for (let i = 0; i < 22; i++) {
    const response = await f.login({ username: `unknown-${i}`, password: "wrong" }, { headers: { "X-Forwarded-For": `198.51.100.${i}`, "X-Real-IP": `203.0.113.${i}` } });
    assert.equal(response.status, i < 20 ? 401 : 429);
  }
  assert.equal((await f.login()).status, 429);
  assert.equal((await f.login(undefined, { ip: "192.0.2.200" })).status, 200);
});

test("copied cookies stop working after logout on session and account endpoints", async (t) => {
  const f = await fixture(t);
  const cookie = await f.session();
  const otherCookie = await f.session();
  const logout = await f.request("/api/central/session/logout", { method: "POST", cookie });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get("set-cookie"), /Max-Age=0/);
  assert.deepEqual(await (await f.request("/api/central/session", { cookie })).json(), { user: null });
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) {
    assert.equal((await f.request("/api/central/accounts?appId=finorya", { method, cookie, ...(method === "GET" ? {} : { body: { appId: "finorya" } }) })).status, 401);
  }
  assert.equal(f.calls.length, 0);
  assert.ok((await (await f.request("/api/central/session", { cookie: otherCookie })).json()).user);
  assert.equal((await f.request("/api/central/session/logout", { method: "POST", cookie })).status, 200);
});

test("old signed sessions, tampering and token suffixes cannot bypass registration", async (t) => {
  const f = await fixture(t);
  const payload = Buffer.from(JSON.stringify({ sub: bindings.CENTRAL_ADMIN_USERNAME, exp: Date.now() + 43200000, nonce: "legacy-nonce" })).toString("base64url");
  const legacy = payload + "." + createHmac("sha256", bindings.CENTRAL_SESSION_SECRET).update(payload).digest("base64url");
  const cookie = await f.session();
  for (const invalid of [`central_sid=${legacy}`, `${cookie}.suffix`, `${cookie}=`, "central_sid=invalid", cookie.slice(0, -5) + "AAAAA"]) {
    assert.equal((await f.request("/api/central/accounts?appId=finorya", { cookie: invalid })).status, 401);
  }
  assert.equal(f.calls.length, 0);
});

test("sessions and login limits persist across runtime restart, including logout", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "central-auth-test-"));
  let first, second;
  try {
    first = await fixture(t, { durableObjectsPersist: directory });
    const revoked = await first.session();
    const active = await first.session();
    await first.request("/api/central/session/logout", { method: "POST", cookie: revoked });
    for (let i = 0; i < 8; i++) assert.equal((await first.login({ username: "test-admin", password: "wrong" })).status, 401);
    await first.dispose();
    second = await fixture(t, { durableObjectsPersist: directory });
    assert.equal((await second.login()).status, 429);
    assert.deepEqual(await (await second.request("/api/central/session", { cookie: revoked })).json(), { user: null });
    assert.ok((await (await second.request("/api/central/session", { cookie: active })).json()).user);
  } finally {
    await first?.dispose(); await second?.dispose();
    // The only deletion target is the unique directory returned by mkdtemp.
    assert.ok(directory.startsWith(join(tmpdir(), "central-auth-test-")));
    await rm(directory, { recursive: true, force: true });
  }
});

for (const [key, value] of [
  ["CENTRAL_ADMIN_PASSWORD_HASH", bindings.CENTRAL_ADMIN_PASSWORD_HASH + "changed"],
  ["CENTRAL_SESSION_SECRET", "different-synthetic-session-secret-2026"],
  ["CENTRAL_ADMIN_USERNAME", "different-admin"],
]) {
  test(`changing ${key} invalidates existing sessions`, async (t) => {
    const f = await fixture(t);
    const cookie = await f.session();
    await f.mf.setOptions({ ...f.options, bindings: { ...bindings, [key]: value } });
    assert.equal((await f.request("/api/central/accounts?appId=finorya", { cookie })).status, 401);
    assert.equal(f.calls.length, 0);
  });
}

test("missing persistent storage fails closed for login, authenticated access and logout", async (t) => {
  const f = await fixture(t);
  const cookie = await f.session();
  await f.mf.setOptions({ ...f.options, durableObjects: {} });
  for (const response of [await f.login(), await f.request("/api/central/accounts?appId=finorya", { cookie }), await f.request("/api/central/session/logout", { method: "POST", cookie })]) {
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal(f.calls.length, 0);
});

test("cross-origin login and logout are rejected without revoking the legitimate session", async (t) => {
  const f = await fixture(t);
  const cookie = await f.session();
  const headers = { Origin: "https://attacker.example", "Sec-Fetch-Site": "cross-site" };
  assert.equal((await f.login(undefined, { headers })).status, 403);
  assert.equal((await f.request("/api/central/session/logout", { method: "POST", cookie, headers })).status, 403);
  assert.ok((await (await f.request("/api/central/session", { cookie })).json()).user);
});

test("expired registered sessions are refused", async (t) => {
  const f = await fixture(t);
  const namespace = await f.mf.getDurableObjectNamespace("CENTRAL_AUTH");
  const state = namespace.get(namespace.idFromName("central-auth-v1"));
  const expiresAt = Date.now() + 1500;
  const payload = Buffer.from(JSON.stringify({ sub: bindings.CENTRAL_ADMIN_USERNAME, exp: expiresAt, nonce: "expiry-test" })).toString("base64url");
  const token = payload + "." + createHmac("sha256", bindings.CENTRAL_SESSION_SECRET).update(payload).digest("base64url");
  const created = await state.fetch("https://central-auth.internal", { method: "POST", body: JSON.stringify({
    action: "create", tokenHash: createHash("sha256").update(token).digest("hex"), expiresAt,
    credentialVersion: createHmac("sha256", bindings.CENTRAL_SESSION_SECRET).update(JSON.stringify(["central-credentials-v1", bindings.CENTRAL_ADMIN_USERNAME, bindings.CENTRAL_ADMIN_PASSWORD_HASH])).digest("hex"),
  }) });
  assert.equal(created.status, 200);
  assert.ok((await (await f.request("/api/central/session", { cookie: `central_sid=${token}` })).json()).user);
  await new Promise((resolve) => setTimeout(resolve, Math.max(0, expiresAt - Date.now()) + 25));
  assert.equal((await f.request("/api/central/accounts?appId=finorya", { cookie: `central_sid=${token}` })).status, 401);
});

test("non-object JSON is rejected and the static catalog remains available", async (t) => {
  const f = await fixture(t);
  for (const body of [null, [], "invalid"]) assert.equal((await f.login(body)).status, 400);
  assert.equal(await (await f.request("/")).text(), "static catalog");
  const response = await f.request("/api/central/session");
  assert.equal(response.headers.get("Content-Security-Policy"), "frame-ancestors 'none'");
  assert.equal(response.headers.get("X-Frame-Options"), "DENY");
});


test("Meu Negócio requires its exclusive key and never falls back to another app key", async (t) => {
  const f = await fixture(t, { bindings: { ...bindings, MEU_NEGOCIO_INTEGRATION_SECRET: "" } });
  const cookie = await f.session();
  const response = await f.request("/api/central/accounts?appId=meu-negocio", { cookie });
  assert.equal(response.status, 503);
  assert.equal(f.calls.length, 0);
  const apps = await (await f.request("/api/central/apps")).json();
  assert.deepEqual(apps.apps.find(app => app.id === "meu-negocio"), { id: "meu-negocio", name: "Meu Negócio", connected: false, available: false });
});

import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { build } from "esbuild";

const { outputFiles } = await build({ entryPoints: ["lib/central-auth-state.ts"], bundle: true, write: false, format: "esm" });
const { CentralAuthState, LOGIN_WINDOW_MS } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString("base64")}`);

function fixture(t) {
  const db = new DatabaseSync(":memory:");
  t.after(() => db.close());
  let now = 1800000000000;
  let alarm = null;
  t.mock.method(Date, "now", () => now);
  const storage = {
    sql: { exec(query, ...bindings) {
      let rows;
      if (query.includes("CREATE TABLE")) { db.exec(query); rows = []; }
      else rows = db.prepare(query).all(...bindings);
      return { toArray: () => rows, one: () => { assert.equal(rows.length, 1); return rows[0]; } };
    } },
    transactionSync(fn) {
      db.exec("BEGIN");
      try { const result = fn(); db.exec("COMMIT"); return result; }
      catch (error) { db.exec("ROLLBACK"); throw error; }
    },
    async setAlarm(value) { alarm = value; },
    async deleteAlarm() { alarm = null; },
  };
  const state = new CentralAuthState({ storage });
  const command = (body) => state.fetch(new Request("https://internal.example", { method: "POST", body: JSON.stringify(body) }));
  return { state, command, db, advance: (ms) => { now += ms; }, now: () => now, alarm: () => alarm };
}

test("rate limits expire without blocked attempts extending the window", async (t) => {
  const f = fixture(t);
  const attempt = { action: "attempt", ipKey: "1".repeat(64), accountKey: "2".repeat(64) };
  for (let i = 0; i < 10; i++) assert.equal((await (await f.command(attempt)).json()).retryAfter, 0);
  assert.equal((await (await f.command(attempt)).json()).retryAfter, 900);
  f.advance(LOGIN_WINDOW_MS - 1000);
  assert.equal((await (await f.command(attempt)).json()).retryAfter, 1);
  f.advance(1000);
  assert.equal((await (await f.command(attempt)).json()).retryAfter, 0);
  assert.equal(f.alarm(), f.now() + LOGIN_WINDOW_MS);
});

test("alarms remove expired attempts and session hashes, preserving live sessions", async (t) => {
  const f = fixture(t);
  const version = "a".repeat(64);
  await f.command({ action: "attempt", ipKey: "1".repeat(64), accountKey: null });
  await f.command({ action: "create", tokenHash: "2".repeat(64), credentialVersion: version, expiresAt: f.now() + LOGIN_WINDOW_MS });
  await f.command({ action: "create", tokenHash: "3".repeat(64), credentialVersion: version, expiresAt: f.now() + 2 * LOGIN_WINDOW_MS });
  f.advance(LOGIN_WINDOW_MS);
  await f.state.alarm();
  assert.equal(f.db.prepare("SELECT count(*) AS n FROM login_attempts").get().n, 0);
  assert.equal(f.db.prepare("SELECT count(*) AS n FROM sessions").get().n, 1);
  assert.equal(f.alarm(), f.now() + LOGIN_WINDOW_MS);
  f.advance(LOGIN_WINDOW_MS);
  await f.state.alarm();
  assert.equal(f.db.prepare("SELECT count(*) AS n FROM sessions").get().n, 0);
  assert.equal(f.alarm(), null);
});

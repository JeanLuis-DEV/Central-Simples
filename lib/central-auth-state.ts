import type { DurableObjectState, DurableObjectStorage } from "@cloudflare/workers-types";

export const SESSION_SECONDS = 60 * 60 * 12;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_IP_LIMIT = 20;
export const LOGIN_ACCOUNT_LIMIT = 10;

export type AuthCommand =
  | { action: "attempt"; ipKey: string; accountKey: string | null }
  | { action: "create"; tokenHash: string; credentialVersion: string; expiresAt: number }
  | { action: "validate"; tokenHash: string; credentialVersion: string }
  | { action: "revoke"; tokenHash: string };

const HASH = /^[a-f0-9]{64}$/;

// One persistent object coordinates this single-administrator application.
// Only the Worker binding can call it; no public route forwards these commands.
export class CentralAuthState {
  private readonly storage: DurableObjectStorage;

  constructor(ctx: DurableObjectState) {
    this.storage = ctx.storage;
    this.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        key TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS login_attempts_expiry ON login_attempts(expires_at);
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY, credential_version TEXT NOT NULL, expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    `);
  }

  private cleanup(now: number) {
    this.storage.sql.exec("DELETE FROM login_attempts WHERE expires_at<=?", now);
    this.storage.sql.exec("DELETE FROM sessions WHERE expires_at<=?", now);
  }

  private async scheduleCleanup() {
    const next = this.storage.sql.exec<{ expires_at: number | null }>(
      "SELECT min(expires_at) AS expires_at FROM (SELECT min(expires_at) AS expires_at FROM login_attempts UNION ALL SELECT min(expires_at) AS expires_at FROM sessions)",
    ).one().expires_at;
    if (next === null) await this.storage.deleteAlarm();
    else await this.storage.setAlarm(next);
  }

  async alarm() {
    this.cleanup(Date.now());
    await this.scheduleCleanup();
  }

  async fetch(request: Request) {
    if (request.method !== "POST") return new Response(null, { status: 405 });
    const command = await request.json() as AuthCommand;
    const now = Date.now();
    if (command.action === "attempt") {
      if (!HASH.test(command.ipKey) || (command.accountKey !== null && !HASH.test(command.accountKey)))
        return new Response(null, { status: 400 });
      // Reserve attempts before password verification. Read/check/write is one
      // transaction, so parallel requests cannot all pass the same last slot.
      const retryAfter = this.storage.transactionSync(() => {
        this.cleanup(now);
        const buckets = [
          { key: `ip:${command.ipKey}`, limit: LOGIN_IP_LIMIT },
          ...(command.accountKey ? [{ key: `account:${command.accountKey}`, limit: LOGIN_ACCOUNT_LIMIT }] : []),
        ].map((bucket) => ({
          ...bucket,
          row: this.storage.sql.exec<{ attempts: number; expires_at: number }>(
            "SELECT attempts,expires_at FROM login_attempts WHERE key=?", bucket.key,
          ).toArray()[0],
        }));
        const blockedUntil = Math.max(0, ...buckets.map(({ row, limit }) =>
          row && row.attempts >= limit ? row.expires_at : 0));
        if (blockedUntil > now) return Math.max(1, Math.ceil((blockedUntil - now) / 1000));
        for (const { key, row } of buckets) {
          this.storage.sql.exec(
            "INSERT INTO login_attempts(key,attempts,expires_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET attempts=excluded.attempts",
            key, (row?.attempts ?? 0) + 1, row?.expires_at ?? now + LOGIN_WINDOW_MS,
          );
        }
        return 0;
      });
      await this.scheduleCleanup();
      return Response.json({ retryAfter });
    }

    if (!HASH.test(command.tokenHash)) return new Response(null, { status: 400 });
    if (command.action === "validate") {
      if (!HASH.test(command.credentialVersion)) return new Response(null, { status: 400 });
      const valid = this.storage.sql.exec(
        "SELECT 1 FROM sessions WHERE token_hash=? AND credential_version=? AND expires_at>?",
        command.tokenHash, command.credentialVersion, now,
      ).toArray().length === 1;
      return Response.json({ valid });
    }
    if (command.action === "create") {
      if (!HASH.test(command.credentialVersion) || !Number.isSafeInteger(command.expiresAt) ||
          command.expiresAt <= now || command.expiresAt > now + SESSION_SECONDS * 1000)
        return new Response(null, { status: 400 });
      this.storage.transactionSync(() => {
        this.cleanup(now);
        this.storage.sql.exec(
          "INSERT INTO sessions(token_hash,credential_version,expires_at) VALUES (?,?,?)",
          command.tokenHash, command.credentialVersion, command.expiresAt,
        );
      });
    } else if (command.action === "revoke") {
      this.storage.sql.exec("DELETE FROM sessions WHERE token_hash=?", command.tokenHash);
    } else {
      return new Response(null, { status: 400 });
    }
    await this.scheduleCleanup();
    return Response.json({ ok: true });
  }
}

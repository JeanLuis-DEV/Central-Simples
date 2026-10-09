/*
 * Cloudflare Worker entry point for the Central Simples API.
 * The catalog remains a static asset, while account operations are proxied to
 * the owning application through a signed server-to-server request. Password
 * hashes and application data therefore stay in their original databases.
 */

type Assets = { fetch(request: Request): Promise<Response> };

type Env = {
  ASSETS: Assets;
  CENTRAL_ADMIN_USERNAME?: string;
  CENTRAL_ADMIN_PASSWORD_HASH?: string;
  CENTRAL_SESSION_SECRET?: string;
  CENTRAL_INTEGRATION_SECRET?: string;
  AJUDANTE_APP_URL?: string;
  FINORYA_APP_URL?: string;
  LINGUA_MEMORY_APP_URL?: string;
};

type TargetId = "ajudante" | "finorya" | "lingua-memory";
type TargetEnvKey = "AJUDANTE_APP_URL" | "FINORYA_APP_URL" | "LINGUA_MEMORY_APP_URL";

const SESSION_COOKIE = "central_sid";
const SESSION_SECONDS = 60 * 60 * 12;
const MAX_BODY = 16_384;
const TARGETS: Record<TargetId, { env: TargetEnvKey; label: string }> = {
  ajudante: { env: "AJUDANTE_APP_URL", label: "Ajudante Elétrico" },
  finorya: { env: "FINORYA_APP_URL", label: "Finorya" },
  "lingua-memory": { env: "LINGUA_MEMORY_APP_URL", label: "Lingua Memory" },
};

const encoder = new TextEncoder();

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}

function base64url(value: ArrayBuffer | Uint8Array | string) {
  const bytes = typeof value === "string" ? encoder.encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

async function verifyPbkdf2(password: string, encoded: string | undefined) {
  const parts = encoded?.split("$") ?? [];
  if (parts.length !== 5 || parts[0] !== "pbkdf2" || parts[1] !== "sha256") return false;
  const iterations = Number(parts[2]);
  if (!Number.isSafeInteger(iterations) || iterations < 100_000 || iterations > 100_000) return false;
  if (!/^[A-Za-z0-9_-]{22}$/.test(parts[3]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[4])) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: decodeBase64url(parts[3]), iterations, hash: "SHA-256" },
    key,
    256,
  );
  return constantTimeEqual(new Uint8Array(bits), decodeBase64url(parts[4]));
}

function parseCookie(request: Request, name: string) {
  return request.headers.get("cookie")?.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

async function createSession(secret: string, username: string) {
  const payload = base64url(JSON.stringify({ sub: username, exp: Date.now() + SESSION_SECONDS * 1000, nonce: base64url(crypto.getRandomValues(new Uint8Array(12))) }));
  return `${payload}.${base64url(await hmac(secret, payload))}`;
}

async function validSession(request: Request, secret: string | undefined, username: string | undefined) {
  if (!secret || secret.length < 32 || !username) return false;
  const token = parseCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  let decoded: { sub?: string; exp?: number };
  try {
    decoded = JSON.parse(new TextDecoder().decode(decodeBase64url(payload))) as { sub?: string; exp?: number };
  } catch {
    return false;
  }
  if (decoded.sub !== username || !decoded.exp || decoded.exp <= Date.now()) return false;
  try {
    return constantTimeEqual(decodeBase64url(signature), await hmac(secret, payload));
  } catch {
    return false;
  }
}

function cookie(value: string, request: Request, maxAge = SESSION_SECONDS) {
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return false;
  return request.headers.get("sec-fetch-site") !== "cross-site";
}

async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/json")) throw new ApiError(415, "Formato inválido.");
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY) throw new ApiError(413, "Limite de dados excedido.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Preencha os campos.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new ApiError(413, "Limite de dados excedido."); }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  try {
    return JSON.parse(new TextDecoder().decode(body)) as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "Dados inválidos.");
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function targetId(value: unknown): TargetId {
  if (value === "ajudante" || value === "finorya" || value === "lingua-memory") return value;
  throw new ApiError(400, "Escolha um aplicativo válido.");
}

function targetUrl(env: Env, id: TargetId) {
  const configured = env[TARGETS[id].env];
  if (!configured) return null;
  try {
    const url = new URL(configured);
    if (!/^https?:$/.test(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function callApplication(env: Env, id: TargetId, method: string, payload?: Record<string, unknown>) {
  const base = targetUrl(env, id);
  if (!base) throw new ApiError(503, `${TARGETS[id].label} ainda não está conectado à Central.`);
  if (!env.CENTRAL_INTEGRATION_SECRET || env.CENTRAL_INTEGRATION_SECRET.length < 32) throw new ApiError(503, "A integração segura ainda não foi configurada.");
  const body = method === "GET" ? "" : JSON.stringify(payload ?? {});
  const timestamp = String(Date.now());
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(18)));
  const signature = Array.from(
    await hmac(env.CENTRAL_INTEGRATION_SECRET, `${timestamp}.${nonce}.${body}`),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${base}/api/internal/central/accounts`, {
      method,
      headers: { "Content-Type": "application/json", "X-Central-Timestamp": timestamp, "X-Central-Nonce": nonce, "X-Central-Signature": signature },
      body: method === "GET" ? undefined : body,
      signal: controller.signal,
    });
    const responseBody = await response.text();
    let parsed: unknown = null;
    try { parsed = responseBody ? JSON.parse(responseBody) : null; } catch { parsed = null; }
    if (!response.ok) {
      const message = parsed && typeof parsed === "object" && "error" in parsed && typeof parsed.error === "string" ? parsed.error : "O aplicativo recusou a operação.";
      throw new ApiError(response.status >= 500 ? 502 : response.status, message);
    }
    return parsed;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(502, "Não foi possível alcançar o aplicativo agora.");
  } finally {
    clearTimeout(timer);
  }
}

async function requireAdmin(request: Request, env: Env) {
  if (!(await validSession(request, env.CENTRAL_SESSION_SECRET, env.CENTRAL_ADMIN_USERNAME))) throw new ApiError(401, "Sua sessão terminou. Entre novamente.");
}

async function handleApi(request: Request, env: Env) {
  if (!sameOrigin(request)) return json({ error: "Origem inválida." }, 403);
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === "/api/central/apps" && request.method === "GET") {
    return json({ apps: (Object.keys(TARGETS) as TargetId[]).map((id) => ({ id, name: TARGETS[id].label, connected: Boolean(targetUrl(env, id)), available: id !== "lingua-memory" || Boolean(targetUrl(env, id)) })) });
  }
  if (path === "/api/central/session/login" && request.method === "POST") {
    if (!env.CENTRAL_ADMIN_USERNAME || !env.CENTRAL_ADMIN_PASSWORD_HASH || !env.CENTRAL_SESSION_SECRET || env.CENTRAL_SESSION_SECRET.length < 32) return json({ error: "A autenticação da Central ainda não foi configurada." }, 503);
    const body = await readJson(request);
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._@-]{2,63}$/.test(username) || password.length < 1 || password.length > 128 || username.toLowerCase() !== env.CENTRAL_ADMIN_USERNAME.toLowerCase() || !(await verifyPbkdf2(password, env.CENTRAL_ADMIN_PASSWORD_HASH))) return json({ error: "Login ou senha inválidos." }, 401);
    const token = await createSession(env.CENTRAL_SESSION_SECRET, env.CENTRAL_ADMIN_USERNAME);
    return json({ user: { username: env.CENTRAL_ADMIN_USERNAME } }, 200, { "Set-Cookie": cookie(token, request) });
  }
  if (path === "/api/central/session" && request.method === "GET") {
    const authenticated = await validSession(request, env.CENTRAL_SESSION_SECRET, env.CENTRAL_ADMIN_USERNAME);
    return json({ user: authenticated ? { username: env.CENTRAL_ADMIN_USERNAME } : null });
  }
  if (path === "/api/central/session/logout" && request.method === "POST") {
    return json({ ok: true }, 200, { "Set-Cookie": cookie("", request, 0) });
  }
  if (!path.startsWith("/api/central/accounts")) return null;
  await requireAdmin(request, env);
  if (request.method === "GET") {
    const id = targetId(url.searchParams.get("appId"));
    return json(await callApplication(env, id, "GET"));
  }
  const body = await readJson(request);
  const id = targetId(body.appId);
  delete body.appId;
  return json(await callApplication(env, id, request.method, body), request.method === "POST" ? 201 : 200);
}

const worker = {
  async fetch(request: Request, env: Env) {
    try {
      const response = new URL(request.url).pathname.startsWith("/api/central/") ? await handleApi(request, env) : null;
      if (response) return withSecurityHeaders(response);
      return withSecurityHeaders(await env.ASSETS.fetch(request));
    } catch (error) {
      if (error instanceof ApiError) return withSecurityHeaders(json({ error: error.message }, error.status));
      console.error("Central API failure", error instanceof Error ? error.message : "Unknown error");
      return withSecurityHeaders(json({ error: "Serviço indisponível. Tente novamente." }, 503));
    }
  },
};

export default worker;

function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

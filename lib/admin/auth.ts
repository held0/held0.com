// Zugang zu /admin: Anmeldeseite /admin/login, danach signiertes Sitzungs-Cookie.
// Benutzer und Passwort legt Niklas selbst auf dem Server fest (~/held0-admin.auth, Inhalt „benutzer:passwort“);
// deploy.sh bzw. der Deploy-Button übergeben sie als ADMIN_AUTH. Ohne ADMIN_AUTH ist /admin gesperrt (503).
// Der Signaturschlüssel wird aus ADMIN_AUTH abgeleitet – ein Passwortwechsel macht alle Sitzungen ungültig.

export const COOKIE = "held0_admin";
export const SESSION_DAYS = 30;
export const LOGIN_PATH = "/admin/login";
export const PUBLIC_ADMIN_PATHS = new Set([LOGIN_PATH, "/admin/api/login"]);

export const isAdminPath = (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/");

export const UNCONFIGURED_TEXT =
  "Admin-Zugang ist noch nicht eingerichtet: Passwortdatei ~/held0-admin.auth auf dem Server anlegen und neu deployen.";

function configured(): string | null {
  const v = (process.env.ADMIN_AUTH ?? "").trim();
  const i = v.indexOf(":");
  return i > 0 && i < v.length - 1 ? v : null;
}
export const isConfigured = () => configured() !== null;

/** Vergleich mit gleicher Laufzeit, egal wo sich die Zeichenketten unterscheiden. */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function checkCredentials(user: string, password: string): boolean {
  const expected = configured();
  return !!expected && safeEqual(`${user}:${password}`, expected);
}

// ---------- Sitzung: "<ablauf>.<hmac>" ----------

const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(payload: string): Promise<string | null> {
  const secret = configured();
  if (!secret) return null;
  const keyBytes = await crypto.subtle.digest("SHA-256", enc.encode(`held0-admin-session\n${secret}`));
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, enc.encode(`v1.${payload}`)));
}

export async function createSession(now = Date.now()): Promise<{ value: string; maxAge: number } | null> {
  const maxAge = SESSION_DAYS * 86400;
  const exp = String(Math.floor(now / 1000) + maxAge);
  const sig = await sign(exp);
  return sig ? { value: `${exp}.${sig}`, maxAge } : null;
}

export async function verifySession(value: string | undefined | null, now = Date.now()): Promise<boolean> {
  if (!value) return false;
  const [exp, sig, extra] = value.split(".");
  if (!exp || !sig || extra !== undefined || !/^\d{1,12}$/.test(exp)) return false;
  if (Number(exp) * 1000 <= now) return false;
  const expected = await sign(exp);
  return !!expected && safeEqual(sig, expected);
}

export function cookieHeader(value: string, maxAge: number): string {
  return `${COOKIE}=${value}; Path=/admin; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

export function readCookie(header: string | null): string | undefined {
  for (const part of (header ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === COOKIE) return v.join("=");
  }
  return undefined;
}

// ---------- Fehlversuche: höchstens 10 je IP in 15 Minuten ----------

const failures = new Map<string, { count: number; since: number }>();
const WINDOW = 15 * 60 * 1000;
export function clientIp(headers: Headers) {
  return (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
}
export function isBlocked(ip: string) {
  const f = failures.get(ip);
  return !!f && Date.now() - f.since < WINDOW && f.count >= 10;
}
export function recordFailure(ip: string) {
  const f = failures.get(ip);
  if (!f || Date.now() - f.since >= WINDOW) failures.set(ip, { count: 1, since: Date.now() });
  else f.count++;
  if (failures.size > 5000) failures.clear();
}

/** Für Route-Handler (zusätzlich zur Prüfung in proxy.ts): null = erlaubt. */
export async function adminGuard(request: Request): Promise<Response | null> {
  if (!isConfigured()) return new Response(UNCONFIGURED_TEXT, { status: 503, headers: { "Cache-Control": "no-store" } });
  if (await verifySession(readCookie(request.headers.get("cookie")))) return null;
  return Response.json({ error: "Nicht angemeldet" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}

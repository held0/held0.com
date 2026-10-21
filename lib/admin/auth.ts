// Zugang zu /admin: HTTP Basic Auth. Benutzer und Passwort legt Niklas selbst auf dem Server fest
// (~/held0-admin.auth, Inhalt „benutzer:passwort“); deploy.sh bzw. der Deploy-Button übergeben sie als ADMIN_AUTH.
// Ohne ADMIN_AUTH ist /admin gesperrt (503).

export type AdminCheck = "ok" | "unconfigured" | "denied";

export const ADMIN_REALM = 'Basic realm="held0 admin", charset="UTF-8"';

export const isAdminPath = (pathname: string) => pathname === "/admin" || pathname.startsWith("/admin/");

function configured(): string | null {
  const v = (process.env.ADMIN_AUTH ?? "").trim();
  const i = v.indexOf(":");
  return i > 0 && i < v.length - 1 ? v : null;
}

/** Vergleich mit gleicher Laufzeit, egal wo sich die Zeichenketten unterscheiden. */
function safeEqual(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

function decode(header: string | null): string | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(header.slice(6).trim()), (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

export function checkAdmin(authorization: string | null): AdminCheck {
  const expected = configured();
  if (!expected) return "unconfigured";
  const given = decode(authorization);
  return given !== null && safeEqual(given, expected) ? "ok" : "denied";
}

export const UNCONFIGURED_TEXT =
  "Admin-Zugang ist noch nicht eingerichtet: Passwortdatei ~/held0-admin.auth auf dem Server anlegen und neu deployen.";

/** Antwort für Route-Handler, falls der Zugriff nicht erlaubt ist (zusätzlich zur Prüfung in proxy.ts). */
export function adminGuard(request: Request): Response | null {
  const r = checkAdmin(request.headers.get("authorization"));
  if (r === "ok") return null;
  if (r === "unconfigured") return new Response(UNCONFIGURED_TEXT, { status: 503, headers: { "Cache-Control": "no-store" } });
  return new Response("Passwort erforderlich", { status: 401, headers: { "WWW-Authenticate": ADMIN_REALM, "Cache-Control": "no-store" } });
}

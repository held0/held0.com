import { NextResponse, type NextRequest } from "next/server";
import { notFoundMarkdown } from "./app/agent-text";
import { ADMIN_REALM, UNCONFIGURED_TEXT, checkAdmin, isAdminPath } from "./lib/admin/auth";

// Nur in der Dev-Vorschau gesetzt (deploy.sh dev): Passwortschutz + kein Index.
const auth = process.env.BASIC_AUTH;

// Pfade, die es gibt – für alles andere bekommen Markdown-Anfragen eine Markdown-404.
const known = new Set(["/", "/impressum", "/llms.txt", "/index.md", "/robots.txt", "/sitemap.xml", "/icon.svg", "/favicon.ico"]);

function route(request: NextRequest, dev: boolean): NextResponse {
  const { pathname } = request.nextUrl;
  // Design-Varianten gibt es nur in der Dev-Vorschau
  if (pathname.startsWith("/varianten")) {
    if (!dev) return new NextResponse("Not found", { status: 404 });
    if (pathname === "/varianten") return NextResponse.rewrite(new URL("/varianten.html", request.url));
    return NextResponse.next();
  }
  const markdown = (request.headers.get("accept") ?? "").includes("text/markdown");
  if (pathname === "/") {
    // Browser bekommen HTML, Agenten mit Accept: text/markdown die Markdown-Fassung
    const res = markdown ? NextResponse.rewrite(new URL("/index.md", request.url)) : NextResponse.next();
    res.headers.set("Vary", "Accept");
    return res;
  }
  if (markdown && !known.has(pathname) && !pathname.startsWith("/_next/")) {
    return new NextResponse(notFoundMarkdown, {
      status: 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8", Vary: "Accept" },
    });
  }
  return NextResponse.next();
}

// Gegen Durchprobieren von Passwörtern: höchstens 10 Fehlversuche je IP in 15 Minuten.
const failures = new Map<string, { count: number; since: number }>();
const WINDOW = 15 * 60 * 1000;
function clientIp(request: NextRequest) {
  return (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "?";
}
function blocked(ip: string) {
  const f = failures.get(ip);
  return !!f && Date.now() - f.since < WINDOW && f.count >= 10;
}
function fail(ip: string) {
  const f = failures.get(ip);
  if (!f || Date.now() - f.since >= WINDOW) failures.set(ip, { count: 1, since: Date.now() });
  else f.count++;
  if (failures.size > 5000) failures.clear();
}

const privateHeaders = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };

// /admin (Seite und API): eigenes Admin-Passwort – auf held0.com und auf dev.held0.com.
function admin(request: NextRequest): NextResponse {
  const ip = clientIp(request);
  if (blocked(ip)) return new NextResponse("Zu viele Fehlversuche – bitte später erneut.", { status: 429, headers: privateHeaders });
  const result = checkAdmin(request.headers.get("authorization"));
  if (result === "unconfigured") return new NextResponse(UNCONFIGURED_TEXT, { status: 503, headers: privateHeaders });
  if (result === "denied") {
    const header = request.headers.get("authorization");
    // Das dev-Passwort schickt der Browser auf dev.held0.com von selbst mit – kein Fehlversuch
    if (header && !(auth && header === `Basic ${btoa(auth)}`)) fail(ip);
    return new NextResponse("Passwort erforderlich", { status: 401, headers: { ...privateHeaders, "WWW-Authenticate": ADMIN_REALM } });
  }
  const res = NextResponse.next();
  for (const [k, v] of Object.entries(privateHeaders)) res.headers.set(k, v);
  return res;
}

export default function proxy(request: NextRequest) {
  if (isAdminPath(request.nextUrl.pathname)) return admin(request);
  if (!auth) return route(request, false);

  // Auf dev genügt auch das Admin-Passwort (der Browser schickt nach /admin teils dieses mit).
  const header = request.headers.get("authorization") ?? "";
  if (header !== `Basic ${btoa(auth)}` && checkAdmin(header) !== "ok") {
    return new NextResponse("Passwort erforderlich", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="held0 dev"', "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  const res = route(request, true);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: "/((?!up$).*)",
};

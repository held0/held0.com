import { NextResponse, type NextRequest } from "next/server";
import { notFoundMarkdown } from "./app/agent-text";
import { COOKIE, LOGIN_PATH, PUBLIC_ADMIN_PATHS, UNCONFIGURED_TEXT, isAdminPath, isConfigured, verifySession } from "./lib/admin/auth";

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

const privateHeaders = { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" };
const withPrivate = (res: NextResponse) => {
  for (const [k, v] of Object.entries(privateHeaders)) res.headers.set(k, v);
  return res;
};

// Weiterleitung mit dem Schema, das der Browser sieht (hinter kamal-proxy: X-Forwarded-Proto)
function redirect(request: NextRequest, to: string) {
  const proto = (request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")).split(",")[0].trim();
  const host = request.headers.get("host") ?? request.nextUrl.host;
  return new NextResponse(null, { status: 303, headers: { ...privateHeaders, Location: `${proto}://${host}${to}` } });
}

// /admin (Seiten und API): Anmeldung per Formular (/admin/login) + Sitzungs-Cookie – auf held0.com und dev.held0.com,
// dort ohne das dev-Passwort davor.
async function admin(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (!isConfigured()) return new NextResponse(UNCONFIGURED_TEXT, { status: 503, headers: privateHeaders });
  const loggedIn = await verifySession(request.cookies.get(COOKIE)?.value);
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    if (loggedIn && pathname === LOGIN_PATH) return redirect(request, "/admin");
    return withPrivate(NextResponse.next());
  }
  if (loggedIn) return withPrivate(NextResponse.next());
  if (pathname.startsWith("/admin/api/")) {
    return withPrivate(NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 }));
  }
  return redirect(request, LOGIN_PATH);
}

// Auf dev ohne dev-Passwort erreichbar: gebaute Dateien (Hash-Namen, keine Daten) – die braucht die Admin-Anmeldeseite.
const devPublic = (pathname: string) => pathname.startsWith("/_next/static/") || pathname === "/icon.svg" || pathname === "/favicon.ico";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isAdminPath(pathname)) return admin(request);
  if (!auth) return route(request, false);
  if (devPublic(pathname)) return NextResponse.next();

  if ((request.headers.get("authorization") ?? "") !== `Basic ${btoa(auth)}`) {
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

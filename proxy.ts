import { NextResponse, type NextRequest } from "next/server";
import { notFoundMarkdown } from "./app/agent-text";

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

export default function proxy(request: NextRequest) {
  if (!auth) return route(request, false);

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

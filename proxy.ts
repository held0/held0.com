import { NextResponse, type NextRequest } from "next/server";

// Nur in der Dev-Vorschau gesetzt (deploy.sh dev): Passwortschutz + kein Index.
const auth = process.env.BASIC_AUTH;

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Design-Varianten gibt es nur in der Dev-Vorschau
  const varianten = pathname.startsWith("/varianten");
  if (!auth) return varianten ? new NextResponse("Not found", { status: 404 }) : NextResponse.next();

  if ((request.headers.get("authorization") ?? "") !== `Basic ${btoa(auth)}`) {
    return new NextResponse("Passwort erforderlich", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="held0 dev"', "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  const res =
    pathname === "/varianten"
      ? NextResponse.rewrite(new URL("/varianten.html", request.url))
      : NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: "/((?!up$).*)",
};

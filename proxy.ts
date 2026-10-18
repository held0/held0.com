import { NextResponse, type NextRequest } from "next/server";

// Nur in der Dev-Vorschau gesetzt (deploy.sh dev): Passwortschutz + kein Index.
const auth = process.env.BASIC_AUTH;

export default function proxy(request: NextRequest) {
  if (!auth) return NextResponse.next();
  const header = request.headers.get("authorization") ?? "";
  if (header === `Basic ${btoa(auth)}`) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return new NextResponse("Passwort erforderlich", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="held0 dev"', "X-Robots-Tag": "noindex, nofollow" },
  });
}

export const config = {
  matcher: "/((?!up$).*)",
};

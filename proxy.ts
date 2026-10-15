import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Temporär: Seite offline, alles außer Impressum/Datenschutz zeigt "Coming soon".
// Zum Reaktivieren auf false setzen.
const COMING_SOON = true;
const ALLOWED = /^\/(en\/)?(impressum|datenschutz)\/?$/;

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (COMING_SOON && !ALLOWED.test(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL("/coming-soon.html", request.url));
  }
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|up|_next|_vercel|.*\\..*).*)",
};

import {
  checkCredentials, clientIp, cookieHeader, createSession, isBlocked, isConfigured, recordFailure, UNCONFIGURED_TEXT,
} from "../../../../lib/admin/auth";

export const dynamic = "force-dynamic";

// relative Weiterleitung (hinter kamal-proxy kennt die App das https-Schema nicht sicher)
const go = (to: string, cookie?: string) =>
  new Response(null, {
    status: 303,
    headers: { Location: to, "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) },
  });

export async function POST(request: Request) {
  if (!isConfigured()) return new Response(UNCONFIGURED_TEXT, { status: 503 });
  const ip = clientIp(request.headers);
  if (isBlocked(ip)) return go("/admin/login?hinweis=sperre");
  const form = await request.formData().catch(() => null);
  const user = String(form?.get("user") ?? "");
  const password = String(form?.get("password") ?? "");
  if (!checkCredentials(user, password)) {
    recordFailure(ip);
    return go(isBlocked(ip) ? "/admin/login?hinweis=sperre" : "/admin/login?hinweis=falsch");
  }
  const session = await createSession();
  return go("/admin", cookieHeader(session!.value, session!.maxAge));
}

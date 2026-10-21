import { cookieHeader } from "../../../../lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(null, {
    status: 303,
    headers: { Location: "/admin/login?hinweis=ab", "Set-Cookie": cookieHeader("", 0), "Cache-Control": "no-store" },
  });
}

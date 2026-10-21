import { adminGuard } from "../../../../lib/admin/auth";
import { importAbos, listAbos } from "../../../../lib/admin/store";
import { todayBerlin } from "../../../../lib/admin/calc";

export const dynamic = "force-dynamic";

// Sicherung als JSON (z. B. um den dev-Stand nach live zu übernehmen) …
export async function GET(request: Request) {
  const denied = adminGuard(request);
  if (denied) return denied;
  return new Response(JSON.stringify({ version: 1, items: await listAbos() }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="abos-${todayBerlin()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

// … und wieder einlesen: gleiche id → ersetzt, sonst neu.
export async function POST(request: Request) {
  const denied = adminGuard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
  if (!items) return Response.json({ error: "Erwartet: JSON mit items: [...]" }, { status: 400 });
  return Response.json(await importAbos(items), { headers: { "Cache-Control": "no-store" } });
}

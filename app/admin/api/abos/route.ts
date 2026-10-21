import { adminGuard } from "../../../../lib/admin/auth";
import { createAbo, listAbos } from "../../../../lib/admin/store";

export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const denied = adminGuard(request);
  if (denied) return denied;
  return Response.json({ items: await listAbos() }, { headers: noStore });
}

export async function POST(request: Request) {
  const denied = adminGuard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Ungültige Daten" }, { status: 400 });
  return Response.json(await createAbo(body), { status: 201, headers: noStore });
}

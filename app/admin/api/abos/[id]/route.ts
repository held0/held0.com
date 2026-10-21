import { adminGuard } from "../../../../../lib/admin/auth";
import { deleteAbo, updateAbo } from "../../../../../lib/admin/store";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const denied = adminGuard(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return Response.json({ error: "Ungültige Daten" }, { status: 400 });
  const abo = await updateAbo((await params).id, body);
  return abo ? Response.json(abo) : Response.json({ error: "Nicht gefunden" }, { status: 404 });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const denied = adminGuard(request);
  if (denied) return denied;
  return (await deleteAbo((await params).id))
    ? new Response(null, { status: 204 })
    : Response.json({ error: "Nicht gefunden" }, { status: 404 });
}

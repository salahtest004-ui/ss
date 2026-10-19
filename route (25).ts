import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { wilayas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getWilayas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ wilayas: await getWilayas() });
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const body = await request.json();
  const updates: Array<{ id: number; homeFee?: number; deskFee?: number; active?: boolean }> =
    Array.isArray(body.updates) ? body.updates : [body];

  for (const u of updates) {
    const patch: Record<string, unknown> = {};
    if (u.homeFee !== undefined) patch.homeFee = Number(u.homeFee);
    if (u.deskFee !== undefined) patch.deskFee = Number(u.deskFee);
    if (u.active !== undefined) patch.active = Boolean(u.active);
    if (Object.keys(patch).length === 0) continue;
    await db.update(wilayas).set(patch).where(eq(wilayas.id, Number(u.id)));
  }

  return Response.json({ ok: true, wilayas: await getWilayas() });
}

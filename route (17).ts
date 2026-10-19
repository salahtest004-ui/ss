import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.slug !== undefined) patch.slug = slugify(String(body.slug));
  if (body.description !== undefined) patch.description = String(body.description);
  if (body.image !== undefined) patch.image = String(body.image);
  if (body.active !== undefined) patch.active = Boolean(body.active);
  const [updated] = await db
    .update(categories)
    .set(patch)
    .where(eq(categories.id, Number(id)))
    .returning();
  return Response.json({ category: updated });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(categories).where(eq(categories.id, Number(id)));
  return Response.json({ ok: true });
}

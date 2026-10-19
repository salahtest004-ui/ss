import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const [product] = await db.select().from(products).where(eq(products.id, Number(id))).limit(1);
  if (!product) return Response.json({ error: "غير موجود" }, { status: 404 });
  return Response.json({ product });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await request.json();
    const patch: Record<string, unknown> = {};
    if (body.name !== undefined) patch.name = String(body.name);
    if (body.slug !== undefined) patch.slug = slugify(String(body.slug));
    if (body.description !== undefined) patch.description = String(body.description);
    if (body.price !== undefined) patch.price = String(Number(body.price));
    if (body.oldPrice !== undefined)
      patch.oldPrice = body.oldPrice ? String(Number(body.oldPrice)) : null;
    if (body.stock !== undefined) patch.stock = Number(body.stock);
    if (body.images !== undefined) {
      patch.images = Array.isArray(body.images)
        ? body.images.map((i: unknown) => String(i)).filter(Boolean)
        : String(body.images)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
    }
    if (body.categoryId !== undefined)
      patch.categoryId = body.categoryId ? Number(body.categoryId) : null;
    if (body.featured !== undefined) patch.featured = Boolean(body.featured);
    if (body.active !== undefined) patch.active = Boolean(body.active);
    if (body.rating !== undefined) patch.rating = String(body.rating);

    const [updated] = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, Number(id)))
      .returning();
    return Response.json({ product: updated });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "تعذر تحديث المنتج" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));
  return Response.json({ ok: true });
}

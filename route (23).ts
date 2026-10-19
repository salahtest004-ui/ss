import { NextRequest } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getProducts } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const items = await getProducts({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    limit: Number(searchParams.get("limit") ?? 60),
  });
  return Response.json({ products: items });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "اسم المنتج مطلوب" }, { status: 400 });

    const images = Array.isArray(body.images)
      ? body.images.map((i: unknown) => String(i)).filter(Boolean)
      : String(body.images ?? "")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

    const [created] = await db
      .insert(products)
      .values({
        name,
        slug: body.slug ? slugify(String(body.slug)) : `${slugify(name)}-${Date.now() % 10000}`,
        description: String(body.description ?? ""),
        price: String(Number(body.price ?? 0)),
        oldPrice: body.oldPrice ? String(Number(body.oldPrice)) : null,
        stock: Number(body.stock ?? 0),
        images,
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        featured: Boolean(body.featured),
        active: body.active === undefined ? true : Boolean(body.active),
        rating: String(body.rating ?? "4.5"),
      })
      .returning();

    return Response.json({ product: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "تعذر إنشاء المنتج" }, { status: 500 });
  }
}

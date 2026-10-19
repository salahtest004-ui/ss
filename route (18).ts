import { NextRequest } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getCategories } from "@/lib/queries";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ categories: await getCategories() });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) return Response.json({ error: "اسم التصنيف مطلوب" }, { status: 400 });
    const [created] = await db
      .insert(categories)
      .values({
        name,
        slug: body.slug ? slugify(String(body.slug)) : `${slugify(name)}-${Date.now() % 10000}`,
        description: String(body.description ?? ""),
        image: String(body.image ?? ""),
        active: body.active === undefined ? true : Boolean(body.active),
      })
      .returning();
    return Response.json({ category: created }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "تعذر إنشاء التصنيف" }, { status: 500 });
  }
}

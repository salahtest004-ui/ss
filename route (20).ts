import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
  if (!order) return Response.json({ error: "الطلب غير موجود" }, { status: 404 });
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return Response.json({ order, items });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const allowed = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string" && allowed.includes(body.status)) patch.status = body.status;
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (typeof body.customerName === "string") patch.customerName = body.customerName;
  if (typeof body.phone === "string") patch.phone = body.phone;
  if (typeof body.address === "string") patch.address = body.address;
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "لا توجد بيانات للتحديث" }, { status: 400 });
  }
  const [updated] = await db
    .update(orders)
    .set(patch)
    .where(eq(orders.id, Number(id)))
    .returning();
  return Response.json({ order: updated });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const { id } = await params;
  await db.delete(orders).where(eq(orders.id, Number(id)));
  return Response.json({ ok: true });
}

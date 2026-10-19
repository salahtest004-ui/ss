import { and, desc, eq, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { orderItems, orders, products, settings, wilayas } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { orderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

type IncomingItem = { productId: number; quantity: number };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return Response.json({ error: "السلة فارغة" }, { status: 400 });
    }
    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\s/g, "");
    const wilayaCode = Number(body.wilayaCode);
    const deliveryType = body.deliveryType === "desk" ? "desk" : "home";

    if (customerName.length < 3) {
      return Response.json({ error: "يرجى إدخال الاسم الكامل" }, { status: 400 });
    }
    if (!/^0[5-7][0-9]{8}$/.test(phone)) {
      return Response.json({ error: "رقم الهاتف غير صحيح" }, { status: 400 });
    }

    const [wilaya] = await db.select().from(wilayas).where(eq(wilayas.code, wilayaCode)).limit(1);
    if (!wilaya) {
      return Response.json({ error: "الولاية غير متوفرة" }, { status: 400 });
    }

    const ids = items.map((i) => Number(i.productId)).filter((n) => Number.isFinite(n));
    const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
    if (dbProducts.length === 0) {
      return Response.json({ error: "المنتجات غير متوفرة" }, { status: 400 });
    }

    const lines = items
      .map((i) => {
        const product = dbProducts.find((p) => p.id === Number(i.productId));
        if (!product || !product.active) return null;
        const quantity = Math.max(1, Math.min(Number(i.quantity) || 1, 99));
        return {
          product,
          quantity,
          price: Math.round(Number(product.price)),
        };
      })
      .filter((l): l is { product: typeof dbProducts[number]; quantity: number; price: number } =>
        Boolean(l),
      );

    if (lines.length === 0) {
      return Response.json({ error: "المنتجات غير متوفرة" }, { status: 400 });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

    const settingRows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "free_shipping_threshold"));
    const threshold = Number(settingRows[0]?.value ?? 0);
    const baseFee = deliveryType === "desk" ? wilaya.deskFee : wilaya.homeFee;
    const shippingFee = threshold > 0 && subtotal >= threshold ? 0 : baseFee;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: orderNumber(),
        customerName,
        phone,
        wilayaCode: wilaya.code,
        wilayaName: wilaya.name,
        commune: String(body.commune ?? "").trim(),
        address: String(body.address ?? "").trim(),
        deliveryType,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        status: "pending",
        notes: String(body.notes ?? "").trim(),
      })
      .returning();

    await db.insert(orderItems).values(
      lines.map((l) => ({
        orderId: order.id,
        productId: l.product.id,
        productName: l.product.name,
        image: l.product.images?.[0] ?? "",
        price: l.price,
        quantity: l.quantity,
      })),
    );

    for (const line of lines) {
      await db
        .update(products)
        .set({
          stock: sql`greatest(${products.stock} - ${line.quantity}, 0)`,
          sold: sql`${products.sold} + ${line.quantity}`,
        })
        .where(eq(products.id, line.product.id));
    }

    return Response.json({ ok: true, orderNumber: order.orderNumber, id: order.id });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "تعذر إنشاء الطلب" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "غير مصرح" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const conditions: SQL[] = [];
  if (status && status !== "all") conditions.push(eq(orders.status, status));
  if (search) {
    const term = `%${search}%`;
    const cond = or(
      ilike(orders.customerName, term),
      ilike(orders.phone, term),
      ilike(orders.orderNumber, term),
    );
    if (cond) conditions.push(cond);
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  return Response.json({ orders: rows });
}

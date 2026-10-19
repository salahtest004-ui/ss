import { and, asc, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  categories,
  orderItems,
  orders,
  products,
  settings,
  wilayas,
  type Category,
  type Product,
} from "@/db/schema";
import { DEFAULT_SETTINGS, ensureSeed } from "@/lib/seed";

export type StoreSettings = Record<string, string>;

export async function getSettings(): Promise<StoreSettings> {
  await ensureSeed();
  const rows = await db.select().from(settings);
  const map: StoreSettings = { ...DEFAULT_SETTINGS };
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export async function getCategories(): Promise<Category[]> {
  await ensureSeed();
  return db.select().from(categories).orderBy(asc(categories.id));
}

export type ProductFilters = {
  search?: string;
  category?: string;
  sort?: string;
  min?: number;
  max?: number;
  featured?: boolean;
  limit?: number;
};

export type ProductWithCategory = Product & { categoryName: string | null };

export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithCategory[]> {
  await ensureSeed();
  const conditions: SQL[] = [eq(products.active, true)];

  if (filters.search) {
    const term = `%${filters.search}%`;
    const cond = or(ilike(products.name, term), ilike(products.description, term));
    if (cond) conditions.push(cond);
  }
  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }
  if (filters.featured) conditions.push(eq(products.featured, true));
  if (typeof filters.min === "number") conditions.push(gte(products.price, String(filters.min)));
  if (typeof filters.max === "number") conditions.push(lte(products.price, String(filters.max)));

  const orderBy =
    filters.sort === "price_asc"
      ? asc(products.price)
      : filters.sort === "price_desc"
        ? desc(products.price)
        : filters.sort === "popular"
          ? desc(products.sold)
          : desc(products.createdAt);

  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 60);

  return rows.map((r) => ({ ...r.product, categoryName: r.categoryName }));
}

export async function getProductBySlug(slug: string): Promise<ProductWithCategory | null> {
  await ensureSeed();
  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? { ...row.product, categoryName: row.categoryName } : null;
}

export async function getRelatedProducts(
  categoryId: number | null,
  excludeId: number,
): Promise<Product[]> {
  if (!categoryId) return [];
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.active, true),
        sql`${products.id} <> ${excludeId}`,
      ),
    )
    .limit(4);
}

export async function getWilayas() {
  await ensureSeed();
  return db.select().from(wilayas).orderBy(asc(wilayas.code));
}

export async function getOrderByNumber(num: string) {
  const rows = await db.select().from(orders).where(eq(orders.orderNumber, num)).limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function getDashboardStats() {
  await ensureSeed();
  const [totals] = await db
    .select({
      orderCount: sql<number>`count(*)::int`,
      revenue: sql<number>`coalesce(sum(case when ${orders.status} <> 'cancelled' then ${orders.total} else 0 end), 0)::int`,
      pending: sql<number>`coalesce(sum(case when ${orders.status} = 'pending' then 1 else 0 end), 0)::int`,
      delivered: sql<number>`coalesce(sum(case when ${orders.status} = 'delivered' then 1 else 0 end), 0)::int`,
    })
    .from(orders);

  const [productTotals] = await db
    .select({
      productCount: sql<number>`count(*)::int`,
      lowStock: sql<number>`coalesce(sum(case when ${products.stock} <= 5 then 1 else 0 end), 0)::int`,
    })
    .from(products);

  const [categoryTotals] = await db
    .select({ categoryCount: sql<number>`count(*)::int` })
    .from(categories);

  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(6);

  const topProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sold: products.sold,
      stock: products.stock,
      price: products.price,
      images: products.images,
    })
    .from(products)
    .orderBy(desc(products.sold))
    .limit(5);

  const salesByDay = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.createdAt}), 'YYYY-MM-DD')`,
      total: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(sql`${orders.createdAt} > now() - interval '14 days'`)
    .groupBy(sql`date_trunc('day', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('day', ${orders.createdAt})`);

  const byWilaya = await db
    .select({
      name: orders.wilayaName,
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
    })
    .from(orders)
    .groupBy(orders.wilayaName)
    .orderBy(sql`count(*) desc`)
    .limit(6);

  return {
    orderCount: totals?.orderCount ?? 0,
    revenue: totals?.revenue ?? 0,
    pending: totals?.pending ?? 0,
    delivered: totals?.delivered ?? 0,
    productCount: productTotals?.productCount ?? 0,
    lowStock: productTotals?.lowStock ?? 0,
    categoryCount: categoryTotals?.categoryCount ?? 0,
    recentOrders,
    topProducts,
    salesByDay,
    byWilaya,
  };
}

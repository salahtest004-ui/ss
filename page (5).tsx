import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  search?: string;
  category?: string;
  sort?: string;
  min?: string;
  max?: string;
}>;

const SORTS = [
  { value: "newest", label: "الأحدث" },
  { value: "popular", label: "الأكثر مبيعاً" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
];

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const [categories, items] = await Promise.all([
    getCategories(),
    getProducts({
      search: sp.search,
      category: sp.category,
      sort: sp.sort,
      min: sp.min ? Number(sp.min) : undefined,
      max: sp.max ? Number(sp.max) : undefined,
      limit: 60,
    }),
  ]);

  const activeCat = categories.find((c) => c.slug === sp.category);

  const buildHref = (patch: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...sp, ...patch };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, String(v));
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">
          الرئيسية
        </Link>{" "}
        / <span className="font-bold text-slate-700">{activeCat?.name ?? "كل المنتجات"}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="mb-3 font-extrabold text-slate-800">التصنيفات</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildHref({ category: undefined })}
                  className={`block rounded-lg px-3 py-2 ${!sp.category ? "bg-emerald-700 font-bold text-white" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  كل المنتجات
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug })}
                    className={`block rounded-lg px-3 py-2 ${sp.category === c.slug ? "bg-emerald-700 font-bold text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-extrabold text-slate-800">نطاق السعر</h3>
            <form className="flex flex-col gap-2 text-sm" action="/products">
              {sp.category && <input type="hidden" name="category" value={sp.category} />}
              {sp.search && <input type="hidden" name="search" value={sp.search} />}
              <div className="flex gap-2">
                <input
                  name="min"
                  type="number"
                  defaultValue={sp.min}
                  placeholder="من"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
                <input
                  name="max"
                  type="number"
                  defaultValue={sp.max}
                  placeholder="إلى"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </div>
              <button className="rounded-lg bg-slate-900 py-2 font-bold text-white">تطبيق</button>
            </form>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              <span className="font-extrabold text-slate-900">{items.length}</span> منتج
              {sp.search ? ` لنتيجة البحث: «${sp.search}»` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <Link
                  key={s.value}
                  href={buildHref({ sort: s.value })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                    (sp.sort ?? "newest") === s.value
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-3 font-bold text-slate-700">لا توجد منتجات مطابقة</p>
              <Link href="/products" className="mt-3 inline-block text-sm font-bold text-emerald-700">
                عرض كل المنتجات
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

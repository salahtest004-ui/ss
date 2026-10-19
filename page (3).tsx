import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: "🚚", title: "توصيل لكل الولايات", text: "58 ولاية، للمنزل أو لمكتب التوصيل" },
  { icon: "💵", title: "الدفع عند الاستلام", text: "ادفع فقط عندما تستلم طلبك" },
  { icon: "✅", title: "منتجات أصلية", text: "جودة مضمونة ومنتجات جزائرية مختارة" },
  { icon: "🔄", title: "استبدال سهل", text: "إمكانية الاستبدال خلال 7 أيام" },
];

export default async function HomePage() {
  const [settings, categories, featured, newest, popular] = await Promise.all([
    getSettings(),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ sort: "newest", limit: 8 }),
    getProducts({ sort: "popular", limit: 4 }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero.jpg"
          alt="سوق جزائري"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="relative grid gap-6 p-8 sm:p-14 lg:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-block rounded-full bg-amber-500/90 px-4 py-1 text-xs font-bold">
              🇩🇿 صنع في الجزائر
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-5xl">
              {settings.store_name}
              <br />
              <span className="text-amber-400">{settings.store_tagline}</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm text-emerald-100 sm:text-base">
              تسوق أزياء تقليدية، عطور، عسل جبلي، صناعات حرفية وإلكترونيات بأسعار مناسبة. الدفع عند
              الاستلام وتوصيل سريع إلى كامل الولايات.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow transition hover:bg-amber-600"
              >
                ابدأ التسوق
              </Link>
              <Link
                href="/track"
                className="rounded-xl border border-white/40 px-6 py-3 font-bold transition hover:bg-white/10"
              >
                تتبع طلبيتي
              </Link>
            </div>
          </div>
          <div className="hidden items-end justify-end lg:flex">
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <p className="text-sm text-emerald-100">شحن مجاني للطلبات فوق</p>
              <p className="text-4xl font-extrabold text-amber-400">
                {Number(settings.free_shipping_threshold).toLocaleString("fr-DZ")} دج
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span className="text-2xl">{f.icon}</span>
            <div>
              <p className="text-sm font-bold text-slate-800">{f.title}</p>
              <p className="text-xs text-slate-500">{f.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-800">تسوق حسب التصنيف</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories
            .filter((c) => c.active)
            .map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group relative h-36 overflow-hidden rounded-2xl shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 to-transparent" />
                <span className="absolute bottom-3 right-3 text-sm font-bold text-white">
                  {c.name}
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-800">⭐ منتجات مميزة</h2>
          <Link href="/products" className="text-sm font-bold text-emerald-700 hover:underline">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="mt-12 grid gap-4 rounded-3xl bg-gradient-to-l from-amber-500 to-amber-400 p-8 text-white sm:grid-cols-[2fr_1fr] sm:items-center">
        <div>
          <h3 className="text-2xl font-extrabold">عروض الأسبوع 🎉</h3>
          <p className="mt-2 text-sm text-amber-50">
            تخفيضات تصل إلى 30% على مجموعة مختارة من المنتجات التقليدية والعطور.
          </p>
        </div>
        <Link
          href="/products?sort=price_asc"
          className="justify-self-start rounded-xl bg-white px-6 py-3 font-bold text-amber-700 shadow sm:justify-self-end"
        >
          اكتشف العروض
        </Link>
      </section>

      {/* Popular */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-800">🔥 الأكثر مبيعاً</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {popular.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Newest */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-800">🆕 وصل حديثاً</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {newest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

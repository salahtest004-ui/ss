import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductDetailActions from "@/components/ProductDetailActions";
import ProductGallery from "@/components/ProductGallery";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatDZD } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || !product.active) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);
  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">
          الرئيسية
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:text-emerald-700">
          المنتجات
        </Link>{" "}
        / <span className="font-bold text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="space-y-4">
          {product.categoryName && (
            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              {product.categoryName}
            </span>
          )}
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{product.name}</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-500">⭐ {Number(product.rating).toFixed(1)}</span>
            <span className="text-slate-400">| {product.sold} عملية بيع</span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-emerald-800">{formatDZD(price)}</span>
            {oldPrice && oldPrice > price && (
              <>
                <span className="text-lg text-slate-400 line-through">{formatDZD(oldPrice)}</span>
                <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-bold text-rose-700">
                  وفر {discount}%
                </span>
              </>
            )}
          </div>

          <p className="leading-relaxed text-slate-600">{product.description}</p>

          <ProductDetailActions
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              price,
              image: product.images?.[0] ?? "",
              stock: product.stock,
            }}
          />

          <ul className="grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-2">
            <li>🚚 توصيل إلى 58 ولاية</li>
            <li>💵 الدفع عند الاستلام</li>
            <li>🔄 استبدال خلال 7 أيام</li>
            <li>📞 دعم عبر الهاتف والواتساب</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-800">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={{ ...p, categoryName: product.categoryName }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

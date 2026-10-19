"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatDZD } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, setQuantity, remove, clear, ready } = useCart();

  if (ready && items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-800">سلتك فارغة</h1>
        <p className="mt-2 text-slate-500">أضف بعض المنتجات الجميلة وابدأ التسوق الآن.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-xl bg-emerald-700 px-8 py-3 font-bold text-white"
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-800">سلة المشتريات</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Link href={`/product/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                )}
              </Link>
              <div className="flex flex-1 flex-col gap-2">
                <Link href={`/product/${item.slug}`} className="font-bold text-slate-800 hover:text-emerald-700">
                  {item.name}
                </Link>
                <span className="text-sm font-extrabold text-emerald-800">
                  {formatDZD(item.price)}
                </span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center overflow-hidden rounded-lg border border-slate-200">
                    <button
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 font-bold text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    🗑 حذف
                  </button>
                </div>
              </div>
              <div className="hidden w-28 text-left font-extrabold text-slate-800 sm:block">
                {formatDZD(item.price * item.quantity)}
              </div>
            </div>
          ))}
          <button onClick={clear} className="text-xs font-bold text-slate-500 hover:text-rose-600">
            إفراغ السلة
          </button>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-extrabold text-slate-800">ملخص الطلب</h2>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">المجموع الفرعي</span>
            <span className="font-bold">{formatDZD(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">التوصيل</span>
            <span className="text-slate-500">يُحسب عند إتمام الطلب</span>
          </div>
          <div className="border-t border-slate-100 pt-3 text-lg font-extrabold text-emerald-800">
            <div className="flex justify-between">
              <span>الإجمالي</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block rounded-xl bg-amber-500 py-3 text-center font-bold text-white shadow transition hover:bg-amber-600"
          >
            إتمام الطلب
          </Link>
          <Link href="/products" className="block text-center text-xs font-bold text-emerald-700">
            متابعة التسوق
          </Link>
        </aside>
      </div>
    </div>
  );
}

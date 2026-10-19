"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useCart } from "@/components/CartProvider";

type NavCategory = { name: string; slug: string };

function SearchBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("search") ?? "");

  return (
    <form
      className={`flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value.trim() ? `/products?search=${encodeURIComponent(value.trim())}` : "/products");
      }}
    >
      <span className="text-slate-400">🔍</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ابحث عن منتج، عطر، قفطان..."
        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="rounded-full bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800"
      >
        بحث
      </button>
    </form>
  );
}

export default function Header({
  storeName,
  announcement,
  categories,
  phone,
}: {
  storeName: string;
  announcement: string;
  categories: NavCategory[];
  phone: string;
}) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-emerald-800 px-4 py-2 text-center text-xs font-semibold text-emerald-50 sm:text-sm">
        {announcement}
      </div>
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-lg text-white shadow">
              🛍️
            </span>
            <span className="hidden text-lg font-extrabold text-emerald-900 sm:block">
              {storeName}
            </span>
          </Link>

          <div className="hidden flex-1 md:block">
            <Suspense fallback={<div className="h-10" />}>
              <SearchBox />
            </Suspense>
          </div>

          <div className="mr-auto flex items-center gap-2">
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 lg:flex"
            >
              📞 {phone}
            </a>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-bold text-white shadow transition hover:bg-amber-600"
            >
              🛒 <span className="hidden sm:inline">السلة</span>
              {count > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-900 px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:hidden"
              aria-label="القائمة"
            >
              ☰
            </button>
          </div>
        </div>

        <nav className="mx-auto hidden max-w-7xl items-center gap-5 px-4 pb-3 text-sm font-semibold text-slate-600 md:flex">
          <Link href="/" className="transition hover:text-emerald-700">
            الرئيسية
          </Link>
          <Link href="/products" className="transition hover:text-emerald-700">
            كل المنتجات
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="transition hover:text-emerald-700"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/admin"
            className="mr-auto rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white transition hover:bg-slate-700"
          >
            لوحة التحكم
          </Link>
        </nav>

        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <Suspense fallback={<div className="h-10" />}>
              <SearchBox className="mb-3" />
            </Suspense>
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-slate-700">
              <Link href="/products" onClick={() => setOpen(false)} className="rounded-lg bg-slate-50 px-3 py-2">
                كل المنتجات
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-slate-50 px-3 py-2"
                >
                  {c.name}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-white"
              >
                لوحة التحكم
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

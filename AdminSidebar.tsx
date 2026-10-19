"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/admin", label: "نظرة عامة", icon: "📊" },
  { href: "/admin/orders", label: "الطلبات", icon: "🧾" },
  { href: "/admin/products", label: "المنتجات", icon: "📦" },
  { href: "/admin/categories", label: "التصنيفات", icon: "🗂️" },
  { href: "/admin/shipping", label: "أسعار التوصيل", icon: "🚚" },
  { href: "/admin/settings", label: "إعدادات المتجر", icon: "⚙️" },
];

export default function AdminSidebar({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="space-y-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
              active ? "bg-emerald-600 text-white shadow" : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white lg:hidden">
        <span className="font-extrabold">{storeName} — الإدارة</span>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg bg-slate-800 px-3 py-1">
          ☰
        </button>
      </div>
      {open && <div className="bg-slate-900 px-4 pb-4 lg:hidden">{nav}</div>}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-slate-900 p-4 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg">
            🛍️
          </span>
          <div>
            <p className="text-sm font-extrabold">{storeName}</p>
            <p className="text-[11px] text-slate-400">لوحة التحكم</p>
          </div>
        </Link>
        {nav}
        <div className="mt-auto space-y-2">
          <Link
            href="/"
            className="block rounded-xl bg-slate-800 px-4 py-2 text-center text-xs font-bold text-slate-200"
          >
            🏠 عرض المتجر
          </Link>
          <button
            onClick={logout}
            className="w-full rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

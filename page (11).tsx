"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDZD } from "@/lib/utils";

type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string | null;
  stock: number;
  images: string[];
  categoryId: number | null;
  categoryName: string | null;
  featured: boolean;
  active: boolean;
  sold: number;
};

type Category = { id: number; name: string };

const emptyForm = {
  id: 0,
  name: "",
  slug: "",
  description: "",
  price: "",
  oldPrice: "",
  stock: "0",
  images: "",
  categoryId: "",
  featured: false,
  active: true,
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setItems(p.products ?? []);
    setCategories(c.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setForm({ ...emptyForm });
    setShowForm(true);
    setError("");
  }

  function openEdit(p: AdminProduct) {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      oldPrice: p.oldPrice ?? "",
      stock: String(p.stock),
      images: (p.images ?? []).join("\n"),
      categoryId: p.categoryId ? String(p.categoryId) : "",
      featured: p.featured,
      active: p.active,
    });
    setShowForm(true);
    setError("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      slug: form.slug || form.name,
      description: form.description,
      price: Number(form.price || 0),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      stock: Number(form.stock || 0),
      images: form.images,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      featured: form.featured,
      active: form.active,
    };
    const res = await fetch(form.id ? `/api/products/${form.id}` : "/api/products", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "تعذر الحفظ");
      return;
    }
    setShowForm(false);
    await load();
  }

  async function remove(id: number) {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await load();
  }

  async function toggle(p: AdminProduct, key: "active" | "featured") {
    await fetch(`/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: !p[key] }),
    });
    await load();
  }

  const filtered = items.filter((p) => p.name.includes(search) || p.slug.includes(search));
  const input = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">إدارة المنتجات</h1>
          <p className="text-sm text-slate-500">{items.length} منتج في المتجر</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
          <button
            onClick={openNew}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white"
          >
            + منتج جديد
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <h2 className="font-extrabold text-slate-800 md:col-span-2">
            {form.id ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">اسم المنتج *</label>
            <input
              required
              className={input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">الرابط (slug)</label>
            <input
              className={input}
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="يُولَّد تلقائياً"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">السعر (دج) *</label>
            <input
              required
              type="number"
              className={input}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">السعر القديم</label>
            <input
              type="number"
              className={input}
              value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">المخزون</label>
            <input
              type="number"
              className={input}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">التصنيف</label>
            <select
              className={input}
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">بدون تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-slate-600">
              روابط الصور (رابط في كل سطر)
            </label>
            <textarea
              className={`${input} h-24`}
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-bold text-slate-600">الوصف</label>
            <textarea
              className={`${input} h-24`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-6 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              منتج مميز
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              معروض في المتجر
            </label>
          </div>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 md:col-span-2">
              {error}
            </p>
          )}
          <div className="flex gap-2 md:col-span-2">
            <button className="rounded-xl bg-emerald-700 px-6 py-2 text-sm font-bold text-white">
              حفظ
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-bold text-slate-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">المنتج</th>
              <th className="p-3">التصنيف</th>
              <th className="p-3">السعر</th>
              <th className="p-3">المخزون</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  جارٍ التحميل...
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <p className="line-clamp-1 font-bold text-slate-700">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.sold} مبيع</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">{p.categoryName ?? "—"}</td>
                  <td className="p-3 font-bold text-emerald-700">{formatDZD(Number(p.price))}</td>
                  <td className="p-3">
                    <span className={p.stock <= 5 ? "font-bold text-rose-600" : "text-slate-600"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => toggle(p, "active")}
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
                      >
                        {p.active ? "معروض" : "مخفي"}
                      </button>
                      <button
                        onClick={() => toggle(p, "featured")}
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${p.featured ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}
                      >
                        {p.featured ? "⭐ مميز" : "عادي"}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  active: boolean;
};

const empty = { id: 0, name: "", slug: "", description: "", image: "", active: true };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/categories").then((r) => r.json());
    setItems(data.categories ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(form.id ? `/api/categories/${form.id}` : "/api/categories", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || form.name }),
    });
    if (res.ok) {
      setForm({ ...empty });
      await load();
    }
  }

  async function remove(id: number) {
    if (!confirm("حذف التصنيف؟ سيتم فصل المنتجات المرتبطة به.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await load();
  }

  const input = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">التصنيفات</h1>
        <p className="text-sm text-slate-500">نظّم منتجات متجرك ضمن تصنيفات</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form onSubmit={save} className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-slate-800">
            {form.id ? "تعديل تصنيف" : "تصنيف جديد"}
          </h2>
          <input
            required
            className={input}
            placeholder="اسم التصنيف"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={input}
            placeholder="الرابط (slug) — اختياري"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className={input}
            placeholder="رابط الصورة"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
          <textarea
            className={`${input} h-20`}
            placeholder="الوصف"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            مفعّل
          </label>
          <div className="flex gap-2">
            <button className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white">
              حفظ
            </button>
            {form.id > 0 && (
              <button
                type="button"
                onClick={() => setForm({ ...empty })}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>

        <div className="grid gap-3 sm:grid-cols-2">
          {loading && <p className="text-slate-400">جارٍ التحميل...</p>}
          {items.map((c) => (
            <div key={c.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{c.name}</p>
                <p className="line-clamp-2 text-xs text-slate-500">{c.description}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setForm({ ...c })}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-bold text-white"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white"
                  >
                    حذف
                  </button>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-bold ${c.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
                  >
                    {c.active ? "مفعّل" : "معطّل"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

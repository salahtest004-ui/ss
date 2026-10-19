"use client";

import { useCallback, useEffect, useState } from "react";

type Wilaya = {
  id: number;
  code: number;
  name: string;
  homeFee: number;
  deskFee: number;
  active: boolean;
};

export default function AdminShippingPage() {
  const [items, setItems] = useState<Wilaya[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bulk, setBulk] = useState({ home: "", desk: "" });

  const load = useCallback(async () => {
    const data = await fetch("/api/wilayas").then((r) => r.json());
    setItems(data.wilayas ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patchLocal(id: number, patch: Partial<Wilaya>) {
    setItems((list) => list.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }

  async function saveAll() {
    setSaving(true);
    await fetch("/api/wilayas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        updates: items.map((w) => ({
          id: w.id,
          homeFee: w.homeFee,
          deskFee: w.deskFee,
          active: w.active,
        })),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyBulk() {
    setItems((list) =>
      list.map((w) => ({
        ...w,
        homeFee: bulk.home ? Number(bulk.home) : w.homeFee,
        deskFee: bulk.desk ? Number(bulk.desk) : w.deskFee,
      })),
    );
  }

  const filtered = items.filter(
    (w) => w.name.includes(search) || String(w.code).includes(search),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">أسعار التوصيل حسب الولاية</h1>
          <p className="text-sm text-slate-500">58 ولاية — حدّد سعر التوصيل للمنزل والمكتب</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن ولاية"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          />
          <button
            onClick={saveAll}
            disabled={saving}
            className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-bold text-white disabled:bg-slate-300"
          >
            {saving ? "..." : saved ? "تم الحفظ ✓" : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">سعر موحّد للمنزل</label>
          <input
            type="number"
            value={bulk.home}
            onChange={(e) => setBulk({ ...bulk, home: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">سعر موحّد للمكتب</label>
          <input
            type="number"
            value={bulk.desk}
            onChange={(e) => setBulk({ ...bulk, desk: e.target.value })}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={applyBulk}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white"
        >
          تطبيق على الكل
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">الرمز</th>
              <th className="p-3">الولاية</th>
              <th className="p-3">سعر المنزل (دج)</th>
              <th className="p-3">سعر المكتب (دج)</th>
              <th className="p-3">مفعّلة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((w) => (
              <tr key={w.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-500">{String(w.code).padStart(2, "0")}</td>
                <td className="p-3 font-bold text-slate-700">{w.name}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={w.homeFee}
                    onChange={(e) => patchLocal(w.id, { homeFee: Number(e.target.value) })}
                    className="w-28 rounded-lg border border-slate-200 px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={w.deskFee}
                    onChange={(e) => patchLocal(w.id, { deskFee: Number(e.target.value) })}
                    className="w-28 rounded-lg border border-slate-200 px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={w.active}
                    onChange={(e) => patchLocal(w.id, { active: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

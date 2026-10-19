"use client";

import { useEffect, useState } from "react";

const FIELDS: Array<{ key: string; label: string; type?: string }> = [
  { key: "store_name", label: "اسم المتجر" },
  { key: "store_tagline", label: "الشعار / الوصف المختصر" },
  { key: "phone", label: "رقم الهاتف" },
  { key: "email", label: "البريد الإلكتروني" },
  { key: "address", label: "العنوان" },
  { key: "facebook", label: "رابط فيسبوك" },
  { key: "instagram", label: "رابط إنستغرام" },
  { key: "free_shipping_threshold", label: "حد الشحن المجاني (دج)", type: "number" },
  { key: "announcement", label: "الشريط الإعلاني" },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setValues(d.settings ?? {});
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, string> = {};
    for (const f of FIELDS) payload[f.key] = values[f.key] ?? "";
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <p className="text-slate-400">جارٍ التحميل...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">إعدادات المتجر</h1>
        <p className="text-sm text-slate-500">تحكم في معلومات المتجر الظاهرة للزبائن</p>
      </div>

      <form onSubmit={save} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "announcement" ? "md:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-bold text-slate-600">{f.label}</label>
            <input
              type={f.type ?? "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        ))}
        <div className="md:col-span-2 flex items-center gap-3">
          <button className="rounded-xl bg-emerald-700 px-6 py-2 text-sm font-bold text-white">
            حفظ الإعدادات
          </button>
          {saved && <span className="text-sm font-bold text-emerald-700">تم الحفظ ✓</span>}
        </div>
      </form>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        🔐 كلمة مرور لوحة التحكم تُضبط عبر متغير البيئة <code>ADMIN_PASSWORD</code> (الافتراضية:
        admin123).
      </div>
    </div>
  );
}

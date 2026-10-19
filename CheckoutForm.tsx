"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatDZD } from "@/lib/utils";

type WilayaOption = { code: number; name: string; homeFee: number; deskFee: number };

export default function CheckoutForm({
  wilayas,
  freeShippingThreshold,
}: {
  wilayas: WilayaOption[];
  freeShippingThreshold: number;
}) {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    wilayaCode: "",
    commune: "",
    address: "",
    deliveryType: "home",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const wilaya = useMemo(
    () => wilayas.find((w) => String(w.code) === form.wilayaCode),
    [wilayas, form.wilayaCode],
  );

  const freeShipping = freeShippingThreshold > 0 && subtotal >= freeShippingThreshold;
  const shippingFee = !wilaya
    ? 0
    : freeShipping
      ? 0
      : form.deliveryType === "desk"
        ? wilaya.deskFee
        : wilaya.homeFee;
  const total = subtotal + shippingFee;

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (items.length === 0) {
      setError("سلتك فارغة");
      return;
    }
    if (!/^0[5-7][0-9]{8}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("رقم الهاتف غير صحيح (مثال: 0551234567)");
      return;
    }
    if (!wilaya) {
      setError("يرجى اختيار الولاية");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          wilayaCode: Number(form.wilayaCode),
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذر إرسال الطلب");
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطأ غير متوقع");
      setLoading(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-3 font-bold text-slate-700">لا يمكن إتمام الطلب، السلة فارغة</p>
        <Link href="/products" className="mt-4 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-extrabold text-slate-800">معلومات الزبون</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">الاسم الكامل *</label>
            <input
              required
              value={form.customerName}
              onChange={(e) => update("customerName", e.target.value)}
              className={inputClass}
              placeholder="محمد أمين"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">رقم الهاتف *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="0551234567"
              inputMode="tel"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">الولاية *</label>
            <select
              required
              value={form.wilayaCode}
              onChange={(e) => update("wilayaCode", e.target.value)}
              className={inputClass}
            >
              <option value="">اختر الولاية</option>
              {wilayas.map((w) => (
                <option key={w.code} value={w.code}>
                  {String(w.code).padStart(2, "0")} - {w.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">البلدية</label>
            <input
              value={form.commune}
              onChange={(e) => update("commune", e.target.value)}
              className={inputClass}
              placeholder="باب الزوار"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">العنوان بالتفصيل</label>
          <textarea
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={`${inputClass} h-24`}
            placeholder="الحي، الشارع، رقم العمارة..."
          />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-bold text-slate-600">طريقة التوصيل</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "home", title: "التوصيل إلى المنزل", fee: wilaya?.homeFee, icon: "🏠" },
              { key: "desk", title: "التوصيل إلى المكتب", fee: wilaya?.deskFee, icon: "🏢" },
            ].map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => update("deliveryType", opt.key)}
                className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-right transition ${
                  form.deliveryType === opt.key
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-bold text-slate-700">
                  {opt.icon} {opt.title}
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {typeof opt.fee === "number" ? formatDZD(opt.fee) : "—"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">ملاحظات</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className={`${inputClass} h-20`}
            placeholder="أي معلومة إضافية تخص الطلب"
          />
        </div>

        <div className="rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          💵 طريقة الدفع: الدفع عند الاستلام (Cash on delivery)
        </div>
      </div>

      <aside className="h-fit space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-extrabold text-slate-800">ملخص الطلب</h2>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-2 text-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold">
                {i.quantity}
              </span>
              <span className="line-clamp-1 flex-1 text-slate-600">{i.name}</span>
              <span className="font-bold">{formatDZD(i.price * i.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t border-slate-100 pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">المجموع الفرعي</span>
            <span className="font-bold">{formatDZD(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">التوصيل</span>
            <span className="font-bold">
              {!wilaya ? "اختر الولاية" : freeShipping ? "مجاني 🎉" : formatDZD(shippingFee)}
            </span>
          </div>
        </div>
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-extrabold text-emerald-800">
          <span>الإجمالي</span>
          <span>{formatDZD(total)}</span>
        </div>
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-3 font-bold text-white shadow transition hover:bg-emerald-800 disabled:bg-slate-300"
        >
          {loading ? "جارٍ الإرسال..." : "تأكيد الطلب ✅"}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          بالضغط على تأكيد الطلب أنت توافق على شروط البيع.
        </p>
      </aside>
    </form>
  );
}

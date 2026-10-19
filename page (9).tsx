"use client";

import { useCallback, useEffect, useState } from "react";
import { ORDER_STATUS, formatDZD, formatDate, statusColor, statusLabel } from "@/lib/utils";

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilayaName: string;
  commune: string;
  address: string;
  deliveryType: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: string;
  notes: string;
  createdAt: string;
};

type OrderItem = {
  id: number;
  productName: string;
  image: string;
  price: number;
  quantity: number;
};

const FILTERS = [
  { value: "all", label: "الكل" },
  ...Object.entries(ORDER_STATUS).map(([value, v]) => ({ value, label: v.label })),
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    const data = await fetch(`/api/orders?${params.toString()}`).then((r) => r.json());
    setOrders(data.orders ?? []);
    setLoading(false);
  }, [status, search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetails(id: number) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    const data = await fetch(`/api/orders/${id}`).then((r) => r.json());
    setItems(data.items ?? []);
    setOpenId(id);
  }

  async function changeStatus(id: number, next: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    await load();
  }

  async function remove(id: number) {
    if (!confirm("حذف الطلب نهائياً؟")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setOpenId(null);
    await load();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">الطلبات</h1>
          <p className="text-sm text-slate-500">{orders.length} طلب</p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف أو رقم الطلب"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${
              status === f.value ? "bg-emerald-700 text-white" : "bg-white text-slate-600 shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-slate-400">جارٍ التحميل...</p>}
        {!loading && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
            لا توجد طلبات
          </div>
        )}
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-extrabold text-slate-800">
                  {o.customerName}{" "}
                  <span className="text-xs font-normal text-slate-400">#{o.orderNumber}</span>
                </p>
                <p className="text-xs text-slate-500">
                  📞 {o.phone} • 📍 {o.wilayaName} {o.commune && `- ${o.commune}`} •{" "}
                  {o.deliveryType === "desk" ? "مكتب" : "منزل"} • {formatDate(o.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-emerald-700">{formatDZD(o.total)}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColor(o.status)}`}>
                  {statusLabel(o.status)}
                </span>
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o.id, e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                >
                  {Object.entries(ORDER_STATUS).map(([value, v]) => (
                    <option key={value} value={value}>
                      {v.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => openDetails(o.id)}
                  className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white"
                >
                  {openId === o.id ? "إخفاء" : "تفاصيل"}
                </button>
                <button
                  onClick={() => remove(o.id)}
                  className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white"
                >
                  حذف
                </button>
              </div>
            </div>

            {openId === o.id && (
              <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-slate-700">المنتجات</h3>
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-white">
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt={it.productName} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span className="flex-1 text-xs font-bold text-slate-700">{it.productName}</span>
                      <span className="text-xs text-slate-500">
                        {it.quantity} × {formatDZD(it.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1 text-sm">
                  <h3 className="text-sm font-extrabold text-slate-700">الملخص</h3>
                  <p className="text-xs text-slate-500">🏠 العنوان: {o.address || "—"}</p>
                  <p className="text-xs text-slate-500">📝 ملاحظات: {o.notes || "—"}</p>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">المجموع الفرعي</span>
                    <span className="font-bold">{formatDZD(o.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">التوصيل</span>
                    <span className="font-bold">{formatDZD(o.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-extrabold text-emerald-800">
                    <span>الإجمالي</span>
                    <span>{formatDZD(o.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

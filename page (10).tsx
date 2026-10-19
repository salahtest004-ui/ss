import Link from "next/link";
import { getDashboardStats } from "@/lib/queries";
import { formatDZD, formatDate, statusColor, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const maxDay = Math.max(1, ...stats.salesByDay.map((d) => d.total));

  const cards = [
    { label: "إجمالي المبيعات", value: formatDZD(stats.revenue), icon: "💰", color: "from-emerald-500 to-emerald-700" },
    { label: "عدد الطلبات", value: String(stats.orderCount), icon: "🧾", color: "from-blue-500 to-blue-700" },
    { label: "طلبات قيد الانتظار", value: String(stats.pending), icon: "⏳", color: "from-amber-500 to-amber-600" },
    { label: "المنتجات", value: String(stats.productCount), icon: "📦", color: "from-fuchsia-500 to-purple-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">نظرة عامة</h1>
        <p className="text-sm text-slate-500">ملخص أداء متجرك اليوم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-2xl bg-gradient-to-br ${c.color} p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-xs opacity-80">{c.label}</span>
            </div>
            <p className="mt-3 text-2xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-extrabold text-slate-800">مبيعات آخر 14 يوم</h2>
          {stats.salesByDay.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا توجد مبيعات بعد</p>
          ) : (
            <div className="flex h-48 items-end gap-2">
              {stats.salesByDay.map((d) => (
                <div key={d.day} className="group flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-emerald-500 transition group-hover:bg-emerald-600"
                    style={{ height: `${Math.max(6, (d.total / maxDay) * 100)}%` }}
                    title={`${d.day}: ${formatDZD(d.total)}`}
                  />
                  <span className="text-[9px] text-slate-400">{d.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-extrabold text-slate-800">حالة المخزون</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">عدد التصنيفات</span>
              <span className="font-bold">{stats.categoryCount}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">منتجات شبه نافذة (≤5)</span>
              <span className="font-bold text-rose-600">{stats.lowStock}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">طلبات تم تسليمها</span>
              <span className="font-bold text-emerald-700">{stats.delivered}</span>
            </li>
          </ul>
          <h3 className="mt-6 mb-2 text-sm font-extrabold text-slate-800">أعلى الولايات طلباً</h3>
          <ul className="space-y-2 text-xs">
            {stats.byWilaya.length === 0 && <li className="text-slate-400">—</li>}
            {stats.byWilaya.map((w) => (
              <li key={w.name} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-bold text-slate-700">{w.name}</span>
                <span className="text-slate-500">{w.count} طلب</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">آخر الطلبات</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-emerald-700">
              عرض الكل
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-700">{o.customerName}</p>
                    <p className="text-slate-400">
                      {o.orderNumber} • {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-slate-800">{formatDZD(o.total)}</p>
                    <span className={`rounded-full border px-2 py-0.5 ${statusColor(o.status)}`}>
                      {statusLabel(o.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800">المنتجات الأكثر مبيعاً</h2>
            <Link href="/admin/products" className="text-xs font-bold text-emerald-700">
              إدارة المنتجات
            </Link>
          </div>
          <div className="space-y-2">
            {stats.topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
                <div className="h-10 w-10 overflow-hidden rounded-lg bg-white">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-slate-700">{p.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {p.sold} مبيع • مخزون {p.stock}
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700">
                  {formatDZD(Number(p.price))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

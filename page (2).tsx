import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/queries";
import { formatDZD, formatDate, statusColor, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const data = await getOrderByNumber(decodeURIComponent(number));
  if (!data) notFound();
  const { order, items } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <p className="text-5xl">🎉</p>
        <h1 className="mt-3 text-2xl font-extrabold text-emerald-800">تم تسجيل طلبك بنجاح!</h1>
        <p className="mt-2 text-sm text-slate-500">
          سيتصل بك فريقنا على الرقم <span className="font-bold text-slate-700">{order.phone}</span>{" "}
          لتأكيد الطلب.
        </p>
        <p className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2 font-bold text-white">
          رقم الطلب: {order.orderNumber}
        </p>
      </div>

      <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold text-slate-800">تفاصيل الطلب</h2>
          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColor(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p>👤 {order.customerName}</p>
          <p>📞 {order.phone}</p>
          <p>
            📍 {order.wilayaName} {order.commune && `- ${order.commune}`}
          </p>
          <p>🚚 {order.deliveryType === "desk" ? "التوصيل إلى المكتب" : "التوصيل إلى المنزل"}</p>
          <p>🗓 {formatDate(order.createdAt)}</p>
          <p>💵 الدفع عند الاستلام</p>
        </div>

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg bg-slate-100">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">{item.productName}</p>
                <p className="text-xs text-slate-500">
                  {item.quantity} × {formatDZD(item.price)}
                </p>
              </div>
              <span className="text-sm font-extrabold text-slate-800">
                {formatDZD(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">المجموع الفرعي</span>
            <span className="font-bold">{formatDZD(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">التوصيل</span>
            <span className="font-bold">
              {order.shippingFee === 0 ? "مجاني" : formatDZD(order.shippingFee)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-2 text-lg font-extrabold text-emerald-800">
            <span>الإجمالي</span>
            <span>{formatDZD(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/products" className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">
          متابعة التسوق
        </Link>
        <Link href="/track" className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700">
          تتبع طلب آخر
        </Link>
      </div>
    </div>
  );
}

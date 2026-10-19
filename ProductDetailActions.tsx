"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export default function ProductDetailActions({
  product,
}: {
  product: { id: number; name: string; slug: string; price: number; image: string; stock: number };
}) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState("");
  const disabled = product.stock <= 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-600">الكمية</span>
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg font-bold text-slate-600 hover:bg-slate-50"
          >
            −
          </button>
          <span className="w-12 text-center font-bold">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(Math.max(product.stock, 1), q + 1))}
            className="px-4 py-2 text-lg font-bold text-slate-600 hover:bg-slate-50"
          >
            +
          </button>
        </div>
        <span className={`text-xs font-bold ${disabled ? "text-rose-600" : "text-emerald-700"}`}>
          {disabled ? "غير متوفر حالياً" : `متوفر: ${product.stock} قطعة`}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          disabled={disabled}
          onClick={() => {
            add(product, qty);
            setMsg("تمت إضافة المنتج إلى السلة ✓");
            setTimeout(() => setMsg(""), 2000);
          }}
          className="flex-1 rounded-xl border-2 border-emerald-700 px-6 py-3 font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        >
          🛒 أضف إلى السلة
        </button>
        <button
          disabled={disabled}
          onClick={() => {
            add(product, qty);
            router.push("/checkout");
          }}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          ⚡ اطلب الآن — الدفع عند الاستلام
        </button>
      </div>
      {msg && <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">{msg}</p>}
    </div>
  );
}

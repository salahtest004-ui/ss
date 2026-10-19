"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TrackPage() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold text-slate-800">تتبع طلبيتي 📦</h1>
        <p className="mt-2 text-sm text-slate-500">
          أدخل رقم الطلب الذي استلمته بعد تأكيد الشراء (مثال: DZ-20260101-1234).
        </p>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) router.push(`/order/${encodeURIComponent(value.trim())}`);
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="DZ-20260101-1234"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
          <button className="rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white">بحث</button>
        </form>
      </div>
    </div>
  );
}

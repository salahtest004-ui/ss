"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: "خطأ" }));
      setError(data.error ?? "كلمة المرور غير صحيحة");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-2xl"
      >
        <div className="text-center">
          <span className="text-4xl">🔐</span>
          <h1 className="mt-2 text-xl font-extrabold text-slate-800">لوحة تحكم المتجر</h1>
          <p className="text-xs text-slate-500">أدخل كلمة المرور للدخول</p>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>
        )}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:bg-slate-300"
        >
          {loading ? "..." : "دخول"}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          كلمة المرور الافتراضية: <span className="font-bold">admin123</span>
        </p>
      </form>
    </div>
  );
}

export function formatDZD(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(n) ? n : 0;
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 }).format(
    Math.round(safe),
  )} دج`;
}

export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now()}`;
}

export function orderNumber(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DZ-${stamp}-${rand}`;
}

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-800 border-amber-200" },
  confirmed: { label: "مؤكد", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "قيد التوصيل", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  delivered: { label: "تم التسليم", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "ملغى", color: "bg-rose-100 text-rose-800 border-rose-200" },
};

export function statusLabel(status: string): string {
  return ORDER_STATUS[status]?.label ?? status;
}

export function statusColor(status: string): string {
  return ORDER_STATUS[status]?.color ?? "bg-slate-100 text-slate-700 border-slate-200";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-DZ", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

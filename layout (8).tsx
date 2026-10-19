import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar storeName={settings.store_name} />
      <div className="flex-1 overflow-x-hidden p-4 lg:p-8">{children}</div>
    </div>
  );
}

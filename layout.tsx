import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getCategories, getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        storeName={settings.store_name}
        announcement={settings.announcement}
        phone={settings.phone}
        categories={categories
          .filter((c) => c.active)
          .map((c) => ({ name: c.name, slug: c.slug }))}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} categories={categories} />
    </div>
  );
}

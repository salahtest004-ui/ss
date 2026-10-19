import Link from "next/link";
import type { Category } from "@/db/schema";
import type { StoreSettings } from "@/lib/queries";

export default function Footer({
  settings,
  categories,
}: {
  settings: StoreSettings;
  categories: Category[];
}) {
  return (
    <footer className="mt-16 bg-emerald-950 text-emerald-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-xl font-extrabold">{settings.store_name}</h3>
          <p className="text-sm text-emerald-200">{settings.store_tagline}</p>
          <div className="mt-4 flex gap-3 text-lg">
            <a href={settings.facebook} className="transition hover:text-amber-400">
              📘
            </a>
            <a href={settings.instagram} className="transition hover:text-amber-400">
              📷
            </a>
            <a href={`tel:${settings.phone}`} className="transition hover:text-amber-400">
              ☎️
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-bold">التصنيفات</h4>
          <ul className="space-y-2 text-sm text-emerald-200">
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">روابط مفيدة</h4>
          <ul className="space-y-2 text-sm text-emerald-200">
            <li>
              <Link href="/products" className="hover:text-white">
                كل المنتجات
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                سلة المشتريات
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-white">
                تتبع طلبيتي
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white">
                لوحة التحكم
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-bold">اتصل بنا</h4>
          <ul className="space-y-2 text-sm text-emerald-200">
            <li>📍 {settings.address}</li>
            <li>📞 {settings.phone}</li>
            <li>✉️ {settings.email}</li>
            <li>💵 الدفع عند الاستلام في كامل التراب الوطني</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-emerald-900 py-4 text-center text-xs text-emerald-300">
        © {new Date().getFullYear()} {settings.store_name} — جميع الحقوق محفوظة 🇩🇿
      </div>
    </footer>
  );
}

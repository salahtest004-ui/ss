import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "سوق الجزائر | متجر إلكتروني جزائري",
  description:
    "متجر إلكتروني جزائري متكامل: أزياء تقليدية، عطور، منتجات طبيعية وإلكترونيات مع الدفع عند الاستلام والتوصيل إلى 58 ولاية.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

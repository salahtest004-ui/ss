import CheckoutForm from "@/components/CheckoutForm";
import { getSettings, getWilayas } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [wilayas, settings] = await Promise.all([getWilayas(), getSettings()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-extrabold text-slate-800">إتمام الطلب</h1>
      <p className="mb-6 text-sm text-slate-500">
        املأ معلوماتك وسيتصل بك فريقنا لتأكيد الطلب — الدفع عند الاستلام 💵
      </p>
      <CheckoutForm
        wilayas={wilayas
          .filter((w) => w.active)
          .map((w) => ({ code: w.code, name: w.name, homeFee: w.homeFee, deskFee: w.deskFee }))}
        freeShippingThreshold={Number(settings.free_shipping_threshold || 0)}
      />
    </div>
  );
}

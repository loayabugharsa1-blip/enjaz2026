"use client";
import { useDirection } from "@/hooks/use-direction";
import { packages } from "@/data/packages";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils/currency";
import { Check } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/config";

const WHATSAPP_MSG = "مرحباً شركة إنجاز، أريد طلب الخدمة والاستفسار عن تفاصيل الباقة";

export function PackagesList() {
  const { isRtl } = useDirection();

  return (
    <section className="py-20 bg-zinc-950/50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{isRtl ? "الباقات والعروض" : "Packages & Offers"}</h2>
        <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
          {isRtl ? "باقات متكاملة بأسعار خاصة توفر لك المال والوقت" : "Integrated packages at special prices saving you money and time"}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} hover className="flex flex-col relative">
              {pkg.badge && (
                <span className="absolute -top-3 inset-x-0 mx-auto w-fit px-3 py-1 bg-[#dc2626] text-white text-xs font-medium rounded-full">
                  {pkg.badge}
                </span>
              )}
              <div className="text-center mb-4 mt-2">
                <h3 className="text-xl font-bold text-zinc-100">{isRtl ? pkg.nameAr : pkg.nameEn}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#dc2626]">{formatPrice(pkg.price, isRtl ? "ar" : "en")}</span>
                  <span className="block text-sm text-zinc-500 line-through">{formatPrice(pkg.originalPrice, isRtl ? "ar" : "en")}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {pkg.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`} target="_blank" rel="noopener noreferrer" className="mt-6 w-full block text-center py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg font-medium transition-colors">
                {isRtl ? "اطلب الآن" : "Order Now"}
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

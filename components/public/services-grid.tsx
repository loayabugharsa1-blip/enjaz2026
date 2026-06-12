"use client";
import { useEffect, useState } from "react";
import { useDirection } from "@/hooks/use-direction";
import { getCalculatorConfig } from "@/data/services";
import { getAllServices } from "@/lib/services-db";
import { Card } from "@/components/ui/card";
import { SmartCalculator } from "@/components/public/smart-calculator";
import { formatPrice } from "@/lib/utils/currency";
import Image from "next/image";
import { Calculator } from "lucide-react";
import { GridSkeleton } from "@/components/ui/skeleton";
import type { Service } from "@/types/common";

export function ServicesGrid() {
  const { isRtl } = useDirection();
  const [services, setServices] = useState<Service[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [calcService, setCalcService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllServices().then((result) => {
      setServices(result || []);
    }).catch(() => {
      setServices([]);
    }).finally(() => setLoading(false));
  }, []);

  const parents = services.filter((s) => s.parentId === null);
  const displayed = activeParent ? services.filter((s) => s.parentId === activeParent) : parents;

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{isRtl ? "خدماتنا" : "Our Services"}</h2>
        <p className="text-zinc-400 text-center mb-8 max-w-xl mx-auto">
          {isRtl ? "اختر التصنيف الرئيسي لعرض الخدمات الفرعية" : "Select a category to view sub-services"}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {parents.map((p) => (
            <button
              key={p.id}
              onClick={() => { setActiveParent(activeParent === p.id ? null : p.id); setCalcService(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeParent === p.id
                  ? "bg-[#dc2626] text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {p.imageUrl ? <Image src={p.imageUrl} alt="" width={20} height={20} className="w-5 h-5 object-contain inline-block me-1.5 rounded" /> : <span className="me-1.5">{p.icon}</span>}
              {isRtl ? p.titleAr : p.titleEn}
            </button>
          ))}
        </div>

        {loading && <GridSkeleton count={6} />}

        {!loading && <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayed.map((service) => {
              const hasCalc = getCalculatorConfig(service.id) !== null;
              return (
                <Card key={service.id} hover className="flex flex-col">
                  <div className="text-4xl mb-4">{service.imageUrl ? <Image src={service.imageUrl} alt="" width={64} height={64} className="w-16 h-16 object-contain mx-auto rounded-lg" /> : service.icon}</div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">{isRtl ? service.titleAr : service.titleEn}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed flex-1">{isRtl ? service.descriptionAr : service.descriptionEn}</p>
                  <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-lg font-bold text-[#dc2626]">{formatPrice(service.basePrice, isRtl ? "ar" : "en")}</span>
                    <span className="text-xs text-zinc-500">{isRtl ? "يبدأ من" : "Starting from"}</span>
                  </div>
                  {hasCalc && (
                    <button
                      onClick={() => setCalcService(calcService?.id === service.id ? null : service)}
                      className="mt-3 flex items-center justify-center gap-2 w-full text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      {isRtl ? "احسب السعر" : "Calculate Price"}
                    </button>
                  )}
                </Card>
              );
            })}
          </div>

          {calcService && (
            <div className="max-w-lg mx-auto mt-8">
              <SmartCalculator service={calcService} onClose={() => setCalcService(null)} />
            </div>
          )}

          {displayed.length === 0 && (
            <p className="text-zinc-500 text-center py-10">{isRtl ? "لا توجد خدمات في هذا التصنيف" : "No services in this category"}</p>
          )}
        </>}
      </div>
    </section>
  );
}

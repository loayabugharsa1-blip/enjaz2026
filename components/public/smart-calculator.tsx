"use client";
import { useEffect, useState, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { getCalculatorConfig } from "@/data/services";
import { getPricingRules } from "@/lib/pricing-storage";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Service, PricingRule } from "@/types/common";

interface SmartCalculatorProps {
  service: Service;
  onClose?: () => void;
}

export function SmartCalculator({ service, onClose }: SmartCalculatorProps) {
  const { isRtl } = useDirection();
  const config = getCalculatorConfig(service.id);
  const [values, setValues] = useState<Record<string, number>>({});
  const [price, setPrice] = useState<number>(0);
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    const r = getPricingRules();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRules(r);
    if (config) {
      const initial: Record<string, number> = {};
      config.fields.forEach((f) => { initial[f.key] = f.defaultValue; });
      setValues(initial);
    }
  }, [config]);

  useEffect(() => {
    if (!config || Object.keys(values).length === 0) return;
    const result = config.calcFn(values, rules);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrice(Math.round(result * 100) / 100);
  }, [values, rules, config]);

  const setField = useCallback((key: string, v: string) => {
    const num = parseFloat(v) || 0;
    setValues((prev) => ({ ...prev, [key]: num }));
  }, []);

  const handleOrder = useCallback(() => {
    const msg = isRtl
      ? `مرحباً إنجاز، أود الاستفسار عن خدمة ${service.titleAr}:\nالسعر التقريبي: ${price.toLocaleString("en-US")} د.ل`
      : `Hello Enjaz, I'm interested in ${service.titleEn}:\nEstimated price: ${price.toLocaleString("en-US")} LYD`;
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
  }, [service, price, isRtl]);

  if (!config) return null;

  return (
    <Card className="mt-4 border-[#dc2626]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">
          {isRtl ? `حاسبة سعر: ${service.titleAr}` : `Price Calculator: ${service.titleEn}`}
        </h3>
        {onClose && (
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-sm">
            {isRtl ? "إغلاق" : "Close"}
          </button>
        )}
      </div>

      <p className="text-sm text-zinc-500 mb-4">
        {isRtl ? "اختر المواصفات لمعرفة السعر التقريبي" : "Select specifications for an estimated price"}
      </p>

      <div className="space-y-3">
        {config.fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {isRtl ? field.labelAr : field.labelEn}
            </label>
            {field.type === "number" ? (
              <input
                type="number"
                value={values[field.key] ?? field.defaultValue}
                onChange={(e) => setField(field.key, e.target.value)}
                min={field.min ?? 0}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
              />
            ) : (
              <select
                value={values[field.key] ?? field.defaultValue}
                onChange={(e) => setField(field.key, e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500 appearance-none"
              >
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isRtl ? opt.labelAr : opt.labelEn}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400">{isRtl ? "السعر التقديري" : "Estimated Price"}</span>
          <span className="text-2xl font-bold text-[#dc2626]">{price.toLocaleString("en-US")} د.ل</span>
        </div>
        <p className="text-xs text-zinc-600 mb-4">
          {isRtl ? "* هذا السعر تقديري وقد يختلف حسب التفاصيل الدقيقة للطلب" : "* This is an estimate and may vary based on exact order details"}
        </p>
        <Button onClick={handleOrder} className="w-full">
          {isRtl ? "إرسال الاستفسار عبر واتساب" : "Send Inquiry via WhatsApp"}
        </Button>
      </div>
    </Card>
  );
}

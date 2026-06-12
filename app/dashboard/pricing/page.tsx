"use client";
import { useState, useCallback, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { getPricingRules, updatePricingRule, resetPricingRules } from "@/lib/pricing-storage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServiceById } from "@/data/services";
import { Save, RotateCcw } from "lucide-react";
import type { PricingRule } from "@/types/common";

const UNIT_LABELS: Record<string, { ar: string; en: string }> = {
  base: { ar: "أساس", en: "Base" },
  piece: { ar: "قطعة", en: "Piece" },
  cm2: { ar: "سم²", en: "cm²" },
  m2: { ar: "م²", en: "m²" },
};

export default function PricingPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRules(getPricingRules());
  }, []);

  const handleChange = useCallback((id: string, value: string) => {
    setEdits((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback((id: string) => {
    const val = parseFloat(edits[id]);
    if (isNaN(val) || val < 0) return;
    const updated = updatePricingRule(id, val);
    if (updated) {
      setRules((prev) => prev.map((r) => r.id === id ? updated : r));
      setEdits((prev) => { const copy = { ...prev }; delete copy[id]; return copy; });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }, [edits]);

  const handleReset = useCallback(() => {
    if (!isRtl) {
      if (!confirm("Reset all pricing rules to defaults?")) return;
    } else {
      if (!confirm("إعادة تعيين كل أسعار الخدمات إلى القيم الافتراضية؟")) return;
    }
    resetPricingRules();
    setRules(getPricingRules());
    setEdits({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [isRtl]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "إدارة الأسعار" : "Pricing Management"}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isRtl ? "تعديل أسعار الخدمات الأساسية - تنعكس التغييرات فوراً على الحاسبة الذكية" : "Modify base service prices — changes reflect instantly in the Smart Calculator"}
          </p>
        </div>
        {isAdmin && (
          <Button variant="secondary" size="small" onClick={handleReset} className="flex items-center gap-1">
            <RotateCcw className="w-4 h-4" />
            {isRtl ? "إعادة تعيين" : "Reset"}
          </Button>
        )}
      </div>

      {saved && (
        <div className="text-sm text-green-400 bg-green-900/20 border border-green-800 rounded-lg px-4 py-2 mb-4">
          {isRtl ? "✅ تم الحفظ بنجاح" : "✅ Saved successfully"}
        </div>
      )}

      <div className="space-y-3 mt-6">
        {rules.map((rule) => {
          const service = getServiceById(rule.serviceId);
          const unitLabel = UNIT_LABELS[rule.unitType];
          return (
            <Card key={rule.id}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-100">{isRtl ? rule.nameAr : rule.nameEn}</span>
                    {service && (
                      <span className="text-xs text-zinc-500">
                        {service.icon} {isRtl ? service.titleAr : service.titleEn}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {isRtl ? unitLabel.ar : unitLabel.en}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={edits[rule.id] ?? rule.pricePerUnit}
                    onChange={(e) => handleChange(rule.id, e.target.value)}
                    className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 text-center focus:outline-none focus:border-zinc-500"
                  />
                  <span className="text-sm text-zinc-500 w-8">د.ل</span>
                  {isAdmin && edits[rule.id] !== undefined && (
                    <Button size="small" onClick={() => handleSave(rule.id)} className="flex items-center gap-1">
                      <Save className="w-3.5 h-3.5" />
                      {isRtl ? "حفظ" : "Save"}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

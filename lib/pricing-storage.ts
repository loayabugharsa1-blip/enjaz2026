import type { PricingRule } from "@/types/common";

const STORAGE_KEY = "injaz_pricing_rules";

const DEFAULT_RULES: PricingRule[] = [
  { id: "shld-wd-pc", serviceId: "shields-wood-crystal-leather", nameAr: "سعر القطعة - دروع", nameEn: "Per piece - Shields", pricePerUnit: 200, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "shld-sv-pc", serviceId: "souvenirs-medals", nameAr: "سعر القطعة - هدايا", nameEn: "Per piece - Souvenirs", pricePerUnit: 100, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "shld-gl-pc", serviceId: "glass-acrylic-stand-a4", nameAr: "سعر القطعة - ستاند", nameEn: "Per piece - Stand", pricePerUnit: 150, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "nam-cr-pc", serviceId: "nameplates-crystal-wood", nameAr: "سعر القطعة - مسميات كريستال", nameEn: "Per piece - Crystal nameplate", pricePerUnit: 120, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "nam-sg-pc", serviceId: "nameplates-single-double", nameAr: "سعر القطعة - مسميات مكتب", nameEn: "Per piece - Desk nameplate", pricePerUnit: 80, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "cert-fb-pc", serviceId: "certificates-fabric", nameAr: "سعر القطعة - شهادات", nameEn: "Per piece - Certificate", pricePerUnit: 60, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "ppr-crd-pc", serviceId: "business-cards", nameAr: "سعر الكرت - 100 بطاقة", nameEn: "Per pack - 100 cards", pricePerUnit: 50, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "ppr-bro-pc", serviceId: "brochures-flyers", nameAr: "سعر القطعة - بروشور", nameEn: "Per piece - Brochure", pricePerUnit: 5, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "vin-cut-cm2", serviceId: "vinyl-cutting", nameAr: "سعر السم المربع - قص فينيل", nameEn: "Per cm² - Vinyl cutting", pricePerUnit: 0.02, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "vin-bnr-cm2", serviceId: "banner-vinyl-printing", nameAr: "سعر السم المربع - بنر", nameEn: "Per cm² - Banner printing", pricePerUnit: 0.01, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "vin-fab-cm2", serviceId: "fabric-printing", nameAr: "سعر السم المربع - طباعة قماش", nameEn: "Per cm² - Fabric printing", pricePerUnit: 0.015, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "vin-snd-cm2", serviceId: "sandblasted-vinyl", nameAr: "سعر السم المربع - فينيل مرمل", nameEn: "Per cm² - Sandblasted vinyl", pricePerUnit: 0.03, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "stk-prd-cm2", serviceId: "product-stickers", nameAr: "سعر السم المربع - ملصقات", nameEn: "Per cm² - Product labels", pricePerUnit: 0.015, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "stk-wtr-cm2", serviceId: "waterproof-stickers", nameAr: "سعر السم المربع - استيكرات مقاومة", nameEn: "Per cm² - Waterproof stickers", pricePerUnit: 0.025, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "soc-pst-pc", serviceId: "social-posts", nameAr: "سعر البوست الواحد", nameEn: "Per post design", pricePerUnit: 200, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "soc-lgo-pc", serviceId: "logo-branding", nameAr: "سعر الهوية البصرية المتكاملة", nameEn: "Complete branding package", pricePerUnit: 800, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "food-sgr-pc", serviceId: "food-sugar-sheet", nameAr: "سعر الورقة - ورق سكر A4", nameEn: "Per sheet - Sugar sheet A4", pricePerUnit: 50, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "food-cho-pc", serviceId: "food-choco-transfer", nameAr: "سعر الورقة - ورق ترانسفير A4", nameEn: "Per sheet - Choco transfer A4", pricePerUnit: 60, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "food-waf-pc", serviceId: "food-wafer-paper", nameAr: "سعر الورقة - ورق ويفر A4", nameEn: "Per sheet - Wafer paper A4", pricePerUnit: 70, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "gift-sgr-pc", serviceId: "gift-sugar-sheet", nameAr: "سعر الورقة - ورق سكر (Gift)", nameEn: "Per sheet - Sugar sheet (Gift)", pricePerUnit: 50, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "gift-cho-pc", serviceId: "gift-choco-transfer", nameAr: "سعر الورقة - ترانسفير (Gift)", nameEn: "Per sheet - Choco transfer (Gift)", pricePerUnit: 60, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "gift-waf-pc", serviceId: "gift-wafer-paper", nameAr: "سعر الورقة - ويفر (Gift)", nameEn: "Per sheet - Wafer paper (Gift)", pricePerUnit: 70, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "flg-sng-pc", serviceId: "flag-desk-single", nameAr: "سعر القطعة - علم مكتب فردي", nameEn: "Per piece - Single desk flag", pricePerUnit: 35, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "flg-dbl-pc", serviceId: "flag-desk-double", nameAr: "سعر القطعة - علم مكتب مزدوج", nameEn: "Per piece - Double desk flag", pricePerUnit: 55, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "flg-lrg-pc", serviceId: "flag-desk-large", nameAr: "سعر القطعة - علم مكتب كبير", nameEn: "Per piece - Large desk flag", pricePerUnit: 120, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "flg-out-pc", serviceId: "flag-outdoor-sail", nameAr: "سعر القطعة - شراع خارجي", nameEn: "Per piece - Outdoor sail", pricePerUnit: 250, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "prn-stk-cm2", serviceId: "print-sticker-reinforced", nameAr: "سعر السم المربع - ستيكر مقوى", nameEn: "Per cm² - Reinforced sticker", pricePerUnit: 0.025, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "prn-id-pc", serviceId: "print-id-cards", nameAr: "سعر القطعة - كارت تعريف", nameEn: "Per piece - ID card", pricePerUnit: 25, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "prn-sfx-pc", serviceId: "print-sign-fixed", nameAr: "سعر القطعة - لافتة ثابتة", nameEn: "Per piece - Fixed sign", pricePerUnit: 180, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "prn-slg-pc", serviceId: "print-sign-light", nameAr: "سعر القطعة - لافتة ضوئية", nameEn: "Per piece - Lighted sign", pricePerUnit: 350, unitType: "piece", updatedAt: new Date().toISOString() },
  { id: "prn-pvc-cm2", serviceId: "print-pvc-board", nameAr: "سعر السم المربع - لوح PVC", nameEn: "Per cm² - PVC board", pricePerUnit: 0.05, unitType: "cm2", updatedAt: new Date().toISOString() },
  { id: "prn-cpy-pc", serviceId: "print-copiest", nameAr: "سعر القطعة - طباعة كوبيست", nameEn: "Per piece - Copiest print", pricePerUnit: 15, unitType: "piece", updatedAt: new Date().toISOString() },
];

function getAll(): PricingRule[] {
  if (typeof window === "undefined") return DEFAULT_RULES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RULES));
      return DEFAULT_RULES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[pricing-storage] Failed to parse rules, returning defaults:", err);
    return DEFAULT_RULES;
  }
}

function saveAll(rules: PricingRule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

export function getPricingRules(): PricingRule[] {
  return getAll();
}

export function updatePricingRule(id: string, pricePerUnit: number): PricingRule | null {
  const all = getAll();
  const found = all.find((r) => r.id === id);
  if (!found) return null;
  found.pricePerUnit = pricePerUnit;
  found.updatedAt = new Date().toISOString();
  saveAll(all);
  return found;
}

export function resetPricingRules(): void {
  saveAll(DEFAULT_RULES);
}

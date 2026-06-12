import { supabaseAdmin } from "@/lib/supabase/server-client";
import type { SelectedAttribute } from "@/types/order";

export type PriceLineItem = {
  serviceId: string;
  quantity: number;
  attributes?: SelectedAttribute[];
};

export type PriceLineResult = {
  serviceId: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  total: number;
  attributes?: SelectedAttribute[];
};

export type PriceResult = {
  lineItems: PriceLineResult[];
  grandTotal: number;
};

export async function calculateTotal(items: PriceLineItem[]): Promise<PriceResult> {
  if (!items.length) {
    return { lineItems: [], grandTotal: 0 };
  }

  const ids = items.map((i) => i.serviceId);

  const { data: services, error } = await supabaseAdmin
    .from("services")
    .select("id, title_ar, title_en, base_price, attributes")
    .in("id", ids);

  if (error) {
    console.error("[calculateTotal] failed to fetch services:", error);
    throw new Error("فشل في حساب السعر");
  }

  const svcMap = new Map<string, typeof services[0]>();
  for (const s of services || []) {
    svcMap.set(s.id, s);
  }

  const lineItems: PriceLineResult[] = [];

  for (const item of items) {
    const svc = svcMap.get(item.serviceId);
    if (!svc) {
      throw new Error(`الخدمة "${item.serviceId}" غير موجودة`);
    }

    let unitPrice = Number(svc.base_price);
    let attrModifier = 0;

    if (item.attributes?.length) {
      for (const sel of item.attributes) {
        attrModifier += sel.priceModifier;
      }
    }

    unitPrice += attrModifier;

    lineItems.push({
      serviceId: item.serviceId,
      nameAr: svc.title_ar,
      nameEn: svc.title_en,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice * item.quantity,
      attributes: item.attributes || [],
    });
  }

  const grandTotal = lineItems.reduce((sum, li) => sum + li.total, 0);

  return { lineItems, grandTotal };
}

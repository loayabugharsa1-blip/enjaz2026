import type { Order } from "@/types/order";
import { WHATSAPP_NUMBER } from "@/lib/config";
import { generateTrackingCode } from "@/lib/tracking";

export function normalizePhoneToWa(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "").replace(/^\+/, "").replace(/^0+/, "");
  return digits.startsWith("218") ? digits : `218${digits}`;
}

function fmtAttrs(
  o: Order,
  isRtl: boolean
): string {
  const lines: string[] = [];
  for (const item of o.items || []) {
    const name = isRtl ? item.nameAr : item.nameEn;
    lines.push(isRtl ? `• ${name} ×${item.quantity}` : `• ${name} ×${item.quantity}`);
    if (item.attributes?.length) {
      for (const attr of item.attributes) {
        const attrName = isRtl ? attr.nameAr : attr.valueAr;
        lines.push(isRtl ? `  ↳ ${attrName}` : `  ↳ ${attrName}`);
      }
    }
    lines.push(isRtl ? `  💰 ${item.total.toLocaleString("en-US")} د.ل` : `  💰 ${item.total.toLocaleString("en-US")} LYD`);
  }
  return lines.join("\n");
}

export function getWhatsAppLink(
  phone: string,
  order: Order,
  isRtl: boolean
): string {
  const parts: string[] = [];

  const trackingCode = generateTrackingCode(order.id);
  if (isRtl) {
    parts.push("🟢 *طلب جديد - إنجاز للدعاية و الإعلان*");
    parts.push("");
    parts.push(`📋 *رقم الطلب:* #${order.id.slice(0, 6)}`);
    parts.push(`🔑 *كود التتبع:* ${trackingCode}`);
    parts.push(`👤 *العميل:* ${order.customerName}`);
    parts.push(`📞 *الهاتف:* ${order.customerPhone}`);
    parts.push("");
    parts.push("━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━");
    parts.push("");
    parts.push("*تفاصيل الطلب:*");
    parts.push(fmtAttrs(order, true));
    parts.push("");
    parts.push("━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━");
    parts.push("");
    parts.push(`💰 *الإجمالي:* ${order.total.toLocaleString("en-US")} د.ل`);
    parts.push(`💳 *المدفوع:* ${order.deposit.toLocaleString("en-US")} د.ل`);
    parts.push(`📌 *المتبقي:* ${order.remaining.toLocaleString("en-US")} د.ل`);
    parts.push("");
    parts.push("✅ الرجاء تأكيد الطلب للبدء في التنفيذ.");
    parts.push("شكراً لثقتكم بنا 🚀");
  } else {
    parts.push("🟢 *New Order - Enjaz Advertising*");
    parts.push("");
    parts.push(`📋 *Order No:* #${order.id.slice(0, 6)}`);
    parts.push(`👤 *Customer:* ${order.customerName}`);
    parts.push(`📞 *Phone:* ${order.customerPhone}`);
    parts.push("");
    parts.push("━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━");
    parts.push("");
    parts.push("*Order Details:*");
    parts.push(fmtAttrs(order, false));
    parts.push("");
    parts.push("━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━ ━");
    parts.push("");
    parts.push(`💰 *Total:* ${order.total.toLocaleString("en-US")} LYD`);
    parts.push(`💳 *Paid:* ${order.deposit.toLocaleString("en-US")} LYD`);
    parts.push(`📌 *Remaining:* ${order.remaining.toLocaleString("en-US")} LYD`);
    parts.push("");
    parts.push("✅ Please confirm to start processing.");
    parts.push("Thank you for your trust 🚀");
  }

  const text = parts.join("\n");
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

import { generateInvoicePDF } from "@/lib/pdf/generator";
import type { Order } from "@/types/order";

export async function generateAndUploadInvoice(order: Order): Promise<string | null> {
  try {
    const blob = await generateInvoicePDF(order);
    const file = new File([blob], `invoice-${order.id.slice(0, 8)}.pdf`, { type: "application/pdf" });
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

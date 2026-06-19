import { generateInvoiceImage } from "@/lib/pdf/generator";
import type { Order } from "@/types/order";
import { fetchWithCSRF } from "@/lib/csrf";

export async function generateAndUploadInvoice(order: Order): Promise<string | null> {
  try {
    const blob = await generateInvoiceImage(order);
    const file = new File([blob], `invoice-${order.id.slice(0, 8)}.jpg`, { type: "image/jpeg" });
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetchWithCSRF("/api/upload", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

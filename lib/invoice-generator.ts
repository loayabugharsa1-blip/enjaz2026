import { generateInvoiceImage } from "@/lib/pdf/generator";
import type { Order } from "@/types/order";
import { fetchWithCSRF } from "@/lib/csrf";

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function generateAndUploadInvoice(order: Order): Promise<string | null> {
  let blob: Blob;
  try {
    blob = await generateInvoiceImage(order);
  } catch {
    return null;
  }

  // Best-effort: try cloud upload
  try {
    const file = new File([blob], `invoice-${order.id.slice(0, 8)}.jpg`, { type: "image/jpeg" });
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetchWithCSRF("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch {
    // Cloud upload failed, fallback below
  }

  // Fallback: store as data URL (works offline, no cloud dependency)
  try {
    return await blobToDataURL(blob);
  } catch {
    return null;
  }
}

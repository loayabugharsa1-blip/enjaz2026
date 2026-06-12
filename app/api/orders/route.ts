import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { calculateTotal } from "@/lib/pricing";
import { getWhatsAppLink } from "@/lib/whatsapp";
import { generateTrackingCode } from "@/lib/tracking";
import { rateLimit } from "@/lib/rate-limit";
import type { SelectedAttribute } from "@/types/order";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(ip, 10, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "طلبات كثيرة. حاول بعد دقيقة." }, { status: 429 });
  }

  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { customerName, customerPhone, serviceId, quantity = 1, notes, attributes } = body;

    if (!customerName || !customerPhone || !serviceId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attrs: SelectedAttribute[] = Array.isArray(attributes) ? attributes : [];

    const pricing = await calculateTotal([{ serviceId, quantity: Number(quantity), attributes: attrs }]);

    const id = crypto.randomUUID();
    const trackingCode = generateTrackingCode(id);
    const now = new Date().toISOString();
    const li = pricing.lineItems[0];

    const dbOrder = {
      id,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      items: [{
        itemId: serviceId,
        nameAr: li.nameAr,
        nameEn: li.nameEn,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        total: li.total,
        attributes: attrs,
      }],
      total: pricing.grandTotal,
      deposit: 0,
      remaining: pricing.grandTotal,
      status: "pending",
      created_by: "الموقع الإلكتروني",
      created_by_role: "employee",
      notes: notes || "",
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabaseAdmin.from("orders").insert(dbOrder);

    if (error) {
      console.error("[api/orders] insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orderForWhatsApp = {
      id,
      items: [{
        itemId: serviceId,
        nameAr: li.nameAr,
        nameEn: li.nameEn,
        quantity: li.quantity,
        unitPrice: li.unitPrice,
        total: li.total,
        attributes: attrs,
      }],
      total: pricing.grandTotal,
      deposit: 0,
      remaining: pricing.grandTotal,
      status: "pending" as const,
      customerName,
      customerPhone,
      createdBy: "الموقع الإلكتروني",
      createdByRole: "employee" as const,
      createdAt: now,
      updatedAt: now,
    };

    const whatsappLink = getWhatsAppLink(customerPhone, orderForWhatsApp, true);

    return NextResponse.json({
      success: true,
      id,
      trackingCode,
      trackingId: id,
      customerName,
      customerPhone,
      total: pricing.grandTotal,
      whatsappLink,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/orders] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = rateLimit(ip, 10, 60000);
    if (!allowed) {
      return NextResponse.json({ error: "محاولات كثيرة. حاول بعد دقيقة." }, { status: 429 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id, items, total, deposit, remaining, status, customerName, customerPhone, createdBy, createdByRole, notes } = body;

    if (!id || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const dbOrder = {
      id,
      customer_name: customerName?.trim() || "",
      customer_phone: customerPhone?.trim() || "",
      whatsapp_number: customerPhone?.trim() || "",
      service_type: items[0]?.nameAr || null,
      price: Number(total) || 0,
      items,
      total: Number(total) || 0,
      deposit: Number(deposit) || 0,
      remaining: Number(remaining) || 0,
      status: status || "pending",
      source: "pos",
      client_id: null,
      notes: notes || null,
      created_by: createdBy || "موظف",
      created_by_role: createdByRole || "employee",
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabaseAdmin.from("orders").insert(dbOrder);

    if (error) {
      console.error("[api/orders/create] insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/orders/create] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

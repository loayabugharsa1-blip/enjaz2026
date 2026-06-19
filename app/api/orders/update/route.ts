import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id, status, total, deposit, remaining, items, invoiceImage } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (total !== undefined) updates.total = total;
    if (deposit !== undefined) updates.deposit = deposit;
    if (remaining !== undefined) updates.remaining = remaining;
    if (items !== undefined) updates.items = items;
    if (invoiceImage !== undefined) updates.invoice_image = invoiceImage;

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[orders/update] failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ data });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[orders/update] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

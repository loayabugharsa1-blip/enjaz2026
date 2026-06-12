import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["processing"],
  processing: ["ready"],
  ready: ["completed"],
  completed: [],
};

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { orderId, newStatus, status, changedBy, changedByRole, note } = body;
    const targetStatus = newStatus || status;

    if (!orderId || !targetStatus) {
      return NextResponse.json({ error: "Missing orderId or newStatus" }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[current.status];
    if (!allowed?.includes(targetStatus)) {
      return NextResponse.json(
        { error: `لا يمكن تغيير الحالة من "${current.status}" إلى "${targetStatus}"` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: targetStatus, updated_at: now })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("[orders/status] update failed:", updateError);
      return NextResponse.json({ error: "فشل تحديث حالة الطلب" }, { status: 500 });
    }

    const { error: trackingError } = await supabaseAdmin
      .from("order_tracking")
      .insert({
        order_id: orderId,
        from_status: current.status,
        to_status: targetStatus,
        changed_by: changedBy || "system",
        changed_by_role: changedByRole || "admin",
        note: note || null,
      });

    if (trackingError) {
      console.error("[orders/status] tracking insert failed:", trackingError);
    }

    const response = NextResponse.json({ data: updated });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[orders/status] unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

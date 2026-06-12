/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { generateTrackingCode } from "@/lib/tracking";

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const trackingId = searchParams.get("tracking_id");

    if (!phone && !trackingId) {
      return NextResponse.json({ error: "Provide phone or tracking_id" }, { status: 400 });
    }

    let data: any[] = [];

    if (trackingId) {
      const raw = trackingId.trim();
      const isTrackingCode = /^ENJ-\d{5}$/i.test(raw);

      if (isTrackingCode) {
        const { data: allOrders, error } = await supabaseAdmin
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[api/track] fetch all failed:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        data = (allOrders || []).filter(
          (o: any) => generateTrackingCode(o.id) === raw.toUpperCase()
        );
      } else {
        const { data: result, error } = await supabaseAdmin
          .rpc("get_order_by_tracking_id", { tracking_id: raw });

        if (error) {
          console.error("[api/track] rpc tracking_id failed:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        data = result || [];
      }
    } else if (phone) {
      const cleaned = phone.trim().replace(/\s/g, "");
      const { data: result, error } = await supabaseAdmin
        .rpc("get_my_orders", { phone: cleaned });

      if (error) {
        console.error("[api/track] rpc phone failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      data = result || [];
    }

    const response = NextResponse.json({ data });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/track] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

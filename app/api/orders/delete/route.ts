import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[orders/delete] failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[orders/delete] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const { data, error } = await supabaseAdmin.from("services").select("*").order("created_at", { ascending: true });
  if (error) {
    console.error("[api/services] list failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const body = await request.json();
    const { id, title_ar, title_en, description_ar, description_en, icon, image_url, base_price, parent_id, attributes } = body;
    if (!id || !title_ar || !title_en) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const payload: Record<string, unknown> = {
      id, title_ar, title_en, description_ar: description_ar || "", description_en: description_en || "",
      icon: icon || "📦", image_url: image_url || null, base_price: base_price ?? 0, parent_id: parent_id || null,
      updated_at: now,
    };
    if (attributes !== undefined) {
      payload.attributes = attributes;
    }
    const { error } = await supabaseAdmin.from("services").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("[api/services] upsert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("[api/services] upsert unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const { error: err1 } = await supabaseAdmin.from("services").delete().eq("id", id);
    if (err1) console.error("[api/services] delete failed:", err1);
    const { error: err2 } = await supabaseAdmin.from("services").delete().eq("parent_id", id);
    if (err2) console.error("[api/services] delete children failed:", err2);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/services] delete unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

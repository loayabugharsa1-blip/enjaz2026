import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("portfolio")
        .select("*")
        .order("order", { ascending: true });

      if (!error && data) {
        return NextResponse.json({ data });
      }
    }
  } catch (err) {
    console.warn("[api/portfolio] GET failed:", err);
  }

  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items must be an array" }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin.from("portfolio").delete().neq("id", "_");
    if (deleteError) {
      console.error("[api/portfolio] delete all failed:", deleteError);
    }

    if (items.length > 0) {
      const rows = items.map((item: { id: string; src: string; altAr?: string; altEn?: string; order?: number }) => ({
        id: item.id,
        src: item.src,
        alt_ar: item.altAr || "",
        alt_en: item.altEn || "",
        order: item.order ?? 0,
      }));
      const { error: insertError } = await supabaseAdmin.from("portfolio").insert(rows);
      if (insertError) {
        console.error("[api/portfolio] insert failed:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    console.error("[api/portfolio] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

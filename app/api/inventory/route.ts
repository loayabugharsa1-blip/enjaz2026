import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

async function validateCategoryId(categoryId: string | undefined): Promise<string | null> {
  if (!categoryId) return null;
  const { data } = await supabaseAdmin
    .from("services")
    .select("id")
    .eq("id", categoryId)
    .single();
  return data ? categoryId : null;
}

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const body = await request.json();
    const { category_id } = body;

    if (category_id) {
      const valid = await validateCategoryId(category_id);
      if (!valid) {
        return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
      }
    }

    const { error } = await supabaseAdmin.from("inventory_items").insert(body);
    if (error) {
      console.error("[inventory] insert failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[inventory] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const body = await request.json();
    const { id, category_id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }

    if (category_id) {
      const valid = await validateCategoryId(category_id);
      if (!valid) {
        return NextResponse.json({ error: "التصنيف غير موجود" }, { status: 400 });
      }
      updates.category_id = category_id;
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("inventory_items")
      .update(updates)
      .eq("id", id);
    if (error) {
      console.error("[inventory] update failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[inventory] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing item id" }, { status: 400 });
    }
    const { error } = await supabaseAdmin
      .from("inventory_items")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[inventory] delete failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[inventory] unexpected:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

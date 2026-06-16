import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { verifySession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("injaz_session")?.value;
    if (!cookie) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const decoded = decodeURIComponent(cookie);
    const payload = await verifySession(decoded);
    if (!payload) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    const session = JSON.parse(payload);
    if (session.role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { users } = body;
    if (!Array.isArray(users)) {
      return NextResponse.json({ error: "users array required" }, { status: 400 });
    }

    if (users.length > 0) {
      const { error: upsertError } = await supabaseAdmin.from("users").upsert(
        users.map((u: Record<string, unknown>) => ({
          id: u.id,
          username: u.username,
          password_hash: u.password_hash,
          role: u.role,
          name: u.name,
          is_active: true,
          created_at: u.createdAt || new Date().toISOString(),
        })),
        { onConflict: "username" }
      );
      if (upsertError) {
        console.error("[api/users/sync] upsert failed:", upsertError);
        return NextResponse.json({ error: upsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, count: users.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

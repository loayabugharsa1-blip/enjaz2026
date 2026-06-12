/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { verifySession } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const rawCookie = request.cookies.get("injaz_session")?.value;
    if (!rawCookie) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const decoded = decodeURIComponent(rawCookie);
    const payload = await verifySession(decoded);
    if (!payload) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const session = JSON.parse(payload) as { role: string; userId: string; username: string; name: string };

    const body = await request.json();
    const { targetUsername, newPassword, currentPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    let targetUser: any;

    if (targetUsername) {
      if (session.role !== "admin") {
        return NextResponse.json({ error: "غير مصرح. صلاحيات المسؤول مطلوبة." }, { status: 403 });
      }
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("username", targetUsername)
        .limit(1);
      if (!users?.length) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }
      targetUser = users[0];
    } else {
      if (!currentPassword) {
        return NextResponse.json({ error: "كلمة المرور الحالية مطلوبة" }, { status: 400 });
      }
      const { data: users } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", session.userId)
        .limit(1);
      if (!users?.length) {
        return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      }
      targetUser = users[0];
      const valid = await bcrypt.compare(currentPassword, targetUser.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 401 });
      }
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ password_hash: newHash, updated_at: new Date().toISOString() })
      .eq("id", targetUser.id);

    if (updateError) {
      console.error("[api/auth/change-password] update failed:", updateError);
      return NextResponse.json({ error: "فشل تحديث كلمة المرور" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/auth/change-password] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

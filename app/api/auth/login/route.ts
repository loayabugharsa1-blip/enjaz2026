import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed } = rateLimit(ip, 5, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "محاولات كثيرة. حاول بعد دقيقة." }, { status: 429 });
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "اسم المستخدم وكلمة المرور مطلوبان" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("username", username)
      .limit(1);

    if (error) {
      // Database connection/permission error — tell client to fall back to localStorage
      console.error("[api/auth/login] Supabase error:", error);
      return NextResponse.json({ error: "قاعدة البيانات غير متصلة" }, { status: 500 });
    }

    if (!users?.length) {
      return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      // Password mismatch — Supabase data may be stale; client falls back to localStorage
      console.warn("[api/auth/login] password mismatch for", username);
      return NextResponse.json({ error: "بيانات الدخول غير متطابقة مع الخادم" }, { status: 500 });
    }

    const session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      loginAt: new Date().toISOString(),
    };

    const { signSession } = await import("@/lib/auth/session");
    const signed = await signSession(JSON.stringify(session));
    const encoded = encodeURIComponent(signed);

    const response = NextResponse.json({ success: true, session });
    response.cookies.set("injaz_session", encoded, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      secure: true,
      httpOnly: true,
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/auth/login] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

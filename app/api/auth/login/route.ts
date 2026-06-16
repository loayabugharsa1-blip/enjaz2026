import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

const LOCAL_FALLBACK_USERS = [
  { username: "admin", role: "admin" as const, name: "مدير النظام", password: "@dminP@ss2026!" },
  { username: "employee", role: "employee" as const, name: "موظف", password: "Emp!oyee2026!" },
  { username: "staff", role: "staff" as const, name: "موظف عادي", password: "St@ff2026!!" },
];

async function setCookie(response: NextResponse, session: Record<string, string>) {
  const { signSession } = await import("@/lib/auth/session");
  const signed = await signSession(JSON.stringify(session));
  const encoded = encodeURIComponent(signed);
  response.cookies.set("injaz_session", encoded, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });
}

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

    // 1. Try Supabase first
    if (supabaseAdmin) {
      try {
        const { data: users, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("username", username)
          .limit(1);

        if (!error && users?.length) {
          const user = users[0];
          const valid = await bcrypt.compare(password, user.password_hash);
          if (valid) {
            const session = {
              userId: user.id,
              username: user.username,
              role: user.role,
              name: user.name,
              loginAt: new Date().toISOString(),
            };
            const response = NextResponse.json({ success: true, session });
            await setCookie(response, session);
            return response;
          }
        }
      } catch (supaErr) {
        console.error("[api/auth/login] Supabase error:", supaErr);
      }
    }

    // 2. Fallback: check hardcoded default users
    const localUser = LOCAL_FALLBACK_USERS.find((u) => u.username === username);
    if (localUser) {
      // Compare as plaintext (bcrypt.compare would need async hash generation)
      if (password !== localUser.password) {
        return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
      }
      const session = {
        userId: `local-${localUser.username}`,
        username: localUser.username,
        role: localUser.role,
        name: localUser.name,
        loginAt: new Date().toISOString(),
      };
      const response = NextResponse.json({ success: true, session });
      await setCookie(response, session);
      return response;
    }

    return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[api/auth/login] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/supabase/storage";
import { rateLimit } from "@/lib/rate-limit";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { allowed, remaining } = rateLimit(ip, 30, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "طلبات كثيرة. حاول بعد دقيقة." }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع ملف" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "الملف كبير جداً. الحد الأقصى 10MB" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. JPG, PNG, WebP, PDF فقط" }, { status: 400 });
    }

    const result = await uploadFile(file);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const response = NextResponse.json({ url: result.url });
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  } catch {
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}

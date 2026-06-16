import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/supabase/storage";
import { rateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 10 * 1024 * 1024;

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xFF, 0xD8, 0xFF])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
};

function validateMagicBytes(buffer: ArrayBuffer, mime: string): boolean {
  const sigs = MAGIC_BYTES[mime];
  if (!sigs) return false;
  const header = new Uint8Array(buffer.slice(0, 8));
  return sigs.some((sig) => sig.every((b, i) => header[i] === b));
}

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

    if (!MAGIC_BYTES[file.type]) {
      return NextResponse.json({ error: "نوع الملف غير مدعوم. JPG, PNG, WebP, PDF فقط" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "محتويات الملف لا تتطابق مع نوعه المعلن" }, { status: 400 });
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

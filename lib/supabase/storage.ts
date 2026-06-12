import { supabaseAdmin } from "./server-client";

const BUCKET = "uploads";

async function ensureBucket(): Promise<boolean> {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (buckets?.find((b) => b.name === BUCKET)) return true;
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    return !error;
  } catch {
    return false;
  }
}

export async function uploadFile(file: File): Promise<{ url: string } | { error: string }> {
  const ready = await ensureBucket();
  if (!ready) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    return { url: `data:${file.type};base64,${base64}` };
  }

  const ext = file.name.split(".").pop() || "bin";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    return { url: `data:${file.type};base64,${base64}` };
  }

  const { data: publicUrl } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { url: publicUrl.publicUrl };
}

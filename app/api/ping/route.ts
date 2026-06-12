export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", timestamp: Date.now(), app: "إنجاز للدعاية و الاعلان" }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

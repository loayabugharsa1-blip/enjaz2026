import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";
import { generateTrackingCode } from "@/lib/tracking";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: allOrders } = await supabaseAdmin
      .from("orders")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (!allOrders) {
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    const totalOrders = allOrders.length;
    const todayOrders = allOrders.filter((o) => o.created_at >= todayStart && o.created_at < todayEnd);
    const todayCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const todayDeposit = todayOrders.reduce((sum, o) => sum + (Number(o.deposit) || 0), 0);

    const statusDist: Record<string, number> = {};
    for (const o of allOrders) {
      statusDist[o.status] = (statusDist[o.status] || 0) + 1;
    }

    const dailySales: { date: string; count: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const dayOrders = allOrders.filter((o) => o.created_at >= start && o.created_at < end);
      dailySales.push({
        date: d.toLocaleDateString("en-CA"),
        count: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
      });
    }

    const recentOrders = allOrders.slice(0, 10).map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      total: o.total,
      status: o.status,
      created_at: o.created_at,
      tracking_code: generateTrackingCode(o.id),
    }));

    const response = NextResponse.json({
      totalOrders,
      todayCount,
      todayRevenue,
      todayDeposit,
      statusDist,
      dailySales,
      recentOrders,
    });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

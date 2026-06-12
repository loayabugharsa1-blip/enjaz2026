import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-client";

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("customer_name, customer_phone, total, created_at, status")
      .order("created_at", { ascending: false });

    if (!orders) {
      return NextResponse.json({ data: [] });
    }

    const customersMap = new Map<
      string,
      { name: string; phone: string; totalSpent: number; orderCount: number; lastOrder: string }
    >();

    for (const o of orders) {
      if (!o.customer_phone) continue;
      const phone = o.customer_phone;
      const existing = customersMap.get(phone);
      if (existing) {
        existing.totalSpent += Number(o.total) || 0;
        existing.orderCount += 1;
      } else {
        customersMap.set(phone, {
          name: o.customer_name || "زبون",
          phone,
          totalSpent: Number(o.total) || 0,
          orderCount: 1,
          lastOrder: o.created_at,
        });
      }
    }

    const customers = Array.from(customersMap.values()).map((c) => ({
      ...c,
      totalSpent: Math.round(c.totalSpent * 100) / 100,
    }));
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    const response = NextResponse.json({ data: customers, count: customers.length });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

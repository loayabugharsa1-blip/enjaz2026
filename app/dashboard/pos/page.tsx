"use client";
import { useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { POSCalculator } from "@/components/dashboard/pos-calculator";

import type { OrderItem } from "@/types/order";

export default function POSPage() {
  const { isRtl } = useDirection();
  const { session } = useAuth();
  const { create } = useOrders();

  const handleComplete = useCallback(async (items: OrderItem[], total: number, deposit: number, remaining: number, customerName: string, customerPhone: string) => {
    const order = await create({
      items,
      total,
      deposit,
      remaining,
      status: "pending",
      customerName,
      customerPhone,
      createdBy: session?.name || session?.username || "موظف",
      createdByRole: session?.role || "employee",
    });
    const { printOrderAsHTML } = await import("@/lib/pdf/generator");
    printOrderAsHTML(order, isRtl);
  }, [create, session, isRtl]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">{isRtl ? "نقطة البيع" : "Point of Sale"}</h1>
      <POSCalculator onComplete={handleComplete} />
    </div>
  );
}

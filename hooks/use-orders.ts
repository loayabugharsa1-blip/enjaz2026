"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getAllOrders, addOrder, updateOrderStatusWithTracking, deleteOrder } from "@/lib/db";
import { useAuth } from "@/hooks/use-auth";
import type { Order, OrderStatus } from "@/types/order";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);
  const { session } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const data = await getAllOrders();
      if (mounted.current) {
        setOrders(data);
        setError(null);
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "فشل تحميل الطلبات");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();

    const interval = setInterval(refresh, 30000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const create = useCallback(async (order: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const result = await addOrder(newOrder);
    if (!result.cloudSaved) {
      console.warn("Order saved locally, will sync later:", newOrder.id);
    }
    await refresh();
    return newOrder;
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatusWithTracking(
        id,
        status,
        session?.name || session?.username || "موظف",
        session?.role || "employee"
      );
    } catch {
      const oldOrder = orders.find((o) => o.id === id);
      if (oldOrder) {
        const updated: Order = { ...oldOrder, status, updatedAt: new Date().toISOString() };
        const { updateOrder } = await import("@/lib/db");
        await updateOrder(updated);
      }
    }
    await refresh();
  }, [orders, session, refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteOrder(id);
    await refresh();
  }, [refresh]);

  return { orders, loading, error, refresh, create, updateStatus, remove };
}

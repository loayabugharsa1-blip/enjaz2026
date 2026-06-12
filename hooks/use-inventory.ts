"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getAllInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/db";
import type { InventoryItem } from "@/types/inventory";

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    const data = await getAllInventory();
    if (mounted.current) {
      setItems(data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();

    const interval = setInterval(refresh, 30000);
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const add = useCallback(async (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addInventoryItem(newItem);
    await refresh();
    return newItem;
  }, [refresh]);

  const update = useCallback(async (item: InventoryItem) => {
    item.updatedAt = new Date().toISOString();
    await updateInventoryItem(item);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteInventoryItem(id);
    await refresh();
  }, [refresh]);

  const deductQuantity = useCallback(async (id: string, qty: number) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.quantity < qty) return false;
    const updated: InventoryItem = {
      ...item,
      quantity: item.quantity - qty,
      updatedAt: new Date().toISOString(),
    };
    await updateInventoryItem(updated);
    await refresh();
    return true;
  }, [items, refresh]);

  return { items, loading, refresh, add, update, remove, deductQuantity };
}

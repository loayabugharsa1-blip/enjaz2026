"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Order } from "@/types/order";

function playSound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (err) {
    console.warn("[notifications] playSound failed:", err);
  }
}

export function useOrderNotifications(orders: Order[]) {
  const [newCount, setNewCount] = useState(0);
  const lastCountRef = useRef(orders.length);
  const notifiedIds = useRef(new Set<string>());

  const clearNewOrders = useCallback(() => {
    setNewCount(0);
    notifiedIds.current.clear();
  }, []);

  useEffect(() => {
    if (!supabase?.channel) return;

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as Record<string, unknown>;
          const orderId = newOrder.id as string;

          if (notifiedIds.current.has(orderId)) return;
          notifiedIds.current.add(orderId);

          const createdBy = (newOrder.created_by as string) || "";
          const status = (newOrder.status as string) || "";

          if (createdBy !== "الموقع الإلكتروني") return;
          if (status !== "pending") return;

          setNewCount((prev) => {
            const count = prev + 1;
            if (typeof document !== "undefined") {
              const orig = document.title;
              document.title = `🆕 ${count} طلب جديد! | ${orig}`;
              setTimeout(() => (document.title = orig), 5000);
            }
            return count;
          });
          playSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (orders.length > lastCountRef.current) {
      const diff = orders.length - lastCountRef.current;
      const newOrders = orders.slice(0, diff);
      for (const o of newOrders) {
        if (!notifiedIds.current.has(o.id)) {
          notifiedIds.current.add(o.id);
          if (o.createdBy === "الموقع الإلكتروني" && o.status === "pending") {
            setNewCount((prev) => prev + 1);
            playSound();
          }
        }
      }
    }
    lastCountRef.current = orders.length;
  }, [orders]);

  return { newCount, clearNewOrders };
}

import type { Order } from "@/types/order";

let activeOrder: Order | null = null;
const listeners = new Set<() => void>();

export function setActiveOrder(order: Order | null) {
  activeOrder = order;
  listeners.forEach((fn) => fn());
}

export function getActiveOrder(): Order | null {
  return activeOrder;
}

export function onActiveOrderChange(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

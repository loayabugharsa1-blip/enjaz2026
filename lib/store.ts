type Listener = () => void;

class AppStore {
  private listeners = new Map<string, Set<Listener>>();

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  emit(event: string) {
    this.listeners.get(event)?.forEach((fn) => fn());
    this.listeners.get("all")?.forEach((fn) => fn());
  }

  async refreshAll() {
    const { getAllOrders, getAllInventory } = await import("@/lib/db");
    await Promise.allSettled([getAllOrders(), getAllInventory()]);
    this.emit("orders");
    this.emit("inventory");
  }
}

export const appStore = new AppStore();

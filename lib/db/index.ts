import { supabase } from "@/lib/supabase";
import { handleAppError, NotFoundError, ValidationError, AppError } from "@/lib/errors/app-error";
import type { InventoryItem } from "@/types/inventory";
import type { Order, OrderItem, OrderStatus } from "@/types/order";
import type { DbOrder, DbInventoryItem, DbInvoice, DbOrderTrackingEntry } from "@/types/database";
import type { Role } from "@/types/auth";
import { saveAutoBackup } from "@/lib/auto-backup";
import { fetchWithCSRF } from "@/lib/csrf";


const DB_NAME = "injaz_db";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("inventory")) {
        db.createObjectStore("inventory", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("orders")) {
        db.createObjectStore("orders", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        db.createObjectStore("sync_queue", { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function isOnline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine;
}

// --- Mapping functions between DB snake_case and TS camelCase ---

function mapDbInventoryToItem(dbItem: DbInventoryItem): InventoryItem {
  return {
    id: dbItem.id,
    nameAr: dbItem.name_ar,
    nameEn: dbItem.name_en || dbItem.name_ar,
    category: dbItem.category,
    categoryId: dbItem.category_id || undefined,
    quantity: dbItem.quantity,
    unitPrice: Number(dbItem.unit_price),
    costPrice: Number(dbItem.cost_price),
    description: dbItem.description || "",
    imageUrl: dbItem.image_url || "",
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
  };
}

function mapItemToDbInventory(item: InventoryItem): DbInventoryItem {
  return {
    id: item.id,
    name_ar: item.nameAr,
    name_en: item.nameEn,
    category: item.category,
    category_id: item.categoryId || null,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    cost_price: item.costPrice,
    description: item.description || "",
    image_url: item.imageUrl || "",
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

function mapDbOrderToOrder(dbOrder: DbOrder): Order {
  return {
    id: dbOrder.id,
    items: Array.isArray(dbOrder.items) ? dbOrder.items : [],
    total: Number(dbOrder.total),
    deposit: Number(dbOrder.deposit),
    remaining: Number(dbOrder.remaining),
    status: dbOrder.status,
    customerName: dbOrder.customer_name || "",
    customerPhone: dbOrder.customer_phone || dbOrder.whatsapp_number || "",
    createdBy: dbOrder.created_by,
    createdByRole: dbOrder.created_by_role,
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
    invoiceImage: dbOrder.invoice_image || undefined,
  };
}

// --- Inventory CRUD ---

export async function getAllInventory(): Promise<InventoryItem[]> {
  let cloudItems: InventoryItem[] | null = null;

  try {
    if (isOnline()) {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        cloudItems = (data || []).map(mapDbInventoryToItem);
      }
    }
  } catch (err) {
    console.warn("[getAllInventory] Cloud unavailable, falling back to local:", err);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("inventory", "readonly");
    const store = tx.objectStore("inventory");
    const localItems = await new Promise<InventoryItem[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل قراءة المخزن من التخزين المحلي"));
    });

    if (cloudItems && cloudItems.length > 0) {
      const cloudIds = new Set(cloudItems.map((i) => i.id));
      const localOnly = localItems.filter((i) => !cloudIds.has(i.id));

      // Single readwrite transaction — eliminates race between read and write
      const writeTx = db.transaction("inventory", "readwrite");
      const writeStore = writeTx.objectStore("inventory");
      writeStore.clear();
      for (const item of cloudItems) {
        writeStore.put(item);
      }
      for (const item of localOnly) {
        writeStore.put(item);
      }
      await new Promise<void>((resolve, reject) => {
        writeTx.oncomplete = () => resolve();
        writeTx.onerror = () => reject(new AppError("DB_ERROR", "فشل تحديث المخزون المحلي"));
      });
      return [...cloudItems, ...localOnly];
    }

    return localItems;
  } finally {
    db.close();
  }
}

export async function getInventoryItem(id: string): Promise<InventoryItem | undefined> {
  try {
    if (isOnline()) {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined;
        throw new AppError("DB_ERROR", error.message);
      }

      if (data) return mapDbInventoryToItem(data as DbInventoryItem);
    }
  } catch (err) {
    console.warn("Supabase fetch failed, falling back to IndexedDB:", handleAppError(err).message);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("inventory", "readonly");
    const store = tx.objectStore("inventory");
    return await new Promise<InventoryItem | undefined>((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل قراءة الصنف من التخزين المحلي"));
    });
  } finally {
    db.close();
  }
}

function inventoryApiUrl(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin + "/api/inventory";
}

export async function addInventoryItem(item: InventoryItem): Promise<void> {
  try {
    if (isOnline()) {
      const dbItem = mapItemToDbInventory(item);
      const res = await fetchWithCSRF(inventoryApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbItem),
      });
      if (!res.ok) {
        throw new AppError("DB_ERROR", "فشل حفظ الصنف في السحابة");
      }
    }
  } catch (err) {
    console.warn("Cloud inventory add failed, saving locally:", handleAppError(err).message);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("inventory", "readwrite");
    const store = tx.objectStore("inventory");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل حفظ الصنف محلياً"));
    });
  } finally {
    db.close();
  }
}

export async function updateInventoryItem(item: InventoryItem): Promise<void> {
  try {
    if (isOnline()) {
      const dbItem = mapItemToDbInventory(item);
      const res = await fetchWithCSRF(inventoryApiUrl(), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dbItem),
      });
      if (!res.ok) {
        throw new AppError("DB_ERROR", "فشل تحديث الصنف في السحابة");
      }
    }
  } catch (err) {
    console.warn("Cloud inventory update failed, saving locally:", handleAppError(err).message);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("inventory", "readwrite");
    const store = tx.objectStore("inventory");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل تحديث الصنف محلياً"));
    });
  } finally {
    db.close();
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    if (isOnline()) {
      const res = await fetchWithCSRF(`${inventoryApiUrl()}?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new AppError("DB_ERROR", "فشل حذف الصنف من السحابة");
      }
    }
  } catch (err) {
    console.warn("Cloud inventory delete failed, removing locally:", handleAppError(err).message);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("inventory", "readwrite");
    const store = tx.objectStore("inventory");
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل حذف الصنف محلياً"));
    });
  } finally {
    db.close();
  }
}

// --- Orders CRUD ---

export async function getAllOrders(): Promise<Order[]> {
  let cloudOrders: Order[] | null = null;

  // Try processing sync queue first if online
  if (isOnline()) {
    processSyncQueue().catch((err) => console.warn("[processSyncQueue] error:", err));
  }

  try {
    if (isOnline()) {
      const res = await fetch("/api/orders/list", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        cloudOrders = (json.data || []).map((d: DbOrder) => mapDbOrderToOrder(d));
      }
    }
  } catch (err) {
    console.warn("[getAllOrders] Cloud unavailable, falling back to local:", err);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readonly");
    const store = tx.objectStore("orders");
    const localOrders = await new Promise<Order[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل قراءة الطلبات من التخزين المحلي"));
    });

    if (cloudOrders && cloudOrders.length > 0) {
      // Merge: keep local-only orders that don't exist in cloud
      const cloudIds = new Set(cloudOrders.map((o) => o.id));
      const localOnly = localOrders.filter((o) => !cloudIds.has(o.id));

      const writeTx = db.transaction("orders", "readwrite");
      const writeStore = writeTx.objectStore("orders");
      writeStore.clear();
      for (const order of cloudOrders) {
        const local = localOrders.find((o) => o.id === order.id);
        if (local?.invoiceImage && !order.invoiceImage) {
          writeStore.put({ ...order, invoiceImage: local.invoiceImage });
        } else {
          writeStore.put(order);
        }
      }
      for (const order of localOnly) {
        writeStore.put(order);
      }
      await new Promise<void>((resolve, reject) => {
        writeTx.oncomplete = () => resolve();
        writeTx.onerror = () => reject(new AppError("DB_ERROR", "فشل تحديث الطلبات المحلية"));
      });
      const merged = cloudOrders.map((order) => {
        const local = localOrders.find((o) => o.id === order.id);
        if (local?.invoiceImage && !order.invoiceImage) {
          return { ...order, invoiceImage: local.invoiceImage };
        }
        return order;
      });
      return [...merged, ...localOnly];
    }

    return localOrders;
  } finally {
    db.close();
  }
}

export async function addOrder(order: Order): Promise<{ cloudSaved: boolean }> {
  let cloudSaved = false;

  try {
    if (isOnline()) {
      const res = await fetchWithCSRF("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (res.ok) {
        cloudSaved = true;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new AppError("DB_ERROR", errData.error || "فشل حفظ الطلب في السحابة");
      }
    }
  } catch (err) {
    const appErr = handleAppError(err);
    console.warn("Cloud save failed, saving locally + sync queue:", appErr.message);
    await addToSyncQueue(order);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(order);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل حفظ الطلب محلياً"));
    });
  } finally {
    db.close();
  }

  return { cloudSaved };
}

async function addToSyncQueue(order: Order): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction("sync_queue", "readwrite");
    const store = tx.objectStore("sync_queue");
    store.add({ order, createdAt: new Date().toISOString() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn("[addToSyncQueue] Failed to queue order for sync:", err);
  }
}

export async function processSyncQueue(): Promise<number> {
  let processed = 0;
  try {
    const db = await openDB();
    const tx = db.transaction("sync_queue", "readonly");
    const store = tx.objectStore("sync_queue");
    const entries = await new Promise<{ id: number; order: Order; createdAt: string }[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    db.close();

    const syncedIds: number[] = [];
    for (const entry of entries) {
      try {
        const res = await fetchWithCSRF("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry.order),
        });
        if (res.ok) {
          syncedIds.push(entry.id);
          processed++;
        }
      } catch {
        // Leave in queue for next retry
      }
    }

    if (syncedIds.length > 0) {
      const delDb = await openDB();
      const delTx = delDb.transaction("sync_queue", "readwrite");
      const delStore = delTx.objectStore("sync_queue");
      for (const id of syncedIds) {
        delStore.delete(id);
      }
      await new Promise<void>((resolve, reject) => {
        delTx.oncomplete = () => resolve();
        delTx.onerror = () => reject(delTx.error);
      });
      delDb.close();
    }
  } catch (err) {
    console.warn("[processSyncQueue] Failed:", err);
  }
  return processed;
}

export async function updateOrder(order: Order): Promise<void> {
  try {
    if (isOnline()) {
      const res = await fetchWithCSRF("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: order.status,
          total: order.total,
          deposit: order.deposit,
          remaining: order.remaining,
          items: order.items,
          invoiceImage: order.invoiceImage,
        }),
      });
      if (!res.ok) {
        throw new AppError("DB_ERROR", "فشل تحديث الطلب في السحابة");
      }
    }
  } catch (err) {
    const appErr = handleAppError(err);
    console.error("[updateOrder]", appErr.message);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(order);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل تحديث الطلب محلياً"));
    });
  } finally {
    db.close();
  }
}

export async function updateOrderStatusWithTracking(
  orderId: string,
  newStatus: OrderStatus,
  changedBy: string,
  changedByRole: Role,
  note?: string
): Promise<Order> {
  if (!navigator.onLine) {
    throw new AppError("NETWORK_ERROR", "لا يمكن تحديث الحالة بدون اتصال بالإنترنت");
  }

  const res = await fetchWithCSRF("/api/orders/status", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
    body: JSON.stringify({ orderId, newStatus, changedBy, changedByRole, note }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData.error || "فشل تحديث حالة الطلب";
    if (res.status === 400) throw new ValidationError(msg);
    if (res.status === 404) throw new NotFoundError("الطلب", orderId);
    throw new AppError("INTERNAL_ERROR", msg);
  }

  const json = await res.json();
  const result: Order = mapDbOrderToOrder(json.data as DbOrder);

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    await new Promise<void>((resolve, reject) => {
      const req = store.put(result);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل تحديث الطلب محلياً"));
    });
  } finally {
    db.close();
  }

  return result;
}

export async function getOrdersByPhone(phone: string): Promise<Order[]> {
  if (!phone.trim()) return [];

  try {
    if (isOnline()) {
      const res = await fetch(`/api/track?phone=${encodeURIComponent(phone.trim())}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        const results: Order[] = (json.data || []).map((d: DbOrder) => mapDbOrderToOrder(d));
        if (results.length > 0) return results;
      }
    }
    } catch (err) {
    console.warn("[getOrdersByPhone] Cloud unavailable, falling back to local:", err);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readonly");
    const store = tx.objectStore("orders");
    const all = await new Promise<Order[]>((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل البحث في الطلبات المحلية"));
    });
    const cleanedPhone = phone.trim().replace(/\s/g, "");
    return all.filter(
      (o) =>
        (o.customerPhone && o.customerPhone.replace(/\s/g, "").includes(cleanedPhone)) ||
        (o.customerName && o.customerName.includes(phone.trim()))
    );
  } finally {
    db.close();
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    if (isOnline()) {
      const res = await fetchWithCSRF("/api/orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        console.warn("[deleteOrder] Cloud delete failed", await res.text());
      }
    }
    } catch (err) {
    console.warn("[deleteOrder] Cloud unavailable, removing locally:", err);
  }

  const db = await openDB();
  try {
    const tx = db.transaction("orders", "readwrite");
    const store = tx.objectStore("orders");
    await new Promise<void>((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(new AppError("DB_ERROR", "فشل حذف الطلب محلياً"));
    });
  } finally {
    db.close();
  }
}

// --- Data export/import ---

export async function exportAllData(): Promise<{ inventory: InventoryItem[]; orders: Order[] }> {
  const inventory = await getAllInventory();
  const orders = await getAllOrders();
  const data = { inventory, orders };
  saveAutoBackup(data);
  return data;
}

export async function importAllData(data: { inventory: InventoryItem[]; orders: Order[] }): Promise<void> {
  for (const item of data.inventory) {
    await addInventoryItem(item);
  }
  for (const order of data.orders) {
    await addOrder(order);
  }
}

// --- Invoice helpers (تعمل مع Supabase مباشرة) ---

export async function createInvoiceForOrder(
  orderId: string,
  taxRate: number = 0,
  discount: number = 0,
  amountPaid: number = 0
): Promise<DbInvoice> {
  if (!navigator.onLine) {
    throw new AppError("NETWORK_ERROR", "لا يمكن إنشاء فاتورة بدون اتصال بالإنترنت");
  }

  const orders = await getAllOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) {
    throw new NotFoundError("الطلب", orderId);
  }

  const subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount - discount;
  const amountDue = Math.max(0, grandTotal - amountPaid);
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${orderId.slice(0, 4).toUpperCase()}`;

  const { data: invoiceData, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      order_id: orderId,
      invoice_number: invoiceNumber,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount,
      grand_total: grandTotal,
      amount_paid: amountPaid,
      amount_due: amountDue,
      created_by: order.createdBy,
      notes: null,
    })
    .select()
    .single();

  if (invoiceError) {
    throw new AppError("DB_ERROR", "فشل إنشاء الفاتورة", invoiceError);
  }

  const invoiceItems = order.items.map((item: OrderItem) => ({
    invoice_id: invoiceData.id,
    item_id: item.itemId || null,
    name_ar: item.nameAr,
    name_en: item.nameEn,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
  }));

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(invoiceItems);

  if (itemsError) {
    throw new AppError("DB_ERROR", "فشل حفظ بنود الفاتورة", itemsError);
  }

  return invoiceData as DbInvoice;
}

export async function getOrderTrackingHistory(orderId: string): Promise<DbOrderTrackingEntry[]> {
  const { data, error } = await supabase
    .from("order_tracking")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError("DB_ERROR", "فشل جلب سجل التتبع", error);
  }

  return (data || []).map((d: Record<string, unknown>) => ({
    id: d.id as string,
    orderId: d.order_id as string,
    fromStatus: d.from_status as string | null,
    toStatus: d.to_status as string,
    changedBy: d.changed_by as string,
    changedByRole: d.changed_by_role as string,
    note: d.note as string | null,
    createdAt: d.created_at as string,
  }));
}

export async function syncFromCloud(): Promise<{ inventory: number; orders: number }> {
  let inventoryCount = 0;
  let ordersCount = 0;

  try {
    const { data: invData } = await supabase
      .from("inventory_items")
      .select("*");

    if (invData && invData.length > 0) {
      const items = (invData as DbInventoryItem[]).map(mapDbInventoryToItem);
      const db = await openDB();
      const tx = db.transaction("inventory", "readwrite");
      const store = tx.objectStore("inventory");
      store.clear();
      for (const item of items) {
        store.put(item);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
      inventoryCount = items.length;
    }
  } catch (err) {
    console.warn("Sync inventory failed:", handleAppError(err).message);
  }

  try {
    if (isOnline()) {
      const res = await fetch("/api/orders/list", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const json = await res.json();
        const ordData: Order[] = (json.data || []).map((d: DbOrder) => mapDbOrderToOrder(d));
        if (ordData.length > 0) {
          const db = await openDB();
          const tx = db.transaction("orders", "readwrite");
          const store = tx.objectStore("orders");
          store.clear();
          for (const order of ordData) {
            store.put(order);
          }
          await new Promise<void>((resolve, reject) => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          });
          db.close();
          ordersCount = ordData.length;
        }
      }
    }
  } catch (err) {
    console.warn("Sync orders failed:", handleAppError(err).message);
  }

  return { inventory: inventoryCount, orders: ordersCount };
}

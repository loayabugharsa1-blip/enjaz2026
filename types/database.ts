import type { OrderItem } from "./order";
import type { Role } from "./auth";

export interface DbUser {
  id: string;
  username: string;
  password_hash: string;
  role: Role;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface DbClient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbInventoryItem {
  id: string;
  name_ar: string;
  name_en: string;
  category: string;
  category_id?: string | null;
  quantity: number;
  unit_price: number;
  cost_price: number;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type DbOrderStatus = "pending" | "processing" | "ready" | "completed";
export type DbOrderSource = "pos" | "online";

export interface DbOrder {
  id: string;
  customer_name: string | null;
  whatsapp_number: string | null;
  service_type: string | null;
  price: number | null;
  items: OrderItem[];
  total: number;
  deposit: number;
  remaining: number;
  status: DbOrderStatus;
  source: DbOrderSource;
  client_id: string | null;
  customer_phone: string;
  notes: string | null;
  invoice_image: string | null;
  created_by: string;
  created_by_role: Role;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  item_id: string | null;
  name_ar: string;
  name_en: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface DbOrderTracking {
  id: string;
  order_id: string;
  from_status: DbOrderStatus | null;
  to_status: DbOrderStatus;
  changed_by: string;
  changed_by_role: Role;
  note: string | null;
  created_at: string;
}

export interface DbOrderTrackingEntry {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  changedByRole: string;
  note: string | null;
  createdAt: string;
}

export interface DbInvoice {
  id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  grand_total: number;
  amount_paid: number;
  amount_due: number;
  notes: string | null;
  print_count: number;
  last_printed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DbInvoiceItem {
  id: string;
  invoice_id: string;
  item_id: string | null;
  name_ar: string;
  name_en: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface DbActivityLog {
  id: string;
  user_id: string | null;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: unknown;
  ip_address: string | null;
  created_at: string;
}

export interface DbSyncLog {
  id: string;
  device_id: string;
  entity_type: string;
  last_sync: string;
  status: "success" | "partial" | "failed";
  details: unknown;
  created_at: string;
}

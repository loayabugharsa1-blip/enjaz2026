import type { Role } from "./auth";

export type OrderStatus = "pending" | "processing" | "ready" | "completed";

export const STATUS_LABELS: Record<OrderStatus, { ar: string; en: string }> = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  processing: { ar: "جاري التنفيذ", en: "Processing" },
  ready: { ar: "جاهز للتسليم", en: "Ready" },
  completed: { ar: "مكتمل ومسلم", en: "Completed" },
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ready: "bg-green-500/20 text-green-400 border-green-500/30",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export interface SelectedAttribute {
  nameAr: string;
  valueAr: string;
  value: string;
  priceModifier: number;
}

export interface OrderItem {
  itemId: string;
  nameAr: string;
  nameEn: string;
  quantity: number;
  unitPrice: number;
  total: number;
  attributes?: SelectedAttribute[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  deposit: number;
  remaining: number;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  createdBy: string;
  createdByRole: Role;
  createdAt: string;
  updatedAt: string;
  invoiceImage?: string;
}

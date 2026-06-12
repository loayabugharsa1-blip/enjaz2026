import type { OrderItem, OrderStatus } from "./order";
import type { ErrorCode, AppErrorPayload } from "@/lib/errors/app-error";

export type { AppErrorPayload };

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppErrorPayload };

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  timestamp: string;
}

export interface ApiErrorPayload {
  code: ErrorCode;
  message: string;
  details?: unknown;
  statusCode: number;
}

export interface CreateOrderDTO {
  items: OrderItem[];
  total: number;
  deposit: number;
  customerName: string;
  customerPhone: string;
  notes?: string;
  source?: "pos" | "online";
}

export interface UpdateOrderStatusDTO {
  orderId: string;
  status: OrderStatus;
  note?: string;
}

export interface CreateInvoiceDTO {
  orderId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  amountPaid: number;
  notes?: string;
}

export interface CreateInventoryItemDTO {
  nameAr: string;
  nameEn?: string;
  category: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateInventoryItemDTO extends CreateInventoryItemDTO {
  id: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

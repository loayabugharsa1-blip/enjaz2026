export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
  items: InvoiceLineItem[];
  notes: string | null;
  printCount: number;
  lastPrintedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  itemId: string | null;
  nameAr: string;
  nameEn: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  amountDue: number;
}

export interface OrderTrackingEntry {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string;
  changedByRole: string;
  note: string | null;
  createdAt: string;
}

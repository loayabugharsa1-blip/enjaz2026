"use client";
import { useDirection } from "@/hooks/use-direction";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useOrderNotifications } from "@/hooks/use-order-notifications";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { STATUS_LABELS, STATUS_COLORS } from "@/types/order";
import type { OrderStatus, Order } from "@/types/order";
import { Printer, Trash2, Send, Bell, FileDown, Search, ArrowUpDown, Image as ImageIcon, Eye } from "lucide-react";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { generateTrackingCode } from "@/lib/tracking";
import { downloadCSV } from "@/lib/export/csv";
import { normalizePhoneToWa } from "@/lib/whatsapp";
import { generateAndUploadInvoice } from "@/lib/invoice-generator";
import { fetchWithCSRF } from "@/lib/csrf";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: "processing",
  processing: "ready",
  ready: "completed",
  completed: null,
};

function getWhatsAppMessage(order: Order, status: OrderStatus, isRtl: boolean): string {
  const label = STATUS_LABELS[status][isRtl ? "ar" : "en"];
  const lines = isRtl
    ? [
        `مرحباً ${order.customerName || "العميل"}،`,
        ``,
        `نحيطكم علماً بأن طلبكم رقم #${order.id.slice(0, 6)} قد تم تحديثه إلى: ${label}`,
        ``,
        `📌 تفاصيل الطلب:`,
        `• 💰 الإجمالي: ${order.total.toLocaleString("en-US")} د.ل`,
        `• 📋 الحالة: ${label}`,
        ``,
        `نشكرك على ثقتك بنا.`,
        `إنجاز للدعاية و الاعلان 🚀`,
      ]
    : [
        `Dear ${order.customerName || "Customer"},`,
        ``,
        `Your order #${order.id.slice(0, 6)} has been updated to: ${label}`,
        ``,
        `📌 Order Details:`,
        `• 💰 Total: ${order.total.toLocaleString("en-US")} LYD`,
        `• 📋 Status: ${label}`,
        ``,
        `Thank you for your trust.`,
        `Enjaz Advertising 🚀`,
      ];
  return lines.join("\n");
}

export default function OrdersPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const { orders, refresh, updateStatus, remove } = useOrders();
  const { newCount, clearNewOrders } = useOrderNotifications(orders);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.customerName?.toLowerCase().includes(q) || o.customerPhone?.includes(q));
    }
    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      result = result.filter((o) => new Date(o.createdAt).toDateString() === today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((o) => new Date(o.createdAt) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      result = result.filter((o) => new Date(o.createdAt) >= monthAgo);
    }
    result.sort((a, b) => sortNewest
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return result;
  }, [orders, search, filterStatus, dateFilter, sortNewest]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedOrders = filteredOrders.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(0); }, [search, filterStatus, dateFilter, sortNewest]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    if (openMenu) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenu]);

  const handleReprint = useCallback(async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const { printOrderAsHTML } = await import("@/lib/pdf/generator");
    printOrderAsHTML(order, isRtl);
  }, [orders, isRtl]);

  const handleGenerateInvoice = useCallback(async (orderId: string): Promise<Order | null> => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.invoiceImage) return null;
    const url = await generateAndUploadInvoice(order);
    if (!url) { alert("فشل إنشاء الفاتورة"); return null; }
    const updated = { ...order, invoiceImage: url, updatedAt: new Date().toISOString() };
    const { updateOrder } = await import("@/lib/db");
    await updateOrder(updated);
    await refresh();
    return updated;
  }, [orders, refresh]);

  const handleStatusChange = useCallback(async (orderId: string, status: OrderStatus) => {
    await updateStatus(orderId, status);
    setOpenMenu(null);
    if (status === "ready") {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const updatedOrder = order.invoiceImage
        ? order
        : (await handleGenerateInvoice(orderId)) || order;
      if (updatedOrder?.customerPhone) {
        const raw = updatedOrder.customerPhone.replace(/[^\d]/g, "");
        const phone = normalizePhoneToWa(raw);
        const invLine = updatedOrder.invoiceImage ? `\n📄 رابط الفاتورة: ${updatedOrder.invoiceImage}` : "";
        const msg = isRtl
          ? `مرحباً ${updatedOrder.customerName || "العميل"}،\n\nطلبك #${updatedOrder.id.slice(0, 6)} جاهز للتسليم 🎉\nيمكنك القدوم لاستلامه من مقر الشركة في سرت.\n\n📌 الإجمالي: ${updatedOrder.total.toLocaleString("en-US")} د.ل\n⏳ المتبقي: ${Math.max(0, updatedOrder.remaining).toLocaleString("en-US")} د.ل${invLine}\n\nشكراً لثقتكم بإنجاز للدعاية و الإعلان.`
          : `Dear ${updatedOrder.customerName || "Customer"},\n\nYour order #${updatedOrder.id.slice(0, 6)} is ready for pickup 🎉\nYou can collect it from our office in Sirte.\n\n📌 Total: ${updatedOrder.total.toLocaleString("en-US")} LYD\n⏳ Remaining: ${Math.max(0, updatedOrder.remaining).toLocaleString("en-US")} LYD${invLine}\n\nThank you for choosing Enjaz Advertising.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      }
    }
  }, [updateStatus, orders, isRtl, handleGenerateInvoice]);

  const handleUploadInvoice = useCallback(async (orderId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("file", file);
      try {
        const resp = await fetchWithCSRF("/api/upload", { method: "POST", body: fd });
        const data = await resp.json();
        if (!resp.ok) { alert(data.error || "فشل الرفع"); return; }
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;
        const updated = { ...order, invoiceImage: data.url, updatedAt: new Date().toISOString() };
        const { updateOrder } = await import("@/lib/db");
        await updateOrder(updated);
        await refresh();
      } catch { alert("فشل رفع الصورة"); }
    };
    input.click();
  }, [orders, refresh]);

  const [invoiceView, setInvoiceView] = useState<string | null>(null);

  const handleWhatsAppInvoice = useCallback((order: Order) => {
    const raw = (order.customerPhone || "").replace(/[^\d]/g, "");
    if (!raw || !order.invoiceImage) return;
    const phone = normalizePhoneToWa(raw);
    const msg = isRtl
      ? `مرحباً ${order.customerName}،\n\nفاتورة طلبك #${order.id.slice(0, 6)} جاهزة.\nيمكنك الاطلاع عليها عبر الرابط أدناه:\n${order.invoiceImage}\n\nشكراً لثقتكم بإنجاز للدعاية و الإعلان.`
      : `Hi ${order.customerName},\n\nYour invoice for order #${order.id.slice(0, 6)} is ready.\nView it here:\n${order.invoiceImage}\n\nThank you for choosing Enjaz Advertising.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  }, [isRtl]);

  const handleDelete = useCallback(async (orderId: string) => {
    if (!isRtl) {
      if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) return;
    } else {
      if (!confirm("هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    }
    await remove(orderId);
  }, [remove, isRtl]);

  const handleExportCSV = useCallback(() => {
    const rows = orders.map((o) => ({
      "رقم الطلب": o.id.slice(0, 6),
      "كود التتبع": generateTrackingCode(o.id),
      "العميل": o.customerName || "",
      "الهاتف": o.customerPhone || "",
      "الإجمالي": o.total,
      "العربون": o.deposit,
      "المتبقي": o.remaining,
      "الحالة": STATUS_LABELS[o.status][isRtl ? "ar" : "en"],
      "التاريخ": new Date(o.createdAt).toLocaleDateString("en-US"),
    }));
    downloadCSV(rows, `orders-${new Date().toISOString().slice(0, 10)}`);
  }, [orders, isRtl]);

  const handleWhatsApp = useCallback((order: Order) => {
    const raw = (order.customerPhone || "").replace(/[^\d]/g, "");
    if (!raw) return;
    const phone = normalizePhoneToWa(raw);
    const msg = getWhatsAppMessage(order, order.status, isRtl);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }, [isRtl]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "الطلبات" : "Orders"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
            <FileDown className="w-4 h-4" />
            {isRtl ? "تصدير" : "Export"}
          </button>
          {newCount > 0 && (
            <button
              onClick={clearNewOrders}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#dc2626]/20 text-[#dc2626] rounded-lg text-sm hover:bg-[#dc2626]/30 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>{isRtl ? `${newCount} طلب جديد` : `${newCount} new`}</span>
            </button>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "بحث بالاسم أو الهاتف..." : "Search by name or phone..."}
            className="w-full ps-9 pe-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50">
          <option value="all">{isRtl ? "جميع الحالات" : "All Status"}</option>
          {(["pending", "processing", "ready", "completed"] as const).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s][isRtl ? "ar" : "en"]}</option>
          ))}
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50">
          <option value="all">{isRtl ? "كل التواريخ" : "All Dates"}</option>
          <option value="today">{isRtl ? "اليوم" : "Today"}</option>
          <option value="week">{isRtl ? "آخر 7 أيام" : "Last 7 days"}</option>
          <option value="month">{isRtl ? "آخر 30 يوم" : "Last 30 days"}</option>
        </select>
        <button onClick={() => setSortNewest(!sortNewest)} className="flex items-center gap-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-sm hover:text-zinc-100 transition-colors">
          <ArrowUpDown className="w-4 h-4" />
          {isRtl ? (sortNewest ? "الأحدث" : "الأقدم") : (sortNewest ? "Newest" : "Oldest")}
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 && (
          <p className="text-zinc-500 text-center py-12">{isRtl ? "لا توجد طلبات" : "No orders"}</p>
        )}
        {paginatedOrders.map((order) => (
          <Card key={order.id}>
              <div className="flex items-start justify-between printable-area flex-wrap gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-medium text-zinc-100">
                    {isRtl ? `طلب #${order.id.slice(0, 6)}` : `Order #${order.id.slice(0, 6)}`}
                  </span>
                  <span className="text-xs font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                    {generateTrackingCode(order.id)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status][isRtl ? "ar" : "en"]}
                  </span>
                </div>
                <div className="text-sm text-zinc-400 space-y-1">
                  <p>{isRtl ? `المجموع: ${order.total.toLocaleString("en-US")} د.ل` : `Total: ${order.total.toLocaleString("en-US")} LYD`}</p>
                  <p>{isRtl ? `العربون: ${order.deposit.toLocaleString("en-US")} د.ل` : `Deposit: ${order.deposit.toLocaleString("en-US")} LYD`}</p>
                  <p>{isRtl ? `المتبقي: ${Math.max(0, order.remaining).toLocaleString("en-US")} د.ل` : `Remaining: ${Math.max(0, order.remaining).toLocaleString("en-US")} LYD`}</p>
                  {order.customerName && (
                    <p className="text-zinc-300">{isRtl ? `العميل: ${order.customerName}` : `Customer: ${order.customerName}`}</p>
                  )}
                  {order.customerPhone && (
                    <p className="text-zinc-300">{isRtl ? `رقم الهاتف: ${order.customerPhone}` : `Phone: ${order.customerPhone}`}</p>
                  )}
                  {order.createdBy && (
                    <p className="text-xs text-zinc-500">{isRtl ? `البائع: ${order.createdBy}` : `By: ${order.createdBy}`}</p>
                  )}
                  <p className="text-xs text-zinc-600">{new Date(order.createdAt).toLocaleDateString("en-US")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-xs bg-zinc-800 px-2 py-0.5 rounded">{isRtl ? item.nameAr : item.nameEn} ×{item.quantity}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col gap-2 sm:ms-4 shrink-0">
                {!order.invoiceImage ? (
                  <button onClick={() => handleGenerateInvoice(order.id)} className="p-2 hover:bg-amber-900/50 rounded-lg text-amber-400 transition-colors" title={isRtl ? "إنشاء الفاتورة" : "Generate Invoice"}>
                    <FileDown className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => setInvoiceView(order.invoiceImage || null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors" title={isRtl ? "عرض الفاتورة" : "View Invoice"}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleWhatsAppInvoice(order)} className="p-2 hover:bg-green-900/50 rounded-lg text-green-400 transition-colors" title={isRtl ? "إرسال الفاتورة عبر واتساب" : "Send Invoice via WhatsApp"}>
                      <Send className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => handleUploadInvoice(order.id)} className="p-2 hover:bg-blue-900/50 rounded-lg text-blue-400 transition-colors" title={isRtl ? "رفع صورة الفاتورة" : "Upload Invoice"}>
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleReprint(order.id)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors" title={isRtl ? "طباعة" : "Print"}>
                  <Printer className="w-4 h-4" />
                </button>
                {order.customerPhone && (
                  <button onClick={() => handleWhatsApp(order)} className="p-2 hover:bg-green-900/50 rounded-lg text-green-400 transition-colors" title={isRtl ? "إرسال رسالة واتساب" : "Send WhatsApp"}>
                    <Send className="w-4 h-4" />
                  </button>
                )}
                {NEXT_STATUS[order.status] && (
                  <Button variant="secondary" size="small" onClick={() => handleStatusChange(order.id, NEXT_STATUS[order.status]!)}>
                    {STATUS_LABELS[NEXT_STATUS[order.status]!][isRtl ? "ar" : "en"]}
                  </Button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(order.id)} className="p-2 hover:bg-red-900/50 rounded-lg text-red-400 transition-colors" title={isRtl ? "حذف" : "Delete"}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            {isRtl ? "السابق" : "Prev"}
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                i === safePage ? "bg-[#dc2626] text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
            disabled={safePage >= totalPages - 1}
            className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 text-sm disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            {isRtl ? "التالي" : "Next"}
          </button>
        </div>
      )}
      {/* Invoice image lightbox */}
      {invoiceView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setInvoiceView(null)}>
          <div className="relative w-[90vw] h-[90vh]">
            <Image src={invoiceView} alt="Invoice" fill className="object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}

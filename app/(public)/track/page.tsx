"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/order";
import type { Order } from "@/types/order";
import { Search, Package, AlertCircle, Download } from "lucide-react";
import { generateInvoicePDF } from "@/lib/pdf/generator";
import { generateTrackingCode } from "@/lib/tracking";

function mapDbOrder(o: any): Order {
  const items = Array.isArray(o.items) ? o.items : [];
  return {
    id: o.id,
    items,
    total: Number(o.total),
    deposit: Number(o.deposit),
    remaining: Number(o.remaining),
    status: o.status,
    customerName: o.customer_name || "",
    customerPhone: o.customer_phone || o.whatsapp_number || "",
    createdBy: o.created_by || "",
    createdByRole: o.created_by_role || "employee",
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    invoiceImage: o.invoice_image || undefined,
  };
}

function normalizePhone(p: string): string {
  return p.trim().replace(/\s/g, "");
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());
}

function isTrackingCode(s: string): boolean {
  return /^ENJ-\d{5}$/i.test(s.trim());
}

export default function TrackPage() {
  const { isRtl } = useDirection();
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!phone.trim()) return;
    const cleaned = normalizePhone(phone);
    setSearching(true);
    setSearched(true);

    const isId = isUuid(cleaned) || isTrackingCode(cleaned);
    const params = isId
      ? `tracking_id=${encodeURIComponent(cleaned)}`
      : `phone=${encodeURIComponent(cleaned)}`;

    try {
      const resp = await fetch(`/api/track?${params}`, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (resp.ok) {
        const json = await resp.json();
        setOrders((json.data || []).map(mapDbOrder));
        return;
      }
    } catch {
      // API unavailable (e.g. static export / Tauri EXE) — fall through to RPC
    }

    // Fallback: call RPC directly (SECURITY DEFINER, granted to anon)
    try {
      if (isId) {
        if (isTrackingCode(cleaned)) {
          const { data: allOrders, error } = await supabase
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });
          if (!error && allOrders) {
            const matched = (allOrders as any[]).filter(
              (o: any) => generateTrackingCode(o.id) === cleaned.toUpperCase()
            );
            setOrders(matched.map(mapDbOrder));
            return;
          }
        } else {
          const { data, error } = await supabase.rpc("get_order_by_tracking_id", { tracking_id: cleaned });
          if (!error && data) {
            setOrders((Array.isArray(data) ? data : [data]).map(mapDbOrder));
            return;
          }
        }
      } else {
        const { data, error } = await supabase.rpc("get_my_orders", { phone: cleaned });
        if (!error && data) {
          setOrders((data as any[]).map(mapDbOrder));
          return;
        }
      }
    } catch {
      // RPC also unavailable
    }

    setOrders([]);
  }, [phone]);

  const handleDownloadPDF = useCallback(async (order: Order) => {
    try {
      const blob = await generateInvoicePDF(order);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.id.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="py-12 px-4 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Package className="w-12 h-12 text-[#dc2626] mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">{isRtl ? "تتبع طلبك" : "Track Your Order"}</h1>
        <p className="text-zinc-400">{isRtl ? "أدخل رقم هاتفك المسجل في الطلب لعرض حالته الحالية" : "Enter your phone number to check your order status"}</p>
      </div>

      <Card className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              id="track-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isRtl ? "رقم الهاتف" : "Phone number"}
              dir="ltr"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={searching || !phone.trim()}>
            <Search className="w-4 h-4 me-2" />
            {isRtl ? "بحث" : "Search"}
          </Button>
        </div>
      </Card>

      {searching && (
        <p className="text-center text-zinc-500">{isRtl ? "جاري البحث..." : "Searching..."}</p>
      )}

      {!searching && searched && orders !== null && orders.length === 0 && (
        <Card className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
          <p className="text-zinc-500">{isRtl ? "لا توجد طلبات مسجلة بهذا الرقم" : "No orders found for this number"}</p>
        </Card>
      )}

      {!searching && orders !== null && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">
                    {isRtl ? `طلب #${order.id.slice(0, 6)}` : `Order #${order.id.slice(0, 6)}`}
                  </span>
                  <span className="text-xs font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">
                    {generateTrackingCode(order.id)}
                  </span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status][isRtl ? "ar" : "en"]}
                </span>
              </div>
              <div className="text-sm text-zinc-400 space-y-1">
                {order.items.length > 0 && (
                  <p>{isRtl ? `الخدمة: ${order.items[0].nameAr}` : `Service: ${order.items[0].nameEn}`}</p>
                )}
                <p>{isRtl ? `المبلغ: ${order.total.toLocaleString("en-US")} د.ل` : `Amount: ${order.total.toLocaleString("en-US")} LYD`}</p>
                {order.deposit > 0 && (
                  <p>{isRtl ? `المدفوع: ${order.deposit.toLocaleString("en-US")} د.ل` : `Paid: ${order.deposit.toLocaleString("en-US")} LYD`}</p>
                )}
                <p className="text-xs text-zinc-600">{new Date(order.createdAt).toLocaleDateString("en-US")}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex gap-2">
                <button onClick={() => handleDownloadPDF(order)} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 text-xs transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  {isRtl ? "تحميل الفاتورة PDF" : "Download Invoice PDF"}
                </button>
              </div>
              {order.status === "ready" && (
                <div className="mt-2 pt-3 border-t border-zinc-800">
                  <p className="text-sm text-green-400">
                    {isRtl ? "✅ طلبك جاهز للتسليم، يمكنك القدوم لاستلامه من مقر الشركة في سرت." : "✅ Your order is ready for pickup at our office in Sirte."}
                  </p>
                </div>
              )}
              {order.status === "completed" && (
                <div className="mt-2 pt-3 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    {isRtl ? "✅ تم استلام طلبك، شكراً لثقتك بإنجاز للدعاية و الاعلان." : "✅ Your order has been received. Thank you for choosing Enjaz Advertising."}
                  </p>
                </div>
              )}
              {order.invoiceImage && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <p className="text-sm text-zinc-300 mb-2">{isRtl ? "📄 الفاتورة" : "📄 Invoice"}</p>
                  <a href={order.invoiceImage} target="_blank" rel="noopener noreferrer">
                    <Image src={order.invoiceImage} alt="Invoice" width={400} height={256} className="max-w-full max-h-64 rounded-lg object-contain bg-zinc-800" />
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

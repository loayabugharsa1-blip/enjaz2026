"use client";

import { useEffect, useState, useCallback } from "react";

type Order = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  whatsapp_number?: string | null;
  service_type?: string | null;
  price?: number | null;
  total?: number | null;
  status?: string | null;
  deposit?: number | null;
  remaining?: number | null;
  created_at?: string | null;
  notes?: string | null;
};

const STATUS_OPTIONS = [
  { value: "pending", ar: "قيد الانتظار" },
  { value: "processing", ar: "جاري التنفيذ" },
  { value: "ready", ar: "جاهز للتسليم" },
  { value: "completed", ar: "مكتمل" },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/orders/list", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!resp.ok) throw new Error("API error");
      const json = await resp.json();
      setOrders(json.data || []);
    } catch {
      setError("Failed to fetch orders");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    setError(null);
    const prev = orders;
    setOrders((p) =>
      p.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    try {
      const resp = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (!resp.ok) throw new Error("Update failed");
    } catch {
      setOrders(prev);
      setError("Status update failed");
    }
    setUpdating(null);
  };

  const statusColor = (s?: string | null) => {
    switch (s) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "ready": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={fetchOrders}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold text-sm"
        >
          تحديث
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 py-10 border rounded bg-gray-50">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="w-full text-right border-collapse bg-white text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3 border">رقم الطلب</th>
                <th className="p-3 border">العميل</th>
                <th className="p-3 border">رقم الهاتف</th>
                <th className="p-3 border">الخدمة</th>
                <th className="p-3 border">المبلغ</th>
                <th className="p-3 border">المدفوع</th>
                <th className="p-3 border">المتبقي</th>
                <th className="p-3 border">الحالة</th>
                <th className="p-3 border text-center">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const currentStatus = STATUS_OPTIONS.find(
                  (s) => s.value === order.status
                );
                const nextStatuses = STATUS_OPTIONS.filter(
                  (s) => s.value !== order.status
                );
                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 border font-mono text-blue-600 font-bold text-xs">
                      {order.id?.slice(0, 8)}...
                    </td>
                    <td className="p-3 border font-bold">
                      {order.customer_name ?? "—"}
                    </td>
                    <td className="p-3 border text-left font-mono" dir="ltr">
                      {order.customer_phone || order.whatsapp_number || "—"}
                    </td>
                    <td className="p-3 border">
                      {order.service_type ?? "—"}
                    </td>
                    <td className="p-3 border font-bold text-green-700">
                      {order.total ?? order.price ?? "—"}
                    </td>
                    <td className="p-3 border">
                      {order.deposit ?? "0"}
                    </td>
                    <td className="p-3 border">
                      {order.remaining ?? order.total ?? "0"}
                    </td>
                    <td className="p-3 border">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${statusColor(order.status)}`}
                      >
                        {currentStatus?.ar ?? order.status ?? "—"}
                      </span>
                    </td>
                    <td className="p-3 border text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {nextStatuses.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(order.id, s.value)}
                            disabled={updating === order.id}
                            className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                          >
                            {s.ar}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

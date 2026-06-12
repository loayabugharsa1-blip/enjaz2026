"use client";
import { useEffect, useState, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { RefreshCw, Send, Search, TrendingUp, Users, DollarSign } from "lucide-react";
import { normalizePhoneToWa } from "@/lib/whatsapp";

interface Customer {
  name: string;
  phone: string;
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
}

export default function CustomersPage() {
  const { isRtl } = useDirection();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/customers");
      if (!resp.ok) throw new Error();
      const json = await resp.json();
      setCustomers(json.data || []);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = search
    ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
    : customers;

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = customers.length ? Math.round(totalRevenue / customers.length) : 0;

  const handleWhatsApp = (phone: string) => {
    const wa = normalizePhoneToWa(phone);
    window.open(`https://wa.me/${wa}`, "_blank");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "إدارة العملاء" : "Customers"}</h1>
        <button onClick={fetchCustomers} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {isRtl ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">{isRtl ? "إجمالي العملاء" : "Total Customers"}</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{customers.length}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">{isRtl ? "إجمالي المشتريات" : "Total Revenue"}</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{totalRevenue.toLocaleString("en-US")} د.ل</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{isRtl ? "متوسط الطلب" : "Avg per Customer"}</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{avgOrderValue.toLocaleString("en-US")} د.ل</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isRtl ? "بحث باسم العميل أو رقم الهاتف..." : "Search by name or phone..."}
          className="w-full ps-9 pe-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-zinc-800">
              <tr className="text-zinc-400 border-b border-zinc-700">
                <th className="p-3 font-medium">{isRtl ? "العميل" : "Customer"}</th>
                <th className="p-3 font-medium">{isRtl ? "الهاتف" : "Phone"}</th>
                <th className="p-3 font-medium">{isRtl ? "عدد الطلبات" : "Orders"}</th>
                <th className="p-3 font-medium">{isRtl ? "إجمالي المشتريات" : "Total Spent"}</th>
                <th className="p-3 font-medium">{isRtl ? "آخر طلب" : "Last Order"}</th>
                <th className="p-3 font-medium">{isRtl ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">{isRtl ? "جاري التحميل..." : "Loading..."}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-zinc-500">{isRtl ? "لا يوجد عملاء" : "No customers"}</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.phone} className="border-b border-zinc-700/50 hover:bg-zinc-700/30">
                    <td className="p-3 font-medium text-zinc-100">{c.name}</td>
                    <td className="p-3 text-zinc-400 font-mono" dir="ltr">{c.phone}</td>
                    <td className="p-3 text-zinc-100">{c.orderCount}</td>
                    <td className="p-3 text-emerald-400 font-medium">{c.totalSpent.toLocaleString("en-US")} د.ل</td>
                    <td className="p-3 text-zinc-400">{new Date(c.lastOrder).toLocaleDateString("ar-LY")}</td>
                    <td className="p-3">
                      <button onClick={() => handleWhatsApp(c.phone)} className="p-1.5 hover:bg-green-900/50 rounded-lg text-green-400 transition-colors" title="WhatsApp">
                        <Send className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

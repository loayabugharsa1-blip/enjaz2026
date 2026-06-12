"use client";
import { useEffect, useState, useCallback } from "react";
import { RefreshCw, TrendingUp, ClipboardList, DollarSign, FileDown } from "lucide-react";
import { downloadCSV } from "@/lib/export/csv";

type DailySales = { date: string; count: number; revenue: number };

type Stats = {
  totalOrders: number;
  todayCount: number;
  todayRevenue: number;
  todayDeposit: number;
  statusDist: Record<string, number>;
  dailySales: DailySales[];
  recentOrders: {
    id: string;
    customer_name: string | null;
    total: number | null;
    status: string | null;
    created_at: string | null;
    tracking_code: string | null;
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "جاري التنفيذ",
  ready: "جاهز للتسليم",
  completed: "مكتمل",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  processing: "bg-blue-500/20 text-blue-400",
  ready: "bg-green-500/20 text-green-400",
  completed: "bg-zinc-500/20 text-zinc-400",
};

export default function ReportsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/orders/stats");
      if (!resp.ok) throw new Error("فشل جلب الإحصائيات");
      const json = await resp.json();
      setStats(json);
    } catch {
      setError("فشل الاتصال بالخادم");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const maxRevenue = stats?.dailySales
    ? Math.max(...stats.dailySales.map((d) => d.revenue), 1)
    : 1;

  const handleExport = () => {
    if (!stats?.recentOrders?.length) return;
    const rows = stats.recentOrders.map((o) => ({
      "رقم الطلب": o.id.slice(0, 6),
      "كود التتبع": o.tracking_code || "",
      "العميل": o.customer_name || "",
      "الإجمالي": o.total ?? 0,
      "الحالة": STATUS_LABEL[o.status ?? ""] || o.status || "",
      "التاريخ": o.created_at ? new Date(o.created_at).toLocaleDateString("ar-LY") : "",
    }));
    downloadCSV(rows, `تقارير-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">التقارير والإحصائيات</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
            <FileDown className="w-4 h-4" />
            تصدير CSV
          </button>
          <button onClick={fetchStats} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>
      </div>

      {error && <div className="bg-red-900/30 text-red-400 px-4 py-2 rounded-lg text-sm">{error}</div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span className="text-xs font-medium">طلبات اليوم</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{loading ? "—" : stats?.todayCount ?? 0}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">إيرادات اليوم</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{loading ? "—" : `${(stats?.todayRevenue ?? 0).toLocaleString("en-US")} د.ل`}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">عربون اليوم</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{loading ? "—" : `${(stats?.todayDeposit ?? 0).toLocaleString("en-US")} د.ل`}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-violet-400 mb-1">
            <ClipboardList className="w-4 h-4" />
            <span className="text-xs font-medium">إجمالي الطلبات (7 أيام)</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{loading ? "—" : stats?.totalOrders ?? 0}</p>
        </div>
      </div>

      {/* Chart + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">المبيعات آخر 7 أيام</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-zinc-500">جاري التحميل...</div>
          ) : (
            <div className="h-48 flex items-end gap-2">
              {stats?.dailySales.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-zinc-500">{day.revenue.toLocaleString("en-US")}</span>
                  <div
                    className="w-full bg-emerald-500/80 rounded-t"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 4)}%` }}
                  />
                  <span className="text-xs text-zinc-500">{day.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">توزيع الحالات</h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center text-zinc-500">جاري التحميل...</div>
          ) : (
            <div className="space-y-3">
              {["pending", "processing", "ready", "completed"].map((s) => {
                const count = stats?.statusDist?.[s] ?? 0;
                const total = stats?.totalOrders ?? 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-400">{STATUS_LABEL[s] || s}</span>
                      <span className="text-zinc-100 font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${STATUS_COLOR[s]?.split(" ")[0]?.replace("/20", "/60") ?? "bg-zinc-500/60"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">آخر الطلبات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-700">
                <th className="pb-2 font-medium">رقم الطلب</th>
                <th className="pb-2 font-medium">العميل</th>
                <th className="pb-2 font-medium">الإجمالي</th>
                <th className="pb-2 font-medium">الحالة</th>
                <th className="pb-2 font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-500">جاري التحميل...</td></tr>
              ) : stats?.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-zinc-500">لا توجد طلبات</td></tr>
              ) : (
                stats?.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-zinc-700/50 hover:bg-zinc-700/30">
                    <td className="py-2 text-blue-400 font-mono">{o.id.slice(0, 6)}</td>
                    <td className="py-2 text-zinc-200">{o.customer_name || "—"}</td>
                    <td className="py-2 text-emerald-400 font-medium">{o.total?.toLocaleString("en-US") ?? "—"} د.ل</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[o.status ?? ""] || "bg-zinc-500/20 text-zinc-400"}`}>
                        {STATUS_LABEL[o.status ?? ""] || o.status || "—"}
                      </span>
                    </td>
                    <td className="py-2 text-zinc-400">{o.created_at ? new Date(o.created_at).toLocaleDateString("ar-LY") : "—"}</td>
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

"use client";
import { useState } from "react";
import { useDirection } from "@/hooks/use-direction";
import { getAuditLog } from "@/lib/audit";
import type { AuditEntry } from "@/lib/audit";
import { RefreshCw, Trash2 } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  "تسجيل دخول": "text-emerald-400",
  "إضافة مستخدم": "text-blue-400",
  "حذف مستخدم": "text-red-400",
  "تغيير كلمة المرور": "text-yellow-400",
};

export default function AuditPage() {
  const { isRtl } = useDirection();
  const [entries, setEntries] = useState<AuditEntry[]>(() => getAuditLog());

  const refresh = () => setEntries(getAuditLog());

  const handleClear = () => {
    if (!confirm(isRtl ? "مسح سجل الحركات بالكامل؟" : "Clear entire audit log?")) return;
    localStorage.setItem("injaz_audit_log", JSON.stringify([]));
    setEntries([]);
  };

  return (
    <div className="max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "سجل الحركات" : "Audit Log"}</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors">
            <Trash2 className="w-4 h-4" />
            {isRtl ? "مسح" : "Clear"}
          </button>
          <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            {isRtl ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-zinc-500 py-12">{isRtl ? "لا توجد حركات مسجلة" : "No audit entries yet"}</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className={`text-xs font-bold px-2 py-1 rounded bg-zinc-900 ${ACTION_COLORS[e.action] || "text-zinc-400"}`}>
                {e.action}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200">{e.details}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {e.userName} — {new Date(e.timestamp).toLocaleString("ar-LY")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

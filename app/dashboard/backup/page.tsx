"use client";
import { useState, useCallback, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { exportAllData, importAllData } from "@/lib/db";
import { getBackupMeta, getAutoBackup, clearAutoBackup, type BackupMeta } from "@/lib/auto-backup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Shield, CheckCircle, AlertCircle, RotateCcw, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackupPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupMeta, setBackupMeta] = useState<BackupMeta | null>(null);

  useEffect(() => {
    if (!isAdmin) router.replace("/dashboard");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: load meta on mount
    setBackupMeta(getBackupMeta());
  }, [isAdmin, router]);

  const handleExport = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `injaz-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMeta(getBackupMeta());
      setStatus({ type: "success", message: isRtl ? "تم تصدير البيانات وحفظ النسخة التلقائية" : "Data exported & auto-backup saved" });
    } catch {
      setStatus({ type: "error", message: isRtl ? "فشل تصدير البيانات" : "Export failed" });
    }
    setLoading(false);
  }, [isRtl]);

  const handleImport = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setLoading(true);
      setStatus(null);
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importAllData(data);
        setStatus({ type: "success", message: isRtl ? "تم استيراد البيانات بنجاح" : "Data imported successfully" });
      } catch {
        setStatus({ type: "error", message: isRtl ? "فشل استيراد البيانات - تأكد من صحة الملف" : "Import failed - check file format" });
      }
      setLoading(false);
    };
    input.click();
  }, [isRtl]);

  const handleRestoreAuto = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const raw = getAutoBackup();
      if (!raw) {
        setStatus({ type: "error", message: isRtl ? "لا توجد نسخة احتياطية تلقائية" : "No auto-backup found" });
        setLoading(false);
        return;
      }
      await importAllData(raw as { inventory: never[]; orders: never[] });
      setStatus({ type: "success", message: isRtl ? "تم استعادة النسخة التلقائية بنجاح" : "Auto-backup restored successfully" });
    } catch {
      setStatus({ type: "error", message: isRtl ? "فشل استعادة النسخة التلقائية" : "Auto-backup restore failed" });
    }
    setLoading(false);
  }, [isRtl]);

  const handleClearAuto = useCallback(() => {
    clearAutoBackup();
    setBackupMeta(null);
    setStatus({ type: "success", message: isRtl ? "تم مسح النسخة التلقائية" : "Auto-backup cleared" });
  }, [isRtl]);

  if (!isAdmin) return null;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString(isRtl ? "ar-SA" : "en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">{isRtl ? "النسخ الاحتياطي" : "Backup & Restore"}</h1>
      <p className="text-zinc-500 text-sm mb-8">
        {isRtl ? "تصدير واستيراد جميع بيانات النظام (المخزن والطلبات)" : "Export and import all system data (inventory & orders)"}
      </p>

      {backupMeta && (
        <Card className="mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="flex-1 text-sm">
              <span className="text-zinc-300 font-medium">{isRtl ? "آخر نسخة تلقائية: " : "Last auto-backup: "}</span>
              <span className="text-zinc-500">{formatDate(backupMeta.lastBackup)}</span>
              <span className="text-zinc-600 mx-2">|</span>
              <span className="text-zinc-500">
                {backupMeta.inventoryCount} {isRtl ? "صنف" : "items"} · {backupMeta.ordersCount} {isRtl ? "طلب" : "orders"}
              </span>
            </div>
            <Button onClick={handleRestoreAuto} disabled={loading} variant="secondary" className="text-sm px-3 py-1.5">
              <RotateCcw className="w-3.5 h-3.5 me-1.5" />
              {isRtl ? "استعادة" : "Restore"}
            </Button>
            <button onClick={handleClearAuto} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors px-2 py-1">
              {isRtl ? "مسح" : "Clear"}
            </button>
          </div>
        </Card>
      )}

      {status && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 text-sm ${
          status.type === "success" ? "bg-green-900/20 border border-green-800 text-green-300" : "bg-red-900/20 border border-red-800 text-red-300"
        }`}>
          {status.type === "success" ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-zinc-800 rounded-full mb-4">
              <Download className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{isRtl ? "تصدير البيانات" : "Export Data"}</h3>
            <p className="text-sm text-zinc-500 mb-6">
              {isRtl ? "حفظ نسخة احتياطية من جميع البيانات على جهازك" : "Save a backup copy of all data to your device"}
            </p>
            <Button onClick={handleExport} disabled={loading} className="w-full">
              {loading ? (isRtl ? "جاري التصدير..." : "Exporting...") : (isRtl ? "تصدير" : "Export")}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-zinc-800 rounded-full mb-4">
              <Upload className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">{isRtl ? "استيراد البيانات" : "Restore Data"}</h3>
            <p className="text-sm text-zinc-500 mb-6">
              {isRtl ? "استعادة البيانات من نسخة احتياطية سابقة" : "Restore data from a previous backup file"}
            </p>
            <Button onClick={handleImport} disabled={loading} variant="secondary" className="w-full">
              {loading ? (isRtl ? "جاري الاستيراد..." : "Importing...") : (isRtl ? "استيراد" : "Import")}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-500">
            <p className="font-medium text-zinc-300 mb-1">{isRtl ? "توصيات أمان" : "Security Recommendations"}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{isRtl ? "احتفظ بنسخة احتياطية على فلاش ميموري منفصل" : "Keep a backup on a separate USB flash drive"}</li>
              <li>{isRtl ? "يتم حفظ نسخة تلقائية في المتصفح عند كل تصدير" : "Auto-backup is saved to browser on every export"}</li>
              <li>{isRtl ? "ينصح بتصدير نسخة يدوية أسبوعياً للاحتياط" : "Weekly manual export recommended for safety"}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

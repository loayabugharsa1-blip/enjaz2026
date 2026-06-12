"use client";
import { useState, useEffect, useCallback } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { fetchPortfolio, savePortfolio } from "@/lib/portfolio-db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { Plus, ImageIcon, Loader2 } from "lucide-react";
import { GridSkeleton } from "@/components/ui/skeleton";
import type { PortfolioItem } from "@/types/common";

export default function PortfolioAdminPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; edit: PortfolioItem | null }>({ open: false, edit: null });
  const [form, setForm] = useState({ id: "", src: "", altAr: "", altEn: "" });
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchPortfolio();
    setItems(data || []);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ id: crypto.randomUUID(), src: "", altAr: "", altEn: "" });
    setModal({ open: true, edit: null });
  };

  const openEdit = (item: PortfolioItem) => {
    setForm({ id: item.id, src: item.src, altAr: item.altAr, altEn: item.altEn });
    setModal({ open: true, edit: item });
  };

  const handleSave = async () => {
    if (!form.src || !form.altAr?.trim() || !form.altEn?.trim()) return;
    let updated: PortfolioItem[];
    if (modal.edit) {
      updated = items.map((i) => i.id === form.id ? { ...i, src: form.src, altAr: form.altAr.trim(), altEn: form.altEn.trim() } : i);
    } else {
      const maxOrder = items.reduce((max, i) => Math.max(max, i.order), -1);
      updated = [...items, { id: form.id, src: form.src, altAr: form.altAr.trim(), altEn: form.altEn.trim(), order: maxOrder + 1 }];
    }
    setSaving(true);
    await savePortfolio(updated);
    setItems(updated);
    setSaving(false);
    setModal({ open: false, edit: null });
  };

  const handleDelete = (id: string) => {
    if (!confirm(isRtl ? "حذف هذه الصورة من المعرض؟" : "Remove this image from portfolio?")) return;
    const updated = items.filter((i) => i.id !== id).map((i, idx) => ({ ...i, order: idx }));
    savePortfolio(updated);
    setItems(updated);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    const temp = updated[index].order;
    updated[index] = { ...updated[index], order: updated[target].order };
    updated[target] = { ...updated[target], order: temp };
    updated.sort((a, b) => a.order - b.order);
    savePortfolio(updated);
    setItems(updated);
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const resp = await fetch("/api/upload", { method: "POST", body: fd });
      if (!resp.ok) throw new Error("فشل رفع الصورة");
      const data = await resp.json();
      return data.url;
    } catch {
      alert(isRtl ? "فشل رفع الصورة" : "Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "معرض الأعمال" : "Portfolio Gallery"}</h1>
          <p className="text-zinc-500 text-sm mt-1">{isRtl ? "إضافة وترتيب وحذف صور معرض الأعمال" : "Add, reorder, and remove portfolio images"}</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRtl ? "إضافة صورة" : "Add Image"}
          </Button>
        )}
      </div>

      {loading ? (
        <GridSkeleton count={6} />
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{isRtl ? "لا توجد صور في المعرض بعد. أضف صورك الأولى." : "No portfolio images yet. Add your first image."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-video bg-zinc-800 relative">
                <Image src={item.src} alt={isRtl ? item.altAr : item.altEn} fill className="object-cover" />
                {isAdmin && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs">{isRtl ? "تعديل" : "Edit"}</button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-800 hover:bg-red-700 text-red-200 rounded-lg text-xs">{isRtl ? "حذف" : "Delete"}</button>
                  </div>
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="text-sm text-zinc-300 truncate flex-1">{isRtl ? item.altAr : item.altEn}</p>
                {isAdmin && items.length > 1 && (
                  <div className="flex items-center gap-1 shrink-0 ms-2">
                    <button onClick={() => moveItem(index, -1)} disabled={index === 0} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30"><span className="text-xs">{isRtl ? "↑" : "↑"}</span></button>
                    <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-30"><span className="text-xs">{isRtl ? "↓" : "↓"}</span></button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, edit: null })}
        title={modal.edit ? (isRtl ? "تعديل الصورة" : "Edit Image") : (isRtl ? "إضافة صورة جديدة" : "Add New Image")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الصورة" : "Image"}</label>
            {form.src && (
              <Image src={form.src} alt="" width={640} height={360} className="w-full aspect-video object-cover rounded-lg mb-2 border border-zinc-700" />
            )}
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" className="hidden" id="portfolio-image-input" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await handleImageUpload(file);
                if (url) setForm({ ...form, src: url });
              }} />
              <label htmlFor="portfolio-image-input" className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-sm cursor-pointer transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                {uploading ? (isRtl ? "جاري الرفع..." : "Uploading...") : (form.src ? (isRtl ? "تغيير الصورة" : "Change Image") : (isRtl ? "رفع صورة" : "Upload Image"))}
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الوصف (عربي)" : "Description (Arabic)"}</label>
            <input type="text" value={form.altAr} onChange={(e) => setForm({ ...form, altAr: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الوصف (إنجليزي)" : "Description (English)"}</label>
            <input type="text" value={form.altEn} onChange={(e) => setForm({ ...form, altEn: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ" : "Save")}</Button>
            <Button variant="secondary" onClick={() => setModal({ open: false, edit: null })} className="flex-1">{isRtl ? "إلغاء" : "Cancel"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

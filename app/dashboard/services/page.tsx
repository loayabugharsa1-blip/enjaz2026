"use client";
import { useState, useCallback, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useAuth } from "@/hooks/use-auth";
import { getAllServices, addService, updateService, deleteService, seedDefaultServices } from "@/lib/services-db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import Image from "next/image";
import { Plus, Edit, Trash2, ChevronDown, ChevronLeft, TriangleAlert, ImageIcon, Loader2 } from "lucide-react";
import type { Service } from "@/types/common";

export default function ServicesAdminPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [parents, setParents] = useState<Service[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; edit: Service | null; parentId: string | null }>({ open: false, edit: null, parentId: null });
  const [form, setForm] = useState({ id: "", titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", icon: "📦", imageUrl: "", basePrice: 0, parentId: "" as string | null, attributes: "[]" });
  const [uploadingImage, setUploadingImage] = useState(false);

  const load = useCallback(async () => {
    const all = await getAllServices();
    setServices(all || []);
    setParents((all || []).filter((s) => !s?.parentId));
  }, []);

  useEffect(() => { seedDefaultServices().then(load); }, [load]);

  const resetForm = useCallback((parentId: string | null = null, edit: Service | null = null) => {
    if (edit) {
      setForm({ id: edit.id || "", titleAr: edit.titleAr || "", titleEn: edit.titleEn || "", descriptionAr: edit.descriptionAr || "", descriptionEn: edit.descriptionEn || "", icon: edit.icon || "📦", imageUrl: edit.imageUrl || "", basePrice: Number(edit.basePrice) || 0, parentId: edit.parentId, attributes: JSON.stringify(edit.attributes || []) });
    } else {
      setForm({ id: crypto.randomUUID(), titleAr: "", titleEn: "", descriptionAr: "", descriptionEn: "", icon: "📦", imageUrl: "", basePrice: 0, parentId, attributes: "[]" });
    }
  }, []);

  const openAdd = useCallback((parentId: string | null = null) => {
    resetForm(parentId);
    setModal({ open: true, edit: null, parentId });
  }, [resetForm]);

  const openEdit = useCallback((s: Service) => {
    resetForm(null, s);
    setModal({ open: true, edit: s, parentId: s?.parentId });
  }, [resetForm]);

  const handleDelete = useCallback(async (id: string) => {
    if (isRtl) { if (!confirm("حذف هذه الخدمة نهائياً؟")) return; }
    else { if (!confirm("Delete this service permanently?")) return; }
    const children = (services || []).filter((s) => s?.parentId === id);
    if (children.length > 0) {
      if (isRtl) { if (!confirm(`سيتم حذف ${children.length} خدمة فرعية أيضاً. هل أنت متأكد؟`)) return; }
      else { if (!confirm(`This will also delete ${children.length} sub-service(s). Continue?`)) return; }
      for (const c of children) {
        if (c?.id) await deleteService(c.id);
      }
    }
    await deleteService(id);
    await load();
  }, [services, load, isRtl]);

  const handleSave = useCallback(async () => {
    if (!form.titleAr?.trim() || !form.titleEn?.trim()) return;
    const price = Math.max(0, Number(form.basePrice) || 0);
    let parsedAttrs: unknown[] = [];
    try { parsedAttrs = JSON.parse(form.attributes || "[]"); } catch { parsedAttrs = []; }
    const service: Service = {
      id: form.id || crypto.randomUUID(),
      titleAr: (form.titleAr || "").trim(),
      titleEn: (form.titleEn || "").trim(),
      descriptionAr: (form.descriptionAr || "").trim() || "وصف الخدمة",
      descriptionEn: (form.descriptionEn || "").trim() || "Service description",
      icon: form.icon || "📦",
      imageUrl: form.imageUrl || undefined,
      basePrice: price,
      parentId: form.parentId || null,
      attributes: parsedAttrs as Service["attributes"],
    };
    if (modal.edit) {
      await updateService(service.id, service);
    } else {
      await addService(service);
    }
    setModal({ open: false, edit: null, parentId: null });
    await load();
  }, [form, modal.edit, load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "إدارة الخدمات والأصناف" : "Services & Categories"}</h1>
          <p className="text-zinc-500 text-sm mt-1">{isRtl ? "إضافة وتعديل وحذف الأصناف الرئيسية والخدمات الفرعية" : "Add, edit, or delete main categories and sub-services"}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => openAdd(null)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRtl ? "إضافة صنف رئيسي" : "Add Category"}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {(parents || []).map((parent) => {
          if (!parent?.id) return null;
          const children = (services || []).filter((s) => s?.parentId === parent.id);
          const isOpen = expanded === parent.id;
          return (
            <Card key={parent.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => setExpanded(isOpen ? null : parent.id)}>
                  <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>
                  {parent.imageUrl ? <Image src={parent.imageUrl} alt="" width={32} height={32} className="w-8 h-8 object-contain rounded" /> : <span className="text-2xl">{parent.icon || "📦"}</span>}
                  <div className="min-w-0">
                    <div className="font-semibold text-zinc-100 truncate">{isRtl ? (parent.titleAr || "") : (parent.titleEn || "")}</div>
                    <div className="text-xs text-zinc-500">{(children || []).length} {isRtl ? "خدمة فرعية" : "sub-services"} · {Number(parent.basePrice) || 0} د.ل</div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(parent)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(parent.id)} className="p-1.5 hover:bg-red-900/50 rounded text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                  {(children || []).map((child) => (
                    <div key={child?.id || crypto.randomUUID()} className="flex items-center justify-between gap-3 bg-zinc-800/40 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {child?.imageUrl ? <Image src={child.imageUrl} alt="" width={24} height={24} className="w-6 h-6 object-contain rounded" /> : <span className="text-lg">{child?.icon || "📦"}</span>}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-zinc-200 truncate">{isRtl ? (child?.titleAr || "") : (child?.titleEn || "")}</div>
                          <div className="text-xs text-zinc-500">{Number(child?.basePrice) || 0} د.ل</div>
                        </div>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => child && openEdit(child)} className="p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => child?.id && handleDelete(child.id)} className="p-1 hover:bg-red-900/50 rounded text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <button
                      onClick={() => openAdd(parent.id)}
                      className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-800/20 hover:bg-zinc-800/50 rounded-lg px-3 py-2 w-full"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isRtl ? `إضافة خدمة إلى ${parent.titleAr || ""}` : `Add service to ${parent.titleEn || ""}`}
                    </button>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {(!parents || parents.length === 0) && (
          <div className="text-center py-12 text-zinc-500">
            <TriangleAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{isRtl ? "لا توجد أصناف بعد. أضف صنفاً رئيسياً للبدء." : "No categories yet. Add a main category to get started."}</p>
          </div>
        )}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, edit: null, parentId: null })}
        title={modal.edit ? (isRtl ? "تعديل الخدمة" : "Edit Service") : (isRtl ? "إضافة خدمة جديدة" : "Add New Service")}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الاسم (عربي)" : "Name (Arabic)"}</label>
            <input type="text" value={form.titleAr || ""} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الاسم (إنجليزي)" : "Name (English)"}</label>
            <input type="text" value={form.titleEn || ""} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الوصف (عربي)" : "Description (Arabic)"}</label>
            <textarea value={form.descriptionAr || ""} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الوصف (إنجليزي)" : "Description (English)"}</label>
            <textarea value={form.descriptionEn || ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الأيقونة" : "Icon"}</label>
              <input type="text" value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "السعر (د.ل)" : "Price (LYD)"}</label>
              <input type="number" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Math.max(0, Number(e.target.value) || 0) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "صورة الخدمة" : "Service Image"}</label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <Image src={form.imageUrl} alt="" width={56} height={56} className="w-14 h-14 object-contain rounded-lg border border-zinc-700" />
              ) : (
                <div className="w-14 h-14 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-600"><ImageIcon className="w-6 h-6" /></div>
              )}
              <div className="flex-1">
                <input type="file" accept="image/*" className="hidden" id="service-image-input" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  try {
                    const fd = new FormData();
                    fd.append("file", file);
                    const resp = await fetch("/api/upload", { method: "POST", body: fd });
                    if (!resp.ok) throw new Error("فشل رفع الصورة");
                    const data = await resp.json();
                    setForm({ ...form, imageUrl: data.url });
                  } catch { alert(isRtl ? "فشل رفع الصورة" : "Image upload failed"); }
                  finally { setUploadingImage(false); }
                }} />
                <label htmlFor="service-image-input" className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-xs cursor-pointer transition-colors">
                  {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  {uploadingImage ? (isRtl ? "جاري الرفع..." : "Uploading...") : (form.imageUrl ? (isRtl ? "تغيير الصورة" : "Change Image") : (isRtl ? "رفع صورة" : "Upload Image"))}
                </label>
                {form.imageUrl && (
                  <button onClick={() => setForm({ ...form, imageUrl: "" })} className="text-xs text-red-400 hover:text-red-300 ms-2">{isRtl ? "إزالة" : "Remove"}</button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الخيارات (JSON)" : "Attributes (JSON)"}</label>
            <textarea value={form.attributes} onChange={(e) => setForm({ ...form, attributes: e.target.value })} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 font-mono text-xs focus:outline-none focus:border-zinc-500 resize-none" placeholder='[{"nameAr":"الخامة","nameEn":"Material","type":"select","required":true,"options":[{"labelAr":"خشب","labelEn":"Wood","value":"wood","priceModifier":0}]}]' />
          </div>
          {!modal.edit && (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">{isRtl ? "الصنف الرئيسي" : "Parent Category"}</label>
              <select value={form.parentId || ""} onChange={(e) => setForm({ ...form, parentId: e.target.value || null })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500 appearance-none">
                <option value="">{isRtl ? "-- صنف رئيسي (بدون أب) --" : "-- Main Category (no parent) --"}</option>
                {(parents || []).map((p) => (
                  <option key={p?.id || ""} value={p?.id || ""}>{isRtl ? (p?.titleAr || "") : (p?.titleEn || "")}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">{isRtl ? "حفظ" : "Save"}</Button>
            <Button variant="secondary" onClick={() => setModal({ open: false, edit: null, parentId: null })} className="flex-1">{isRtl ? "إلغاء" : "Cancel"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

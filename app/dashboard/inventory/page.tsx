"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useInventory } from "@/hooks/use-inventory";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { seedInventory } from "@/lib/db/seed";
import { getAllServices, seedDefaultServices } from "@/lib/services-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { InventoryTable } from "@/components/dashboard/inventory-table";
import { Plus, Search } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";
import type { Service } from "@/types/common";

export default function InventoryPage() {
  const { isRtl } = useDirection();
  const { isAdmin } = useAuth();
  const { items, refresh, add, update, remove } = useInventory();

  useEffect(() => { seedInventory().then(refresh); }, [refresh]);
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => { seedDefaultServices().then(() => getAllServices().then(setServices)); }, []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", category: "", categoryId: "", quantity: 0, unitPrice: 0, costPrice: 0, description: "", imageUrl: "" });

  const openAdd = useCallback(() => {
    setEditItem(null);
    setForm({ nameAr: "", nameEn: "", category: "", categoryId: "", quantity: 0, unitPrice: 0, costPrice: 0, description: "", imageUrl: "" });
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((item: InventoryItem) => {
    setEditItem(item);
    setForm({ nameAr: item.nameAr, nameEn: item.nameEn, category: item.category, categoryId: item.categoryId || "", quantity: item.quantity, unitPrice: item.unitPrice, costPrice: item.costPrice, description: item.description || "", imageUrl: item.imageUrl || "" });
    setModalOpen(true);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.url) {
        setForm((prev) => ({ ...prev, imageUrl: json.url }));
      }
    } catch {
      console.error("Image upload failed");
    }
  }, []);

  const [saveError, setSaveError] = useState("");

  const handleSave = useCallback(async () => {
    setSaveError("");
    if (!form.nameAr.trim()) { setSaveError(isRtl ? "اسم الصنف (عربي) مطلوب" : "Arabic name is required"); return; }
    if (!form.category.trim()) { setSaveError(isRtl ? "القسم مطلوب" : "Category is required"); return; }
    if (form.quantity < 0) { setSaveError(isRtl ? "الكمية لا يمكن أن تكون سالبة" : "Quantity cannot be negative"); return; }
    if (form.unitPrice < 0) { setSaveError(isRtl ? "سعر البيع لا يمكن أن يكون سالباً" : "Sell price cannot be negative"); return; }
    if (form.costPrice < 0) { setSaveError(isRtl ? "سعر التكلفة لا يمكن أن يكون سالباً" : "Cost price cannot be negative"); return; }
    const payload = { ...form, nameEn: form.nameEn || form.nameAr };
    const invPayload = { ...payload, categoryId: payload.categoryId || undefined };
    try {
      if (editItem) {
        await update({ ...editItem, ...invPayload });
      } else {
        const { categoryId, ...rest } = invPayload;
        await add({ ...rest, categoryId } as Omit<InventoryItem, "id" | "createdAt" | "updatedAt">);
      }
      setModalOpen(false);
    } catch {
      setSaveError(isRtl ? "فشل الحفظ. حاول مرة أخرى." : "Save failed. Try again.");
    }
  }, [editItem, form, add, update, isRtl]);

  const handleInlineSave = useCallback(async (item: InventoryItem) => {
    await update(item);
  }, [update]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirm(isRtl ? "هل أنت متأكد من الحذف؟" : "Are you sure?")) {
      await remove(id);
    }
  }, [remove, isRtl]);

  const categories = useMemo(() => {
    const cats = new Set((items || []).map((i) => i.category).filter(Boolean));
    return Array.from(cats);
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.toLowerCase();
    return items.filter((item) => {
      if (q && !item.nameAr?.toLowerCase().includes(q) && !item.nameEn?.toLowerCase().includes(q)) return false;
      if (categoryFilter && item.category !== categoryFilter) return false;
      return true;
    });
  }, [items, search, categoryFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">{isRtl ? "المخزن" : "Inventory"}</h1>
        {isAdmin && (
          <Button onClick={openAdd} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRtl ? "إضافة صنف" : "Add Item"}
          </Button>
        )}
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "بحث باسم الصنف..." : "Search by name..."}
            className="w-full ps-9 pe-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        >
          <option value="">{isRtl ? "كل الأقسام" : "All Categories"}</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 self-center">{isRtl ? "انقر على الكمية أو السعر للتعديل المباشر" : "Click quantity/price to edit inline"}</p>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        <InventoryTable items={filtered} onEdit={openEdit} onDelete={handleDelete} onInlineSave={handleInlineSave} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? (isRtl ? "تعديل صنف" : "Edit Item") : (isRtl ? "إضافة صنف" : "Add Item")}>
        <div className="space-y-4">
          <Input id="nameAr" label={isRtl ? "اسم الصنف (عربي)" : "Item Name (Arabic)"} value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          <Input id="nameEn" label={isRtl ? "اسم الصنف (إنجليزي)" : "Item Name (English)"} value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          <Input id="category" label={isRtl ? "القسم" : "Category"} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="categoryId" className="text-sm text-zinc-400">{isRtl ? "التصنيف (خدمة)" : "Service Category"}</label>
            <select id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 appearance-none text-sm">
              <option value="">{isRtl ? "-- بدون تصنيف --" : "-- No Category --"}</option>
              {(services || []).filter((s) => !s.parentId).map((s) => (
                <optgroup key={s.id} label={isRtl ? s.titleAr : s.titleEn}>
                  {(services || []).filter((c) => c.parentId === s.id).map((c) => (
                    <option key={c.id} value={c.id}>{isRtl ? c.titleAr : c.titleEn}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <Input id="description" label={isRtl ? "الوصف" : "Description"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input id="imageUrl" label={isRtl ? "رابط الصورة" : "Image URL"} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{isRtl ? "أو رفع صورة:" : "Or upload:"}</span>
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} className="text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600" />
          </div>
          {form.imageUrl && <Image src={form.imageUrl} alt="preview" width={96} height={96} className="w-24 h-24 object-cover rounded border border-zinc-700" />}
          <Input id="quantity" label={isRtl ? "الكمية" : "Quantity"} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <Input id="unitPrice" label={isRtl ? "سعر البيع" : "Sell Price"} type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} />
          <Input id="costPrice" label={isRtl ? "سعر التكلفة" : "Cost Price"} type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })} />
          {saveError && <p className="text-red-400 text-sm text-center">{saveError}</p>}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1">{isRtl ? "حفظ" : "Save"}</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">{isRtl ? "إلغاء" : "Cancel"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

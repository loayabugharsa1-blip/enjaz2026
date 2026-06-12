"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import type { InventoryItem } from "@/types/inventory";
import { Edit, Trash2, TriangleAlert, Check, X } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onInlineSave?: (item: InventoryItem) => Promise<void>;
}

interface EditCell {
  id: string;
  field: "quantity" | "unitPrice" | "costPrice";
  value: string;
}

export function InventoryTable({ items, onEdit, onDelete, onInlineSave }: InventoryTableProps) {
  const { isRtl } = useDirection();
  const [editing, setEditing] = useState<EditCell | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = useCallback((id: string, field: "quantity" | "unitPrice" | "costPrice", currentValue: number) => {
    setEditing({ id, field, value: String(currentValue) });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const commitEdit = useCallback(async () => {
    if (!editing || !onInlineSave) { setEditing(null); return; }
    setSaving(true);
    try {
      const item = items.find((i) => i.id === editing.id);
      if (!item) return;
      const newVal = Math.max(0, Number(editing.value) || 0);
      const updated = { ...item, [editing.field]: newVal, updatedAt: new Date().toISOString() };
      await onInlineSave(updated);
    } finally {
      setSaving(false);
      setEditing(null);
    }
  }, [editing, items, onInlineSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  }, [commitEdit, cancelEdit]);

  const isEditing = (id: string, field: string) => editing?.id === id && editing?.field === field;

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <TriangleAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>{isRtl ? "لا توجد أصناف في المخزن" : "No items in inventory"}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-zinc-400">
            <th className="text-start py-3 px-3">{isRtl ? "الصنف" : "Item"}</th>
            <th className="text-start py-3 px-3">{isRtl ? "القسم" : "Category"}</th>
            <th className="text-end py-3 px-3">{isRtl ? "الكمية" : "Qty"}</th>
            <th className="text-end py-3 px-3">{isRtl ? "سعر البيع" : "Sell"}</th>
            <th className="text-end py-3 px-3">{isRtl ? "التكلفة" : "Cost"}</th>
            <th className="text-end py-3 px-3">{isRtl ? "أوامر" : "Actions"}</th>
          </tr>
        </thead>
        <tbody>
          {(items || []).map((item) => {
            if (!item?.id) return null;
            return (
              <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="py-3 px-3 text-zinc-100">{isRtl ? (item.nameAr || "") : (item.nameEn || "")}</td>
                <td className="py-3 px-3 text-zinc-400">{item.category || ""}</td>

                <td className="py-3 px-3 text-end" onClick={() => startEdit(item.id, "quantity", item.quantity || 0)}>
                  {isEditing(item.id, "quantity") ? (
                    <span className="inline-flex items-center gap-1">
                      <input ref={inputRef} type="number" min="0" value={editing?.value || "0"} onChange={(e) => setEditing((p) => p ? { ...p, value: e.target.value } : null)} onKeyDown={handleKeyDown} className="w-16 bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-zinc-100 text-center text-xs" />
                      <button onClick={commitEdit} disabled={saving} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ) : (
                    <span className={`cursor-pointer hover:bg-zinc-700/50 rounded px-1 py-0.5 ${(item.quantity || 0) <= 5 ? "text-red-400" : "text-zinc-100"}`}
                      title={isRtl ? "انقر لتعديل الكمية" : "Click to edit quantity"}>
                      {item.quantity ?? 0}
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 text-end" onClick={() => startEdit(item.id, "unitPrice", item.unitPrice || 0)}>
                  {isEditing(item.id, "unitPrice") ? (
                    <span className="inline-flex items-center gap-1">
                      <input type="number" min="0" value={editing?.value || "0"} onChange={(e) => setEditing((p) => p ? { ...p, value: e.target.value } : null)} onKeyDown={handleKeyDown} className="w-16 bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-zinc-100 text-center text-xs" />
                      <button onClick={commitEdit} disabled={saving} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ) : (
                    <span className="cursor-pointer hover:bg-zinc-700/50 rounded px-1 py-0.5" title={isRtl ? "انقر لتعديل السعر" : "Click to edit price"}>
                      {item.unitPrice ?? 0} د.ل
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 text-end" onClick={() => startEdit(item.id, "costPrice", item.costPrice || 0)}>
                  {isEditing(item.id, "costPrice") ? (
                    <span className="inline-flex items-center gap-1">
                      <input type="number" min="0" value={editing?.value || "0"} onChange={(e) => setEditing((p) => p ? { ...p, value: e.target.value } : null)} onKeyDown={handleKeyDown} className="w-16 bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-zinc-100 text-center text-xs" />
                      <button onClick={commitEdit} disabled={saving} className="text-green-400 hover:text-green-300"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={cancelEdit} className="text-zinc-500 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ) : (
                    <span className="cursor-pointer hover:bg-zinc-700/50 rounded px-1 py-0.5" title={isRtl ? "انقر لتعديل التكلفة" : "Click to edit cost"}>
                      {item.costPrice ?? 0} د.ل
                    </span>
                  )}
                </td>

                <td className="py-3 px-3 text-end">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => onEdit(item)} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 hover:bg-red-900/50 rounded text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

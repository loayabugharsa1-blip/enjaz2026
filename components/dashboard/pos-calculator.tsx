"use client";
import { useState, useCallback, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import { useInventory } from "@/hooks/use-inventory";
import { getAllServices, seedDefaultServices } from "@/lib/services-db";
import { getPricingRules } from "@/lib/pricing-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, Search, ShoppingBag, Package, Layers } from "lucide-react";
import { generateInvoicePDF, printPDF } from "@/lib/pdf/generator";
import type { OrderItem, SelectedAttribute } from "@/types/order";
import type { Service } from "@/types/common";

interface POSCalculatorProps {
  onComplete: (items: OrderItem[], total: number, deposit: number, remaining: number, customerName: string, customerPhone: string) => void;
}

export function POSCalculator({ onComplete }: POSCalculatorProps) {
  const { isRtl } = useDirection();
  const { items: inventory, deductQuantity } = useInventory();
  const [cart, setCart] = useState<(OrderItem & { inventoryId: string })[]>([]);
  const [search, setSearch] = useState("");
  const [deposit, setDeposit] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tab, setTab] = useState<"inventory" | "services">("inventory");

  const [services, setServices] = useState<Service[]>([]);
  const [parentId, setParentId] = useState<string>("");
  const [svcId, setSvcId] = useState<string>("");
  const [svcQty, setSvcQty] = useState(1);
  const [svcAttrs, setSvcAttrs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { seedDefaultServices().then(() => getAllServices().then(setServices)); }, []);

  const parents = (services || []).filter((s) => !s.parentId);
  const children = (services || []).filter((s) => s.parentId === parentId);
  const selectedSvc = (services || []).find((s) => s.id === svcId);

  const handleParentChange = (id: string) => {
    setParentId(id);
    setSvcId("");
    setSvcAttrs({});
  };

  const handleSvcChange = (id: string) => {
    setSvcId(id);
    const svc = (services || []).find((s) => s.id === id);
    if (svc?.attributes?.length) {
      const defaults: Record<string, string> = {};
      for (const attr of svc.attributes) {
        if (attr.options?.length) {
          defaults[attr.nameEn] = attr.options[0].value;
        }
      }
      setSvcAttrs(defaults);
    } else {
      setSvcAttrs({});
    }
  };

  const addServiceToCart = () => {
    if (!selectedSvc || svcQty < 1) return;
    const attrList: SelectedAttribute[] = [];
    let priceMod = 0;
    if (selectedSvc.attributes?.length) {
      for (const attr of selectedSvc.attributes) {
        const val = svcAttrs[attr.nameEn];
        if (val) {
          const opt = attr.options?.find((o) => o.value === val);
          attrList.push({
            nameAr: attr.nameAr,
            valueAr: opt?.labelAr || val,
            value: val,
            priceModifier: opt?.priceModifier || 0,
          });
          priceMod += opt?.priceModifier || 0;
        }
      }
    }
    const rules = getPricingRules();
    const rule = rules.find((r) => r.serviceId === selectedSvc.id);
    const base = rule?.pricePerUnit ?? selectedSvc.basePrice ?? 0;
    const unitPrice = base + priceMod;
    const itemId = selectedSvc.id + "-" + crypto.randomUUID().slice(0, 8);
    setCart((prev) => [...prev, {
      inventoryId: itemId,
      itemId: selectedSvc.id,
      nameAr: selectedSvc.titleAr,
      nameEn: selectedSvc.titleEn,
      quantity: svcQty,
      unitPrice,
      total: unitPrice * svcQty,
      attributes: attrList,
    }]);
    setSvcQty(1);
  };

  const filteredInventory = inventory.filter((item) =>
    isRtl ? item.nameAr.includes(search) : item.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = useCallback((itemId: string) => {
    const invItem = inventory.find((i) => i.id === itemId);
    if (!invItem || invItem.quantity <= 0) return;
    const existing = cart.find((c) => c.inventoryId === itemId);
    if (existing) {
      if (existing.quantity >= invItem.quantity) return;
      setCart((prev) => prev.map((c) => c.inventoryId === itemId ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * c.unitPrice } : c));
    } else {
      setCart((prev) => [...prev, { inventoryId: itemId, itemId, nameAr: invItem.nameAr, nameEn: invItem.nameEn, quantity: 1, unitPrice: invItem.unitPrice, total: invItem.unitPrice }]);
    }
  }, [inventory, cart]);

  const updateQty = useCallback((invId: string, delta: number) => {
    setCart((prev) => {
      const next = prev.map((c) => {
        if (c.inventoryId !== invId) return c;
        const newQty = c.quantity + delta;
        if (newQty <= 0) return null;
        const invItem = inventory.find((i) => i.id === invId);
        if (invItem && newQty > invItem.quantity) return c;
        return { ...c, quantity: newQty, total: newQty * c.unitPrice };
      });
      return next.filter(Boolean) as typeof prev;
    });
  }, [inventory]);

  const removeFromCart = useCallback((invId: string) => {
    setCart((prev) => prev.filter((c) => c.inventoryId !== invId));
  }, []);

  const total = cart.reduce((sum, c) => sum + c.total, 0);
  const remaining = total - deposit;

  const handlePrintPreview = useCallback(async () => {
    if (cart.length === 0) return;
    const fakeOrder = {
      id: crypto.randomUUID(),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      items: cart.map(({ inventoryId: _, ...rest }) => rest),
      total,
      deposit,
      remaining,
      status: "pending" as const,
      customerName,
      customerPhone,
      createdBy: "---",
      createdByRole: "employee" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const blob = await generateInvoicePDF(fakeOrder, isRtl ? "ar" : "en");
    printPDF(blob);
  }, [cart, total, deposit, remaining, customerName, customerPhone, isRtl]);

  const handleComplete = useCallback(async () => {
    setError(null);
    const deducted: { id: string; qty: number; origQty: number }[] = [];
    const realInventoryIds = new Set(inventory.map((i) => i.id));

    for (const item of cart) {
      if (!realInventoryIds.has(item.inventoryId)) continue; // service item, skip stock deduction
      const origItem = inventory.find((i) => i.id === item.inventoryId);
      if (!origItem) continue;
      const ok = await deductQuantity(item.inventoryId, item.quantity);
      if (!ok) {
        const { updateInventoryItem } = await import("@/lib/db");
        for (const d of deducted) {
          const inv = inventory.find((i) => i.id === d.id);
          if (inv) {
            await updateInventoryItem({ ...inv, quantity: d.origQty });
          }
        }
        setError(isRtl ? "الكمية المطلوبة غير متوفرة في المخزون" : "Insufficient stock");
        return;
      }
      deducted.push({ id: item.inventoryId, qty: item.quantity, origQty: origItem.quantity });
    }

    onComplete(cart, total, deposit, remaining, customerName, customerPhone);
    setCart([]);
    setDeposit(0);
    setCustomerName("");
    setCustomerPhone("");
  }, [cart, total, deposit, remaining, customerName, customerPhone, deductQuantity, onComplete, inventory, isRtl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <div className="flex gap-1 mb-4 bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setTab("inventory")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === "inventory" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-300"}`}
          >
            <Package className="w-4 h-4" />
            {isRtl ? "المخزون" : "Inventory"}
          </button>
          <button
            onClick={() => setTab("services")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === "services" ? "bg-zinc-700 text-zinc-100" : "text-zinc-400 hover:text-zinc-300"}`}
          >
            <Layers className="w-4 h-4" />
            {isRtl ? "الخدمات" : "Services"}
          </button>
        </div>

        {tab === "inventory" && (
          <>
            <Card className="mb-4">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isRtl ? "ابحث عن صنف..." : "Search item..."}
                  className="w-full bg-transparent border-0 ps-10 pe-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </Card>
            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
              {filteredInventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item.id)}
                  disabled={item.quantity <= 0}
                  className="text-start bg-zinc-900 border border-zinc-800 hover:border-zinc-700 disabled:opacity-40 rounded-lg p-3 transition-colors"
                >
                  <div className="text-sm font-medium text-zinc-100">{isRtl ? item.nameAr : item.nameEn}</div>
                  <div className="text-xs text-zinc-500 mt-1">{item.unitPrice} د.ل</div>
                  <div className={`text-xs mt-1 ${item.quantity <= 5 ? "text-red-400" : "text-zinc-600"}`}>
                    {isRtl ? `المتبقي: ${item.quantity}` : `Stock: ${item.quantity}`}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "services" && (
          <Card className="p-4 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">{isRtl ? "التصنيف" : "Category"}</label>
              <select
                value={parentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 appearance-none text-base"
                style={{ minHeight: "44px" }}
              >
                <option value="">{isRtl ? "-- اختر التصنيف --" : "-- Select Category --"}</option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>{isRtl ? p.titleAr : p.titleEn}</option>
                ))}
              </select>
            </div>

            {parentId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-zinc-400">{isRtl ? "الخدمة" : "Service"}</label>
                <select
                  value={svcId}
                  onChange={(e) => handleSvcChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 appearance-none text-base"
                  style={{ minHeight: "44px" }}
                >
                  <option value="">{isRtl ? "-- اختر الخدمة --" : "-- Select Service --"}</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>{isRtl ? c.titleAr : c.titleEn} ({c.basePrice} د.ل)</option>
                  ))}
                </select>
              </div>
            )}

            {selectedSvc?.attributes?.map((attr) => (
              <div key={attr.nameEn} className="flex flex-col gap-1.5">
                <label className="text-sm text-zinc-400">
                  {isRtl ? attr.nameAr : attr.nameEn}
                  {attr.required ? " *" : ""}
                </label>
                <select
                  value={svcAttrs[attr.nameEn] || ""}
                  onChange={(e) => setSvcAttrs((prev) => ({ ...prev, [attr.nameEn]: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 appearance-none text-base"
                  style={{ minHeight: "44px" }}
                >
                  {attr.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                      {opt.priceModifier > 0 ? ` (+${opt.priceModifier} د.ل)` : opt.priceModifier < 0 ? ` (${opt.priceModifier} د.ل)` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {svcId && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-zinc-400">{isRtl ? "الكمية" : "Quantity"}</label>
                <input
                  type="number"
                  min="1"
                  value={svcQty}
                  onChange={(e) => setSvcQty(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 text-base"
                  style={{ minHeight: "44px" }}
                />
              </div>
            )}

            <Button onClick={addServiceToCart} disabled={!svcId || svcQty < 1} className="w-full">
              <ShoppingBag className="w-4 h-4 ms-2" />
              {isRtl ? "إضافة إلى السلة" : "Add to Cart"}
            </Button>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <Card>
          <h3 className="font-semibold text-zinc-100 mb-4">{isRtl ? "الفواتير" : "Cart"}</h3>
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}
          {cart.length === 0 ? (
            <p className="text-sm text-zinc-500">{isRtl ? "السلة فارغة" : "Cart is empty"}</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
              {cart.map((c) => (
                <div key={c.inventoryId} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-zinc-100 truncate">{isRtl ? c.nameAr : c.nameEn}</div>
                    <div className="text-xs text-zinc-500">{c.unitPrice} د.ل × {c.quantity}</div>
                    {c.attributes?.map((a) => (
                      <div key={a.nameAr} className="text-xs text-zinc-600 truncate">{isRtl ? a.nameAr : a.nameAr}: {isRtl ? a.valueAr : a.valueAr}</div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 ms-2">
                    <button onClick={() => updateQty(c.inventoryId, -1)} className="p-1 hover:bg-zinc-700 rounded"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-medium w-6 text-center">{c.quantity}</span>
                    <button onClick={() => updateQty(c.inventoryId, 1)} className="p-1 hover:bg-zinc-700 rounded"><Plus className="w-3 h-3" /></button>
                    <button onClick={() => removeFromCart(c.inventoryId)} className="p-1 hover:bg-red-900/50 text-red-400 rounded ms-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{isRtl ? "الإجمالي" : "Total"}</span>
              <span className="font-bold text-lg text-zinc-100">{total} د.ل</span>
            </div>
            <div>
              <Input
                type="number"
                label={isRtl ? "العربون (المدفوع)" : "Deposit (Paid)"}
                value={deposit}
                onChange={(e) => setDeposit(Math.max(0, Math.min(total, Number(e.target.value))))}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">{isRtl ? "المتبقي" : "Remaining"}</span>
              <span className={`font-bold text-lg ${remaining <= 0 ? "text-green-400" : "text-[#dc2626]"}`}>{Math.max(0, remaining)} د.ل</span>
            </div>
            <Input
              type="text"
              label={isRtl ? "اسم العميل" : "Customer Name"}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={isRtl ? "اختياري" : "Optional"}
            />
            <Input
              type="text"
              label={isRtl ? "رقم الهاتف" : "Phone Number"}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder={isRtl ? "اختياري" : "Optional"}
            />
            <div className="flex gap-2">
              <Button onClick={handlePrintPreview} disabled={cart.length === 0} variant="secondary" className="flex-1">
                {isRtl ? "طباعة الفاتورة" : "Print Invoice"}
              </Button>
              <Button onClick={handleComplete} disabled={cart.length === 0} className="flex-1">
                {isRtl ? "تأكيد وطباعة" : "Confirm & Print"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

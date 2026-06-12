"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useDirection } from "@/hooks/use-direction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { getAllServices, seedDefaultServices } from "@/lib/services-db";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import type { Service } from "@/types/common";
import type { SelectedAttribute } from "@/types/order";
import { WHATSAPP_NUMBER } from "@/lib/config";

export function OrderForm() {
  const { isRtl } = useDirection();
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [doneTrackingCode, setDoneTrackingCode] = useState("");
  const [error, setError] = useState("");
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});

  useEffect(() => {
    seedDefaultServices().then(() => {
      getAllServices().then(setAllServices);
    });
  }, []);

  const sortedServices = useMemo(
    () => (allServices || []).slice().sort((a, b) => a?.titleAr?.localeCompare(b?.titleAr || "", "ar") || 0),
    [allServices]
  );

  const selectedService = (allServices || []).find((s) => s?.id === serviceId);

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const svc = (allServices || []).find((s) => s?.id === id);
    if (svc?.attributes?.length) {
      const defaults: Record<string, string> = {};
      for (const attr of svc.attributes) {
        if (attr.options?.length) {
          defaults[attr.nameEn] = attr.options[0].value;
        }
      }
      setSelectedAttrs(defaults);
    } else {
      setSelectedAttrs({});
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    if (!name?.trim()) { setError(isRtl ? "الرجاء إدخال الاسم" : "Please enter your name"); return; }
    if (!phone?.trim()) { setError(isRtl ? "الرجاء إدخال رقم الهاتف" : "Please enter your phone number"); return; }
    if (!serviceId) { setError(isRtl ? "الرجاء اختيار الخدمة" : "Please select a service"); return; }

    setSubmitting(true);
    try {
      const service = (allServices || []).find((s) => s?.id === serviceId);
      if (!service) { setError(isRtl ? "الخدمة غير موجودة" : "Service not found"); setSubmitting(false); return; }

      const attributes: SelectedAttribute[] = [];
      if (service.attributes?.length) {
        for (const attr of service.attributes) {
          const val = selectedAttrs[attr.nameEn];
          if (val) {
            const opt = attr.options?.find((o) => o.value === val);
            attributes.push({
              nameAr: attr.nameAr,
              valueAr: opt?.labelAr || val,
              value: val,
              priceModifier: opt?.priceModifier || 0,
            });
          }
        }
      }

      const resp = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: (name || "").trim(),
          customerPhone: (phone || "").trim(),
          serviceId: service.id,
          notes: (notes || "").trim(),
          attributes,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData?.error || "فشل حفظ الطلب في قاعدة البيانات");
      }

      const result = await resp.json();

      const trackingCode = result.trackingCode || `ENJ-${result.id.slice(0, 4).toUpperCase()}`;

      if (result.whatsappLink) {
        window.open(result.whatsappLink, "_blank");
      } else {
        const extraNotes = (notes || "").trim() ? `\nملاحظات: ${(notes || "").trim()}` : "";
        const msg = isRtl
          ? `مرحباً شركة إنجاز، لقد قمت بتقديم طلب جديد عبر الموقع الإلكتروني:\nالاسم: ${name.trim()}\nالخدمة: ${service.titleAr}\nرقم الطلب: ${result.id.slice(0, 8)}${extraNotes}\nالرجاء التواصل للاتفاق على العربون وتأكيد الطلب.`
          : `Hello Enjaz, I have submitted a new order via the website:\nName: ${name.trim()}\nService: ${service.titleEn}\nOrder #: ${result.id.slice(0, 8)}${extraNotes}\nPlease contact me to agree on the deposit and confirm the order.`;
        const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, "_blank");
      }
      setDoneTrackingCode(trackingCode);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isRtl ? "حدث خطأ أثناء تقديم الطلب" : "An error occurred while submitting"));
    } finally {
      setSubmitting(false);
    }
  }, [name, phone, serviceId, notes, selectedAttrs, isRtl, allServices]);

  if (done) {
    return (
      <Card className="w-full max-w-md mx-auto px-4 sm:px-6 shadow-md rounded-xl text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-zinc-100 mb-2">{isRtl ? "تم تقديم طلبك بنجاح!" : "Order Submitted Successfully!"}</h3>
        <p className="text-sm text-zinc-400 mb-2">{isRtl ? "تم تحويلك إلى واتساب للاتفاق على العربون وتأكيد الطلب." : "You have been redirected to WhatsApp to agree on the deposit."}</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg mb-4">
          <span className="text-xs text-zinc-500">{isRtl ? "كود التتبع:" : "Tracking Code:"}</span>
          <span className="text-lg font-bold text-green-400 font-mono">{doneTrackingCode}</span>
        </div>
        <p className="text-xs text-zinc-600 mb-4">
          {isRtl ? "يمكنك تتبع طلبك من خلال صفحة تتبع الطلبات في الموقع" : "You can track your order from the tracking page on the website"}
        </p>
        <Button onClick={() => { setDone(false); setDoneTrackingCode(""); setName(""); setPhone(""); setServiceId(""); setNotes(""); setSelectedAttrs({}); }}>
          {isRtl ? "تقديم طلب جديد" : "New Order"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto px-4 sm:px-6 shadow-md rounded-xl">
      <h3 className="text-xl font-bold text-zinc-100 mb-2">{isRtl ? "طلب خدمة أونلاين" : "Order Online"}</h3>
      <p className="text-sm text-zinc-400 mb-6">{isRtl ? "املأ النموذج أدناه وسيتم التواصل معك لتأكيد الطلب" : "Fill out the form and we will contact you to confirm"}</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          id="order-name"
          label={isRtl ? "الاسم الكامل" : "Full Name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isRtl ? "أدخل اسمك" : "Enter your name"}
          className="w-full"
        />

        <Input
          id="order-phone"
          label={isRtl ? "رقم الواتساب" : "WhatsApp Number"}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={isRtl ? "مثال: 0912345678" : "e.g. 0912345678"}
          dir="ltr"
          inputMode="tel"
          className="w-full"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-service" className="text-sm text-zinc-400">
            {isRtl ? "نوع الخدمة" : "Service Type"}
          </label>
          <select
            id="order-service"
            value={serviceId}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-colors appearance-none text-base"
            style={{ minHeight: "44px" }}
          >
            <option value="">{isRtl ? "-- اختر الخدمة --" : "-- Select Service --"}</option>
            {sortedServices.map((s) => (
              <option key={s.id} value={s.id}>
                {isRtl ? s.titleAr : s.titleEn} {s.basePrice > 0 ? `(${s.basePrice.toLocaleString("en-US")} د.ل)` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedService && (
          <div className="text-sm text-zinc-500 bg-zinc-800/50 rounded-lg p-3">
            <p className="flex items-center gap-2">{selectedService.imageUrl ? <Image src={selectedService.imageUrl} alt="" width={32} height={32} className="w-8 h-8 object-contain rounded" /> : <span>{selectedService.icon}</span>} <span className="text-zinc-300">{isRtl ? selectedService.descriptionAr : selectedService.descriptionEn}</span></p>
          </div>
        )}

        {selectedService?.attributes?.map((attr) => {
          const fieldId = `attr-${attr.nameEn}`;
          return (
            <div key={attr.nameEn} className="flex flex-col gap-1.5">
              <label htmlFor={fieldId} className="text-sm text-zinc-400">
                {isRtl ? attr.nameAr : attr.nameEn}
                {attr.required ? " *" : ""}
              </label>
              <select
                id={fieldId}
                value={selectedAttrs[attr.nameEn] || ""}
                onChange={(e) => setSelectedAttrs((prev) => ({ ...prev, [attr.nameEn]: e.target.value }))}
                className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-colors appearance-none text-base"
                style={{ minHeight: "44px" }}
              >
                {attr.type === "color" ? (
                  attr.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                      {opt.priceModifier > 0 ? ` (+${opt.priceModifier} د.ل)` : opt.priceModifier < 0 ? ` (${opt.priceModifier} د.ل)` : ""}
                    </option>
                  ))
                ) : (
                  attr.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {isRtl ? opt.labelAr : opt.labelEn}
                      {opt.priceModifier > 0 ? ` (+${opt.priceModifier} د.ل)` : opt.priceModifier < 0 ? ` (${opt.priceModifier} د.ل)` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          );
        })}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="order-notes" className="text-sm text-zinc-400">
            {isRtl ? "ملاحظات إضافية" : "Additional Notes"}
          </label>
          <textarea
            id="order-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={isRtl ? "اذكر أي تفاصيل إضافية للطلب..." : "Mention any additional order details..."}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50 focus:border-[#dc2626] transition-colors resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full !py-3 text-base">
          {submitting ? (isRtl ? "جاري الإرسال..." : "Submitting...") : (isRtl ? "إرسال الطلب" : "Submit Order")}
        </Button>

        <p className="text-xs text-zinc-600 text-center">
          {isRtl ? "بعد الإرسال، سيتم تحويلك إلى واتساب للاتفاق على العربون" : "After submitting, you will be redirected to WhatsApp to arrange the deposit"}
        </p>
      </form>
    </Card>
  );
}

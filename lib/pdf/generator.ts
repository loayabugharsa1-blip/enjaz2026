import type { Order } from "@/types/order";
import { generateQRCode } from "@/lib/qr/generator";

function invoiceHTML(order: Order, isRtl: boolean): string {
  const rowsHtml = order.items
    .map(
      (item, i) => `
      <tr>
        <td style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px">${i + 1}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px">${isRtl ? item.nameAr : item.nameEn}</td>
        <td style="text-align:center;padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;direction:ltr">${item.quantity}</td>
        <td style="text-align:right;padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;direction:ltr">${item.unitPrice.toLocaleString("en-US")}</td>
        <td style="text-align:right;padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;direction:ltr;font-weight:600">${item.total.toLocaleString("en-US")}</td>
      </tr>`
    ).join("");

  const company = isRtl ? "إنجاز للدعاية و الاعلان" : "Enjaz Advertising";
  const title = isRtl ? "فاتورة مبيعات" : "Sales Invoice";
  const invNum = isRtl ? "رقم الفاتورة" : "Invoice #";
  const invDate = isRtl ? "التاريخ" : "Date";
  const invCust = isRtl ? "العميل" : "Customer";
  const invSeller = isRtl ? "البائع" : "Cashier";
  const cash = isRtl ? "نقدي" : "Cash";
  const hItems = isRtl ? ["#", "الصنف", "الكمية", "السعر", "المجموع"] : ["#", "Item", "Qty", "Price", "Total"];
  const lTotal = isRtl ? "الإجمالي" : "Total";
  const lDeposit = isRtl ? "العربون" : "Deposit";
  const lRemain = isRtl ? "المتبقي" : "Remaining";
  const lyd = isRtl ? "د.ل" : "LYD";
  const thankYou = isRtl ? "شكراً لتعاملكم مع إنجاز للدعاية و الاعلان" : "Thank you for choosing Enjaz Advertising";
  const contactInfo = isRtl
    ? "تنفيذ وإشراف: إنجاز للدعاية و الاعلان | هاتف: 00218910884726 | بريد إلكتروني: enjazprinting2021@gmail.com | العنوان: سرت، ليبيا | فيسبوك: https://www.facebook.com/enjazprinting2021.2022/"
    : "Executed by: Enjaz Advertising | Tel: 00218910884726 | Email: enjazprinting2021@gmail.com | Address: Sirte, Libya | Facebook: https://www.facebook.com/enjazprinting2021.2022/";

  return `
<div style="width:210mm;min-height:297mm;padding:15mm 15mm 10mm;font-family:'Helvetica','Arial',sans-serif;background:#fff;color:#1a1a1a;direction:${isRtl ? "rtl" : "ltr"}">
  <div style="text-align:center;border-bottom:3px solid #dc2626;padding-bottom:12px;margin-bottom:18px">
    <h1 style="font-size:22px;color:#dc2626;margin:0 0 4px">${company}</h1>
    <p style="font-size:11px;color:#666;margin:0">${title}</p>
  </div>
  <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:18px;padding:10px;background:#f9fafb;border-radius:6px">
    <div><span style="color:#888;font-size:10px">${invNum}</span><br><span style="font-weight:600">${order.id.slice(0, 8)}</span></div>
    <div><span style="color:#888;font-size:10px">${invDate}</span><br><span style="font-weight:600">${new Date(order.createdAt).toLocaleDateString("en-US")}</span></div>
    <div><span style="color:#888;font-size:10px">${invCust}</span><br><span style="font-weight:600">${order.customerName || cash}</span></div>
    <div><span style="color:#888;font-size:10px">${invSeller}</span><br><span style="font-weight:600">${order.createdBy}</span></div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:12px">
    <thead>
      <tr style="background:#dc2626;color:#fff;font-size:12px">
        ${hItems.map((h) => `<th style="padding:7px 8px;text-align:${h === hItems[1] ? (isRtl ? "right" : "left") : "center"}">${h}</th>`).join("")}
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div style="margin-top:8px">
    <table style="width:auto;min-width:220px;margin-${isRtl ? "left" : "right"}:0;margin-${isRtl ? "right" : "left"}:auto;border-collapse:collapse">
      <tr><td style="padding:4px 10px;font-size:12px">${lTotal}</td><td style="padding:4px 10px;font-size:12px;text-align:right;direction:ltr;font-weight:600">${order.total.toLocaleString("en-US")} ${lyd}</td></tr>
      <tr><td style="padding:4px 10px;font-size:12px">${lDeposit}</td><td style="padding:4px 10px;font-size:12px;text-align:right;direction:ltr">${order.deposit.toLocaleString("en-US")} ${lyd}</td></tr>
      <tr><td style="padding:6px 10px;font-size:15px;font-weight:700;color:#dc2626;border-top:2px solid #dc2626">${lRemain}</td><td style="padding:6px 10px;font-size:15px;font-weight:700;color:#dc2626;border-top:2px solid #dc2626;text-align:right;direction:ltr">${Math.max(0, order.remaining).toLocaleString("en-US")} ${lyd}</td></tr>
    </table>
  </div>
  <div style="margin-top:15px;display:flex;justify-content:space-between;align-items:start">
    <div id="invoice-qr"></div>
    <div style="width:120px;height:70px;border:2px solid #dc2626;border-radius:4px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9px;color:#dc2626">
      <div>${isRtl ? "إنجاز" : "Enjaz"}</div>
      <div>${isRtl ? "للدعاية و الاعلان" : "Advertising"}</div>
      <div>${new Date().toLocaleDateString("en-US")}</div>
    </div>
  </div>
  <div style="text-align:center;font-size:10px;color:#999;margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb">
    <div>${thankYou}</div>
    <div style="font-size:7px;color:#aaa;margin-top:5px">${contactInfo}</div>
  </div>
</div>`;
}

export async function generateInvoiceImage(order: Order, isRtl: boolean = true): Promise<Blob> {
  const container = document.createElement("div");
  container.innerHTML = invoiceHTML(order, isRtl);
  container.style.cssText = "position:fixed;left:-9999px;top:0;width:210mm;height:auto;z-index:-1";
  document.body.appendChild(container);

  try {
    const qrDataUrl = await generateQRCode(order.id);
    const qrImg = document.createElement("img");
    qrImg.src = qrDataUrl;
    qrImg.style.cssText = "width:80px;height:80px;display:block";
    const qrSlot = container.querySelector("#invoice-qr");
    if (qrSlot) qrSlot.appendChild(qrImg);

    await new Promise((r) => setTimeout(r, 150));
    const { toJpeg } = await import("html-to-image");
    const dataUrl = await toJpeg(container, { quality: 0.85, pixelRatio: 1, backgroundColor: "#ffffff" });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

export async function generateInvoicePDF(order: Order, lang: "ar" | "en" = "ar"): Promise<Blob> {
  return generateInvoiceImage(order, lang === "ar");
}

export function printPDF(blob?: Blob): void {
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
    URL.revokeObjectURL(url);
    return;
  }
  window.print();
}

export function printOrderAsHTML(order: Order, isRtl: boolean = true): void {
  const lang = isRtl ? "ar" : "en";
  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const rowsHtml = order.items
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${isRtl ? item.nameAr : item.nameEn}</td>
        <td style="text-align:right;direction:ltr">${item.quantity}</td>
        <td style="text-align:right;direction:ltr">${item.unitPrice.toLocaleString("en-US")}</td>
        <td style="text-align:right;direction:ltr">${item.total.toLocaleString("en-US")}</td>
      </tr>`
    ).join("");

  const html = `<!DOCTYPE html>
<html dir="${isRtl ? "rtl" : "ltr"}" lang="${lang}">
<head>
<meta charset="UTF-8">
<title>${t("فاتورة - إنجاز", "Invoice - Enjaz")}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ${isRtl ? "'Cairo','Arial',sans-serif" : "'Inter','Helvetica',sans-serif"}; background: #fff; color: #1a1a1a; padding: 20px; }
  .header { text-align: center; border-bottom: 3px solid #dc2626; padding-bottom: 15px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; color: #dc2626; margin-bottom: 4px; }
  .header p { font-size: 11px; color: #666; }
  .details { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 20px; padding: 10px; background: #f9fafb; border-radius: 6px; }
  .details .lbl { color: #888; font-size: 10px; }
  .details .val { color: #1a1a1a; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
  th { background: #dc2626; color: #fff; padding: 8px 10px; font-size: 12px; text-align: ${isRtl ? "right" : "left"}; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
  .totals { margin-top: 10px; }
  .totals table { width: auto; min-width: 250px; margin-left: auto; }
  .totals td { border: none; padding: 4px 10px; }
  .totals .gt td { font-size: 16px; font-weight: 700; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 8px; }
  .stamp { float: ${isRtl ? "left" : "right"}; width: 120px; height: 70px; border: 2px solid #dc2626; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 9px; color: #dc2626; margin-top: 20px; }
  .footer { text-align: center; font-size: 10px; color: #999; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
  .contact-info { font-size: 7px; color: #aaa; margin-top: 6px; }
</style>
</head>
<body>
<div class="header">
  <h1>${t("إنجاز للدعاية و الاعلان", "Enjaz Advertising")}</h1>
  <p>${t("فاتورة مبيعات", "Sales Invoice")}</p>
</div>
<div class="details">
  <div><div class="lbl">${t("رقم الفاتورة", "Invoice #")}</div><div class="val">${order.id.slice(0, 8)}</div></div>
  <div><div class="lbl">${t("التاريخ", "Date")}</div><div class="val">${new Date(order.createdAt).toLocaleDateString("en-US")}</div></div>
  <div><div class="lbl">${t("العميل", "Customer")}</div><div class="val">${order.customerName || t("نقدي", "Cash")}</div></div>
  <div><div class="lbl">${t("البائع", "Cashier")}</div><div class="val">${order.createdBy}</div></div>
</div>
<table>
  <thead><tr><th>#</th><th>${t("الصنف", "Item")}</th><th>${t("الكمية", "Qty")}</th><th>${t("السعر", "Price")}</th><th>${t("المجموع", "Total")}</th></tr></thead>
  <tbody>${rowsHtml}</tbody>
</table>
<div class="totals">
  <table>
    <tr><td>${t("الإجمالي", "Total")}</td><td style="text-align:right;direction:ltr">${order.total.toLocaleString("en-US")} ${t("د.ل", "LYD")}</td></tr>
    <tr><td>${t("العربون", "Deposit")}</td><td style="text-align:right;direction:ltr">${order.deposit.toLocaleString("en-US")} ${t("د.ل", "LYD")}</td></tr>
    <tr class="gt"><td>${t("المتبقي", "Remaining")}</td><td style="text-align:right;direction:ltr">${Math.max(0, order.remaining).toLocaleString("en-US")} ${t("د.ل", "LYD")}</td></tr>
  </table>
</div>
<div class="stamp">
  <div>${t("إنجاز", "Enjaz")}</div>
  <div>${t("للدعاية و الاعلان", "Advertising")}</div>
  <div>${new Date().toLocaleDateString("en-US")}</div>
</div>
<div class="footer">
  <div>${t("شكراً لتعاملكم مع إنجاز للدعاية و الاعلان", "Thank you for choosing Enjaz Advertising")}</div>
  <div class="contact-info">${t("تنفيذ وإشراف: إنجاز للدعاية و الاعلان | هاتف: 00218910884726 | بريد إلكتروني: enjazprinting2021@gmail.com | العنوان: سرت، ليبيا | فيسبوك: https://www.facebook.com/enjazprinting2021.2022/", "Executed by: Enjaz Advertising | Tel: 00218910884726 | Email: enjazprinting2021@gmail.com | Address: Sirte, Libya | Facebook: https://www.facebook.com/enjazprinting2021.2022/")}</div>
</div>
</body></html>`;

  const printWindow = window.open("", "_blank", "width=800,height=600,scrollbars=yes");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try { printWindow.print(); } catch { /* ignore */ }
    }, 600);
  } else {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        try { iframe.contentWindow?.print(); } catch { /* ignore */ }
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }, 600);
    };
  }
}

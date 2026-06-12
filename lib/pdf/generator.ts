import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order } from "@/types/order";
import { generateQRCode } from "@/lib/qr/generator";

export async function generateInvoicePDF(order: Order, lang: "ar" | "en" = "ar"): Promise<Blob> {
  try {
    const isRtl = lang === "ar";
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38);
  if (isRtl) {
    doc.text("إنجاز للدعاية و الاعلان", 105, 20, { align: "center" });
  } else {
    doc.text("Enjaz Advertising", 105, 20, { align: "center" });
  }

  doc.setFontSize(10);
  doc.setTextColor(100);
  if (isRtl) {
    doc.text("فاتورة مبيعات", 105, 28, { align: "center" });
  } else {
    doc.text("Sales Invoice", 105, 28, { align: "center" });
  }

  doc.setFontSize(9);
  doc.setTextColor(50);
  const detailsY = 38;
  if (isRtl) {
    doc.text(`رقم الفاتورة: ${order.id.slice(0, 8)}`, 15, detailsY);
    doc.text(`التاريخ: ${new Date(order.createdAt).toLocaleDateString("en-US")}`, 15, detailsY + 5);
    doc.text(`العميل: ${order.customerName || "نقدي"}`, 15, detailsY + 10);
    doc.text(`البائع: ${order.createdBy}`, 15, detailsY + 15);
  } else {
    doc.text(`Invoice #: ${order.id.slice(0, 8)}`, 15, detailsY);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-US")}`, 15, detailsY + 5);
    doc.text(`Customer: ${order.customerName || "Cash"}`, 15, detailsY + 10);
    doc.text(`Seller: ${order.createdBy}`, 15, detailsY + 15);
  }

  const tableHead = isRtl
    ? [["#", "الصنف", "الكمية", "السعر", "المجموع"]]
    : [["#", "Item", "Qty", "Price", "Total"]];

  const tableBody = order.items.map((item, i) => [
    (i + 1).toString(),
    isRtl ? item.nameAr : item.nameEn,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString("en-US")} د.ل`,
    `${item.total.toLocaleString("en-US")} د.ل`,
  ]);

  autoTable(doc, {
    head: tableHead,
    body: tableBody,
    startY: 58,
    theme: "striped",
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { textColor: [50, 50, 50] },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.1,
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  if (isRtl) {
    doc.text(`الإجمالي: ${order.total.toLocaleString("en-US")} د.ل`, 105, finalY, { align: "center" });
    doc.text(`العربون: ${order.deposit.toLocaleString("en-US")} د.ل`, 105, finalY + 7, { align: "center" });
    doc.text(`المتبقي: ${Math.max(0, order.remaining).toLocaleString("en-US")} د.ل`, 105, finalY + 14, { align: "center" });
  } else {
    doc.text(`Total: ${order.total.toLocaleString("en-US")} LYD`, 105, finalY, { align: "center" });
    doc.text(`Deposit: ${order.deposit.toLocaleString("en-US")} LYD`, 105, finalY + 7, { align: "center" });
    doc.text(`Remaining: ${Math.max(0, order.remaining).toLocaleString("en-US")} LYD`, 105, finalY + 14, { align: "center" });
  }

  const qrDataUrl = await generateQRCode(order.id);
  const qrY = finalY + 25;
  doc.addImage(qrDataUrl, "PNG", 85, qrY, 40, 40);
  doc.setFontSize(7);
  doc.setTextColor(150);
  if (isRtl) {
    doc.text(`كود تتبع الطلب: ${order.id.slice(0, 8)}`, 105, qrY + 46, { align: "center" });
  } else {
    doc.text(`Order tracking: ${order.id.slice(0, 8)}`, 105, qrY + 46, { align: "center" });
  }

  const stampY = qrY + 52;
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.7);
  doc.roundedRect(140, stampY, 50, 28, 2, 2, "S");
  doc.setFontSize(8);
  doc.setTextColor(220, 38, 38);
  if (isRtl) {
    doc.text("إنجاز", 165, stampY + 10, { align: "center" });
    doc.text("للدعاية و الاعلان", 165, stampY + 16, { align: "center" });
    doc.text(`تاريخ: ${new Date().toLocaleDateString("en-US")}`, 165, stampY + 22, { align: "center" });
  } else {
    doc.text("Enjaz Establishment", 165, stampY + 10, { align: "center" });
    doc.text("for Advertising", 165, stampY + 16, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-US")}`, 165, stampY + 22, { align: "center" });
  }

  doc.setFontSize(8);
  doc.setTextColor(180);
  if (isRtl) {
    doc.text("شكراً لتعاملكم مع إنجاز للدعاية و الاعلان", 105, 290, { align: "center" });
  } else {
    doc.text("Thank you for choosing Enjaz Advertising", 105, 290, { align: "center" });
  }
  doc.setFontSize(6);
  doc.setTextColor(150);
  const contactLine = isRtl
    ? "تنفيذ وإشراف: إنجاز للدعاية و الاعلان | هاتف: 00218910884726 | بريد إلكتروني: enjazprinting2021@gmail.com | العنوان: سرت، ليبيا | فيسبوك: https://www.facebook.com/enjazprinting2021.2022/"
    : "Executed by: Enjaz Advertising | Tel: 00218910884726 | Email: enjazprinting2021@gmail.com | Address: Sirte, Libya | Facebook: https://www.facebook.com/enjazprinting2021.2022/";
  doc.text(contactLine, 105, 297, { align: "center" });

  return doc.output("blob");
  } catch {
    const fallback = new jsPDF();
    fallback.setFontSize(16);
    fallback.text("فاتورة - إنجاز للدعاية و الاعلان", 105, 50, { align: "center" });
    fallback.text(`الطلب: ${order.id.slice(0, 8)}`, 105, 70, { align: "center" });
    fallback.text(`المبلغ: ${order.total.toLocaleString("en-US")} د.ل`, 105, 90, { align: "center" });
    return fallback.output("blob");
  }
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

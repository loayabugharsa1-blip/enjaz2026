import type { Order } from "@/types/order";
import { generateQRCode } from "@/lib/qr/generator";

export async function generateInvoiceImage(order: Order, isRtl: boolean = true): Promise<Blob> {
  const W = 800, H = 1130, pad = 40;
  const scale = window.devicePixelRatio || 1;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  let y = pad;

  function text(t: string, x: number, yPos: number, size: number, color: string, align: CanvasTextAlign = "left") {
    ctx.font = `bold ${size}px Helvetica,Arial,sans-serif`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(t, x, yPos);
  }

  function line(x1: number, y1: number, x2: number, y2: number, color: string, w: number) {
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function rect(x: number, yPos: number, w: number, h: number, color: string, lw: number) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.strokeRect(x, yPos, w, h);
  }

  const tAr = (ar: string, en: string) => (isRtl ? ar : en);
  const fmt = (n: number) => n.toLocaleString("en-US");

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Header
  text(tAr("إنجاز للدعاية و الاعلان", "Enjaz Advertising"), W / 2, y + 18, 22, "#dc2626", "center");
  text(tAr("فاتورة مبيعات", "Sales Invoice"), W / 2, y + 30, 11, "#666", "center");
  line(pad, y + 36, W - pad, y + 36, "#dc2626", 2);
  y += 50;

  // Details boxes
  const details = [
    [tAr("رقم الفاتورة", "Invoice #"), order.id.slice(0, 8)],
    [tAr("التاريخ", "Date"), new Date(order.createdAt).toLocaleDateString("en-US")],
    [tAr("العميل", "Customer"), order.customerName || tAr("نقدي", "Cash")],
    [tAr("البائع", "Cashier"), order.createdBy],
  ];
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(pad, y - 8, W - 2 * pad, 34);
  const detW = (W - 2 * pad) / details.length;
  details.forEach(([lbl, val], i) => {
    const x = pad + detW * i + detW / 2;
    text(lbl, x, y - 1, 9, "#888", "center");
    text(val, x, y + 10, 12, "#1a1a1a", "center");
  });
  y += 40;

  // Table header
  const cols = [
    { label: "#", align: "center" as CanvasTextAlign },
    { label: tAr("الصنف", "Item"), align: isRtl ? "right" as CanvasTextAlign : "left" as CanvasTextAlign },
    { label: tAr("الكمية", "Qty"), align: "center" as CanvasTextAlign },
    { label: tAr("السعر", "Price"), align: "right" as CanvasTextAlign },
    { label: tAr("المجموع", "Total"), align: "right" as CanvasTextAlign },
  ];
  const colW = [40, W - 2 * pad - 40 - 100 - 100 - 100, 80, 90, 90];
  const colStarts: number[] = [];
  let cx = pad;
  colW.forEach((w) => {
    colStarts.push(cx);
    cx += w;
  });

  ctx.fillStyle = "#dc2626";
  ctx.fillRect(pad, y - 6, W - 2 * pad, 26);
  ctx.fillStyle = "#ffffff";
  cols.forEach((c, i) => {
    const cx2 = colStarts[i] + colW[i] / 2;
    let tx = cx2;
    if (c.align === "left") tx = colStarts[i] + 6;
    else if (c.align === "right") tx = colStarts[i] + colW[i] - 6;
    text(c.label, tx, y + 10, 11, "#ffffff", c.align);
  });
  y += 26;

  // Table rows
  ctx.fillStyle = "#1a1a1a";
  order.items.forEach((item, i) => {
    const rowY = y + 2;
    const vals = [
      (i + 1).toString(),
      isRtl ? item.nameAr : item.nameEn,
      item.quantity.toString(),
      `${fmt(item.unitPrice)}`,
      `${fmt(item.total)}`,
    ];
    const aligns: CanvasTextAlign[] = ["center", isRtl ? "right" : "left", "center", "right", "right"];
    vals.forEach((v, j) => {
      const cx3 = colStarts[j] + colW[j] / 2;
      let tx3 = cx3;
      if (aligns[j] === "left") tx3 = colStarts[j] + 6;
      else if (aligns[j] === "right") tx3 = colStarts[j] + colW[j] - 6;
      ctx.font = `${j === 4 ? "bold " : ""}11px Helvetica,Arial,sans-serif`;
      ctx.textAlign = aligns[j];
      ctx.fillStyle = j === 4 ? "#1a1a1a" : "#333";
      ctx.fillText(v, tx3, rowY + 10);
    });
    line(pad, rowY + 18, W - pad, rowY + 18, "#e5e7eb", 1);
    y += 22;
  });

  y += 6;

  // Totals
  const totalsX = W - pad - 200;
  const totals = [
    [tAr("الإجمالي", "Total"), `${fmt(order.total)} ${tAr("د.ل", "LYD")}`, false],
    [tAr("العربون", "Deposit"), `${fmt(order.deposit)} ${tAr("د.ل", "LYD")}`, false],
    [tAr("المتبقي", "Remaining"), `${fmt(Math.max(0, order.remaining))} ${tAr("د.ل", "LYD")}`, true],
  ];
  totals.forEach(([lbl, val, big]) => {
    ctx.font = big ? "bold 14px Helvetica,Arial,sans-serif" : "12px Helvetica,Arial,sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = big ? "#dc2626" : "#1a1a1a";
    ctx.fillText(lbl as string, totalsX, y + 5);
    ctx.textAlign = "right";
    ctx.fillText(val as string, W - pad, y + 5);
    if (big) {
      line(totalsX, y + 10, W - pad, y + 10, "#dc2626", 1.5);
    }
    y += big ? 24 : 18;
  });

  y += 10;

  // QR code + Stamp
  const qrDataUrl = await generateQRCode(order.id);
  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await qrImg.decode();
  ctx.drawImage(qrImg, pad, y, 70, 70);
  text(tAr("تتبع: ", "Track: ") + order.id.slice(0, 8), pad + 35, y + 82, 8, "#999", "center");

  // Stamp
  const stampX = W - pad - 100;
  rect(stampX, y, 100, 55, "#dc2626", 1.5);
  text(tAr("إنجاز", "Enjaz"), stampX + 50, y + 18, 10, "#dc2626", "center");
  text(tAr("للدعاية و الاعلان", "Advertising"), stampX + 50, y + 28, 8, "#dc2626", "center");
  text(new Date().toLocaleDateString("en-US"), stampX + 50, y + 38, 8, "#dc2626", "center");

  y += 100;

  // Footer
  line(pad, y, W - pad, y, "#e5e7eb", 1);
  y += 10;
  text(tAr("شكراً لتعاملكم مع إنجاز للدعاية و الاعلان", "Thank you for choosing Enjaz Advertising"), W / 2, y, 10, "#999", "center");
  y += 14;
  const contact = tAr(
    "تنفيذ وإشراف: إنجاز للدعاية و الاعلان | هاتف: 00218910884726 | بريد إلكتروني: enjazprinting2021@gmail.com | العنوان: سرت، ليبيا",
    "Executed by: Enjaz Advertising | Tel: 00218910884726 | Email: enjazprinting2021@gmail.com | Address: Sirte, Libya"
  );
  ctx.font = "6px Helvetica,Arial,sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = "#aaa";
  ctx.fillText(contact, W / 2, y, W - 2 * pad);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/jpeg", 0.88);
  });
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

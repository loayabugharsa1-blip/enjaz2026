export interface PrintContent {
  title: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  createdBy: string;
  items: Array<{
    nameAr: string;
    nameEn: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  grandTotal: number;
  deposit: number;
  remaining: number;
  isRtl?: boolean;
}

export function openPrintWindow(content: PrintContent): void {
  const isRtl = content.isRtl ?? true;
  const lang = isRtl ? "ar" : "en";

  const t = (ar: string, en: string) => (isRtl ? ar : en);

  const rowsHtml = content.items
    .map(
      (item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${isRtl ? item.nameAr : item.nameEn}</td>
        <td class="number">${item.quantity}</td>
        <td class="number">${item.unitPrice.toLocaleString("en-US")}</td>
        <td class="number">${item.total.toLocaleString("en-US")}</td>
      </tr>`
    )
    .join("");

  const taxHtml =
    content.taxRate && content.taxRate > 0
      ? `<tr><td colspan="4" class="label">${t("ضريبة (", "Tax (")}${content.taxRate}%)</td><td class="number">${(content.taxAmount ?? 0).toLocaleString("en-US")}</td></tr>`
      : "";

  const discountHtml =
    content.discount && content.discount > 0
      ? `<tr><td colspan="4" class="label">${t("خصم", "Discount")}</td><td class="number">-${content.discount.toLocaleString("en-US")}</td></tr>`
      : "";

  const html = `<!DOCTYPE html>
<html dir="${isRtl ? "rtl" : "ltr"}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t("فاتورة - إنجاز", "Invoice - Enjaz")}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${isRtl ? "'Cairo', 'Arial', sans-serif" : "'Inter', 'Helvetica', 'Arial', sans-serif"};
      background: white;
      color: #1a1a1a;
      padding: 20px;
      line-height: 1.6;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #dc2626;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 22px;
      color: #dc2626;
      margin-bottom: 4px;
    }
    .header p {
      font-size: 11px;
      color: #666;
    }
    .invoice-details {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 20px;
      padding: 10px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .invoice-details div { flex: 1; }
    .invoice-details .label { color: #888; font-size: 10px; }
    .invoice-details .value { color: #1a1a1a; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th {
      background: #dc2626;
      color: white;
      padding: 8px 10px;
      font-size: 12px;
      text-align: ${isRtl ? "right" : "left"};
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
    }
    td.number { text-align: right; direction: ltr; }
    .totals { margin-top: 15px; }
    .totals table { width: auto; min-width: 250px; margin-left: auto; }
    .totals td { border: none; padding: 4px 10px; }
    .totals td.label { color: #666; }
    .totals td.number { font-weight: 600; }
    .totals .grand-total td { font-size: 16px; font-weight: 700; color: #dc2626; border-top: 2px solid #dc2626; padding-top: 8px; }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #999;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
    .contact-info { font-size: 7px; color: #aaa; margin-top: 6px; }
    .stamp {
      float: ${isRtl ? "left" : "right"};
      width: 120px;
      height: 70px;
      border: 2px solid #dc2626;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: #dc2626;
      margin-top: 20px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${t("إنجاز للدعاية و الاعلان", "Enjaz Advertising")}</h1>
    <p>${t("فاتورة مبيعات", "Sales Invoice")}</p>
  </div>

  <div class="invoice-details">
    <div>
      <div class="label">${t("رقم الفاتورة", "Invoice #")}</div>
      <div class="value">${content.invoiceNumber}</div>
    </div>
    <div>
      <div class="label">${t("التاريخ", "Date")}</div>
      <div class="value">${content.date}</div>
    </div>
    <div>
      <div class="label">${t("العميل", "Customer")}</div>
      <div class="value">${content.customerName || t("نقدي", "Cash")}</div>
    </div>
    <div>
      <div class="label">${t("البائع", "Cashier")}</div>
      <div class="value">${content.createdBy}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>${t("الصنف", "Item")}</th>
        <th>${t("الكمية", "Qty")}</th>
        <th>${t("السعر", "Price")}</th>
        <th>${t("المجموع", "Total")}</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td class="label">${t("المجموع الفرعي", "Subtotal")}</td>
        <td class="number">${content.subtotal.toLocaleString("en-US")} ${t("د.ل", "LYD")}</td>
      </tr>
      ${taxHtml}
      ${discountHtml}
      <tr class="grand-total">
        <td class="label">${t("الإجمالي النهائي", "Grand Total")}</td>
        <td class="number">${content.grandTotal.toLocaleString("en-US")} ${t("د.ل", "LYD")}</td>
      </tr>
      <tr>
        <td class="label">${t("المدفوع", "Paid")}</td>
        <td class="number">${content.deposit.toLocaleString("en-US")} ${t("د.ل", "LYD")}</td>
      </tr>
      <tr>
        <td class="label">${t("المتبقي", "Remaining")}</td>
        <td class="number">${Math.max(0, content.remaining).toLocaleString("en-US")} ${t("د.ل", "LYD")}</td>
      </tr>
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
</body>
</html>`;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        try { iframe.contentWindow?.print(); } catch { /* ignore */ }
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 1000);
      }, 500);
    };
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

export function triggerPrint(elementId?: string): void {
  if (elementId) {
    const el = document.getElementById(elementId);
    if (!el) {
      window.print();
      return;
    }
    const originalTitle = document.title;
    document.title = "طباعة - إنجاز | Print - Enjaz";
    window.print();
    document.title = originalTitle;
  } else {
    window.print();
  }
}

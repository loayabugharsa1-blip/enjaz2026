export async function generateQRCode(text: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  const url = await QRCode.toDataURL(text, { width: 200, margin: 2, color: { dark: "#dc2626", light: "#ffffff" } });
  return url;
}

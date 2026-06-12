export function generateTrackingCode(orderId: string): string {
  const prefix = "ENJ";
  const hash = orderId.replace(/-/g, "").slice(0, 8);
  const num = Number.parseInt(hash, 16);
  const short = (num % 90000 + 10000).toString();
  return `${prefix}-${short}`;
}

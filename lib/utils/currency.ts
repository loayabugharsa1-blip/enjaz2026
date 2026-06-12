export function formatPrice(price: number, lang: "ar" | "en" = "ar"): string {
  if (lang === "ar") {
    return `${price.toLocaleString("en-US")} د.ل`;
  }
  return `${price.toLocaleString("en-US")} LYD`;
}

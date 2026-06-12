import type { PortfolioItem } from "@/types/common";

const STORAGE_KEY = "injaz_portfolio";

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  { id: "1", src: "https://picsum.photos/seed/shield/600/400", altAr: "درع تذكاري", altEn: "Commemorative Shield", order: 0 },
  { id: "2", src: "https://picsum.photos/seed/cup/600/400", altAr: "أكواب مخصصة", altEn: "Custom Cups", order: 1 },
  { id: "3", src: "https://picsum.photos/seed/prints/600/400", altAr: "مطبوعات ورقية", altEn: "Paper Prints", order: 2 },
  { id: "4", src: "https://picsum.photos/seed/billboard/600/400", altAr: "لوحات إعلانية", altEn: "Billboards", order: 3 },
  { id: "5", src: "https://picsum.photos/seed/design/600/400", altAr: "تصميم جرافيكي", altEn: "Graphic Design", order: 4 },
  { id: "6", src: "https://picsum.photos/seed/signs/600/400", altAr: "لافتات ثابتة", altEn: "Fixed Signs", order: 5 },
];

function getLocal(): PortfolioItem[] {
  if (typeof window === "undefined") return DEFAULT_PORTFOLIO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PORTFOLIO));
      return DEFAULT_PORTFOLIO;
    }
    return JSON.parse(raw) || DEFAULT_PORTFOLIO;
  } catch {
    return DEFAULT_PORTFOLIO;
  }
}

function saveLocal(items: PortfolioItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("[portfolio-db] saveLocal failed:", err);
  }
}

export async function fetchPortfolio(): Promise<PortfolioItem[]> {
  try {
    const resp = await fetch("/api/portfolio");
    if (resp.ok) {
      const json = await resp.json();
      if (json?.data && Array.isArray(json.data)) {
        const mapped: PortfolioItem[] = json.data.map((r: Record<string, unknown>) => ({
          id: r.id,
          src: r.src,
          altAr: r.alt_ar || "",
          altEn: r.alt_en || "",
          order: r.order ?? 0,
        }));
        saveLocal(mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.warn("[portfolio-db] fetchPortfolio failed:", err);
  }
  return getLocal();
}

export async function savePortfolio(items: PortfolioItem[]): Promise<void> {
  saveLocal(items);
  try {
    await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch (err) {
    console.warn("[portfolio-db] savePortfolio cloud sync failed:", err);
  }
}

export function getPortfolioLocal(): PortfolioItem[] {
  return getLocal();
}

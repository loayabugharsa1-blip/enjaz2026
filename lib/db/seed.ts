import { getAllInventory, addInventoryItem } from "./index";
import type { InventoryItem } from "@/types/inventory";

const seedItems: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">[] = [
  { nameAr: "درع أكريليك صغير", nameEn: "Small Acrylic Shield", category: "دروع", quantity: 20, unitPrice: 150, costPrice: 80 },
  { nameAr: "درع أكريليك كبير", nameEn: "Large Acrylic Shield", category: "دروع", quantity: 15, unitPrice: 250, costPrice: 140 },
  { nameAr: "درع خشب فاخر", nameEn: "Premium Wood Shield", category: "دروع", quantity: 10, unitPrice: 400, costPrice: 220 },
  { nameAr: "كوب سيراميك أبيض", nameEn: "White Ceramic Cup", category: "أكواب", quantity: 100, unitPrice: 35, costPrice: 15 },
  { nameAr: "كوب معدني حراري", nameEn: "Thermal Metal Cup", category: "أكواب", quantity: 50, unitPrice: 55, costPrice: 28 },
  { nameAr: "كوب زجاجي شفاف", nameEn: "Clear Glass Cup", category: "أكواب", quantity: 40, unitPrice: 45, costPrice: 20 },
  { nameAr: "بطاقة عمل وجه واحد", nameEn: "Single-sided Business Card", category: "مطبوعات", quantity: 500, unitPrice: 25, costPrice: 10 },
  { nameAr: "بطاقة عمل وجهين", nameEn: "Double-sided Business Card", category: "مطبوعات", quantity: 500, unitPrice: 35, costPrice: 15 },
  { nameAr: "بروشور A4 مطوي", nameEn: "Folded A4 Brochure", category: "مطبوعات", quantity: 200, unitPrice: 50, costPrice: 25 },
  { nameAr: "فولدر مؤسسي", nameEn: "Corporate Folder", category: "مطبوعات", quantity: 100, unitPrice: 80, costPrice: 40 },
  { nameAr: "لوحة إعلانية خارجية", nameEn: "Outdoor Billboard", category: "لوحات", quantity: 5, unitPrice: 1500, costPrice: 800 },
  { nameAr: "بنر فعالية 2×3 م", nameEn: "Event Banner 2x3m", category: "لوحات", quantity: 10, unitPrice: 500, costPrice: 250 },
  { nameAr: "لافتة أكريليك مضيئة", nameEn: "Illuminated Acrylic Sign", category: "لافتات", quantity: 8, unitPrice: 1200, costPrice: 650 },
  { nameAr: "ستيكر شفاف", nameEn: "Clear Sticker", category: "مطبوعات", quantity: 300, unitPrice: 15, costPrice: 5 },
  { nameAr: "كتيب دعائي 10 صفحات", nameEn: "10-Page Promotional Booklet", category: "مطبوعات", quantity: 50, unitPrice: 120, costPrice: 60 },
];

export async function seedInventory(): Promise<void> {
  const existing = await getAllInventory();
  if (existing.length > 0) return;

  for (const item of seedItems) {
    const newItem: InventoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addInventoryItem(newItem);
  }
}

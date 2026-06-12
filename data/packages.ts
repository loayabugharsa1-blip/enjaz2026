import type { Package } from "@/types/common";

export const packages: Package[] = [
  {
    id: "starter",
    nameAr: "الباقة الاقتصادية",
    nameEn: "Starter Pack",
    items: ["500 بطاقة عمل", "100 بروشور", "تصميم احترافي"],
    price: 399,
    originalPrice: 650,
    badge: "الأكثر طلباً",
  },
  {
    id: "business",
    nameAr: "الباقة المتكاملة",
    nameEn: "Business Pack",
    items: ["1000 بطاقة عمل", "500 بروشور", "50 فولدر", "تصميم الهوية البصرية", "10 أكواب مخصصة"],
    price: 999,
    originalPrice: 1550,
    badge: "أفضل قيمة",
  },
  {
    id: "premium",
    nameAr: "الباقة الاحترافية",
    nameEn: "Premium Pack",
    items: ["2000 بطاقة عمل", "1000 بروشور", "100 فولدر", "هوية بصرية متكاملة", "20 كوب مخصص", "درع تذكاري", "لافتة محل"],
    price: 2499,
    originalPrice: 3800,
    badge: "خصم كبير",
  },
  {
    id: "event",
    nameAr: "باقة الفعاليات",
    nameEn: "Event Pack",
    items: ["بنر فعالية 2x3 متر", "200 بروشور", "50 دعوة", "تصميم الفعالية"],
    price: 1299,
    originalPrice: 1800,
  },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export { getParentServices as getParentCategories, getChildServices as getSubCategories, getServiceById, getAllServices, fetchCloudServices } from "@/lib/services-db";

export function getCalculatorConfig(serviceId: string): {
  fields: CalculatorField[];
  calcFn: (vals: Record<string, number>, rules: any[]) => number;
} | null {
  const configs: Record<string, { fields: CalculatorField[]; calcFn: (vals: Record<string, number>, rules: any[]) => number }> = {
    "shields-wood-crystal-leather": {
      fields: [
        { key: "type", labelAr: "نوع الخامة", labelEn: "Material type", type: "select", options: [
          { value: 1, labelAr: "خشب", labelEn: "Wood" },
          { value: 1.5, labelAr: "كريستال", labelEn: "Crystal" },
          { value: 1.8, labelAr: "جلد", labelEn: "Leather" },
        ], defaultValue: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "shields-wood-crystal-leather" && r.unitType === "piece")?.pricePerUnit || 200;
        return (vals.quantity || 1) * unit * (vals.type || 1);
      },
    },
    "souvenirs-medals": {
      fields: [
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 10, min: 1 },
        { key: "finish", labelAr: "نوع التشطيب", labelEn: "Finish type", type: "select", options: [
          { value: 1, labelAr: "عادي", labelEn: "Standard" },
          { value: 1.5, labelAr: "ذهبي", labelEn: "Gold plated" },
          { value: 1.8, labelAr: "فضي", labelEn: "Silver plated" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "souvenirs-medals" && r.unitType === "piece")?.pricePerUnit || 100;
        return (vals.quantity || 10) * unit * (vals.finish || 1);
      },
    },
    "glass-acrylic-stand-a4": {
      fields: [
        { key: "material", labelAr: "الخامة", labelEn: "Material", type: "select", options: [
          { value: 1, labelAr: "زجاج", labelEn: "Glass" },
          { value: 0.7, labelAr: "أكريليك", labelEn: "Acrylic" },
        ], defaultValue: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "glass-acrylic-stand-a4" && r.unitType === "piece")?.pricePerUnit || 150;
        return (vals.quantity || 1) * unit * (vals.material || 1);
      },
    },
    "business-cards": {
      fields: [
        { key: "quantity", labelAr: "عدد البطاقات", labelEn: "Number of cards", type: "number", defaultValue: 100, min: 50 },
        { key: "finish", labelAr: "نوع التشطيب", labelEn: "Finish type", type: "select", options: [
          { value: 1, labelAr: "عادي", labelEn: "Standard" },
          { value: 1.5, labelAr: "لامع", labelEn: "Glossy" },
          { value: 2, labelAr: "سوفت تاتش", labelEn: "Soft touch" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const packPrice = rules.find((r: any) => r.serviceId === "business-cards" && r.unitType === "piece")?.pricePerUnit || 50;
        const packs = Math.ceil((vals.quantity || 100) / 100);
        return packs * packPrice * (vals.finish || 1);
      },
    },
    "brochures-flyers": {
      fields: [
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 50, min: 10 },
        { key: "pages", labelAr: "عدد الصفحات", labelEn: "Number of pages", type: "select", options: [
          { value: 1, labelAr: "وجه واحد", labelEn: "Single side" },
          { value: 2, labelAr: "وجهين", labelEn: "Double side" },
          { value: 4, labelAr: "مطوية 4 صفحات", labelEn: "4-page fold" },
        ], defaultValue: 2 },
      ],
      calcFn: (vals, rules) => {
        const perPiece = rules.find((r: any) => r.serviceId === "brochures-flyers" && r.unitType === "piece")?.pricePerUnit || 5;
        return (vals.quantity || 50) * perPiece * (vals.pages || 2);
      },
    },
    "vinyl-cutting": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 30, min: 5 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 50, min: 5 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "vinyl-cutting" && r.unitType === "cm2")?.pricePerUnit || 0.02;
        const area = (vals.width || 30) * (vals.height || 50);
        return area * perCm2 * (vals.quantity || 1);
      },
    },
    "banner-vinyl-printing": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 100, min: 30 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 200, min: 30 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
        { key: "finish", labelAr: "نوع الطباعة", labelEn: "Print type", type: "select", options: [
          { value: 1, labelAr: "بنر", labelEn: "Banner" },
          { value: 1.2, labelAr: "فينيل شفاف", labelEn: "Transparent vinyl" },
          { value: 1.1, labelAr: "فينيل معتم", labelEn: "Opaque vinyl" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "banner-vinyl-printing" && r.unitType === "cm2")?.pricePerUnit || 0.01;
        const area = (vals.width || 100) * (vals.height || 200);
        return area * perCm2 * (vals.quantity || 1) * (vals.finish || 1);
      },
    },
    "fabric-printing": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 100, min: 30 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 150, min: 30 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "fabric-printing" && r.unitType === "cm2")?.pricePerUnit || 0.015;
        const area = (vals.width || 100) * (vals.height || 150);
        return area * perCm2 * (vals.quantity || 1);
      },
    },
    "sandblasted-vinyl": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 50, min: 10 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 100, min: 10 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "sandblasted-vinyl" && r.unitType === "cm2")?.pricePerUnit || 0.03;
        const area = (vals.width || 50) * (vals.height || 100);
        return area * perCm2;
      },
    },
    "product-stickers": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 5, min: 1 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 5, min: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 100, min: 10 },
        { key: "shape", labelAr: "الشكل", labelEn: "Shape", type: "select", options: [
          { value: 1, labelAr: "دائري", labelEn: "Round" },
          { value: 1, labelAr: "مربع", labelEn: "Square" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "product-stickers" && r.unitType === "cm2")?.pricePerUnit || 0.015;
        const area = (vals.width || 5) * (vals.height || 5);
        return area * perCm2 * (vals.quantity || 100);
      },
    },
    "waterproof-stickers": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 10, min: 2 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 15, min: 2 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 50, min: 5 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "waterproof-stickers" && r.unitType === "cm2")?.pricePerUnit || 0.025;
        const area = (vals.width || 10) * (vals.height || 15);
        return area * perCm2 * (vals.quantity || 50);
      },
    },
    "social-posts": {
      fields: [
        { key: "posts", labelAr: "عدد البوستات", labelEn: "Number of posts", type: "number", defaultValue: 5, min: 1 },
        { key: "platforms", labelAr: "عدد المنصات", labelEn: "Number of platforms", type: "select", options: [
          { value: 1, labelAr: "منصة واحدة", labelEn: "Single platform" },
          { value: 1.5, labelAr: "منصتين", labelEn: "Two platforms" },
          { value: 2, labelAr: "ثلاث منصات", labelEn: "Three platforms" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perPost = rules.find((r: any) => r.serviceId === "social-posts" && r.unitType === "piece")?.pricePerUnit || 200;
        return (vals.posts || 5) * perPost * (vals.platforms || 1);
      },
    },
    "logo-branding": {
      fields: [
        { key: "complexity", labelAr: "مستوى الحزمة", labelEn: "Package level", type: "select", options: [
          { value: 1, labelAr: "شعار فقط", labelEn: "Logo only" },
          { value: 1.8, labelAr: "هوية متكاملة", labelEn: "Full identity" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const base = rules.find((r: any) => r.serviceId === "logo-branding" && r.unitType === "piece")?.pricePerUnit || 800;
        return base * (vals.complexity || 1);
      },
    },
    "food-sugar-sheet": {
      fields: [
        { key: "quantity", labelAr: "عدد الأوراق", labelEn: "Number of sheets", type: "number", defaultValue: 5, min: 1 },
        { key: "size", labelAr: "المقاس", labelEn: "Size", type: "select", options: [
          { value: 1, labelAr: "A4 (21×29.7 سم)", labelEn: "A4 (21×29.7 cm)" },
          { value: 0.5, labelAr: "A5 (14.8×21 سم)", labelEn: "A5 (14.8×21 cm)" },
          { value: 0.25, labelAr: "مربع 10×10 سم", labelEn: "Square 10×10 cm" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perSheet = rules.find((r: any) => r.serviceId === "food-sugar-sheet" && r.unitType === "piece")?.pricePerUnit || 50;
        return (vals.quantity || 5) * perSheet * (vals.size || 1);
      },
    },
    "food-choco-transfer": {
      fields: [
        { key: "quantity", labelAr: "عدد الأوراق", labelEn: "Number of sheets", type: "number", defaultValue: 5, min: 1 },
        { key: "size", labelAr: "المقاس", labelEn: "Size", type: "select", options: [
          { value: 1, labelAr: "A4 (21×29.7 سم)", labelEn: "A4 (21×29.7 cm)" },
          { value: 0.5, labelAr: "A5 (14.8×21 سم)", labelEn: "A5 (14.8×21 cm)" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perSheet = rules.find((r: any) => r.serviceId === "food-choco-transfer" && r.unitType === "piece")?.pricePerUnit || 60;
        return (vals.quantity || 5) * perSheet * (vals.size || 1);
      },
    },
    "food-wafer-paper": {
      fields: [
        { key: "quantity", labelAr: "عدد الأوراق", labelEn: "Number of sheets", type: "number", defaultValue: 5, min: 1 },
        { key: "size", labelAr: "المقاس", labelEn: "Size", type: "select", options: [
          { value: 1, labelAr: "A4 (21×29.7 سم)", labelEn: "A4 (21×29.7 cm)" },
          { value: 0.5, labelAr: "A5 (14.8×21 سم)", labelEn: "A5 (14.8×21 cm)" },
          { value: 0.25, labelAr: "مربع 10×10 سم", labelEn: "Square 10×10 cm" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perSheet = rules.find((r: any) => r.serviceId === "food-wafer-paper" && r.unitType === "piece")?.pricePerUnit || 70;
        return (vals.quantity || 5) * perSheet * (vals.size || 1);
      },
    },
    "flag-desk-single": {
      fields: [
        { key: "material", labelAr: "نوع الخامة", labelEn: "Material type", type: "select", options: [
          { value: 1, labelAr: "قماش بوليستر", labelEn: "Polyester fabric" },
          { value: 1.3, labelAr: "ساتان فاخر", labelEn: "Premium satin" },
        ], defaultValue: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "flag-desk-single" && r.unitType === "piece")?.pricePerUnit || 35;
        return (vals.quantity || 1) * unit * (vals.material || 1);
      },
    },
    "flag-desk-double": {
      fields: [
        { key: "material", labelAr: "نوع الخامة", labelEn: "Material type", type: "select", options: [
          { value: 1, labelAr: "قماش بوليستر", labelEn: "Polyester fabric" },
          { value: 1.3, labelAr: "ساتان فاخر", labelEn: "Premium satin" },
        ], defaultValue: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "flag-desk-double" && r.unitType === "piece")?.pricePerUnit || 55;
        return (vals.quantity || 1) * unit * (vals.material || 1);
      },
    },
    "flag-desk-large": {
      fields: [
        { key: "material", labelAr: "نوع الخامة", labelEn: "Material type", type: "select", options: [
          { value: 1, labelAr: "بوليستر 150D", labelEn: "Polyester 150D" },
          { value: 1.5, labelAr: "نايلون مقاوم", labelEn: "Weather-resistant nylon" },
        ], defaultValue: 1 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "flag-desk-large" && r.unitType === "piece")?.pricePerUnit || 120;
        return (vals.quantity || 1) * unit * (vals.material || 1);
      },
    },
    "flag-outdoor-sail": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 100, min: 50 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 200, min: 50 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const unit = rules.find((r: any) => r.serviceId === "flag-outdoor-sail" && r.unitType === "piece")?.pricePerUnit || 250;
        const areaFactor = ((vals.width || 100) * (vals.height || 200)) / 20000;
        return (vals.quantity || 1) * unit * areaFactor;
      },
    },
    "print-sticker-reinforced": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 20, min: 5 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 30, min: 5 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 10, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "print-sticker-reinforced" && r.unitType === "cm2")?.pricePerUnit || 0.025;
        const area = (vals.width || 20) * (vals.height || 30);
        return area * perCm2 * (vals.quantity || 10);
      },
    },
    "print-id-cards": {
      fields: [
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 50, min: 10 },
        { key: "finish", labelAr: "نوع التشطيب", labelEn: "Finish type", type: "select", options: [
          { value: 1, labelAr: "عادي", labelEn: "Standard" },
          { value: 1.3, labelAr: "بلاستيك سميك", labelEn: "Thick plastic" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perPiece = rules.find((r: any) => r.serviceId === "print-id-cards" && r.unitType === "piece")?.pricePerUnit || 25;
        return (vals.quantity || 50) * perPiece * (vals.finish || 1);
      },
    },
    "print-sign-fixed": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 50, min: 20 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 30, min: 20 },
        { key: "material", labelAr: "الخامة", labelEn: "Material", type: "select", options: [
          { value: 1, labelAr: "أكريليك", labelEn: "Acrylic" },
          { value: 0.8, labelAr: "PVC", labelEn: "PVC" },
          { value: 1.4, labelAr: "معدن", labelEn: "Metal" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perPiece = rules.find((r: any) => r.serviceId === "print-sign-fixed" && r.unitType === "piece")?.pricePerUnit || 180;
        const area = ((vals.width || 50) * (vals.height || 30)) / 1500;
        return perPiece * area * (vals.material || 1);
      },
    },
    "print-sign-light": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 60, min: 30 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 40, min: 20 },
        { key: "type", labelAr: "نوع الإضاءة", labelEn: "Light type", type: "select", options: [
          { value: 1, labelAr: "LED داخلي", labelEn: "Internal LED" },
          { value: 1.5, labelAr: "LED خارجي مقاوم", labelEn: "Outdoor weatherproof LED" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perPiece = rules.find((r: any) => r.serviceId === "print-sign-light" && r.unitType === "piece")?.pricePerUnit || 350;
        const areaFactor = ((vals.width || 60) * (vals.height || 40)) / 2400;
        return perPiece * areaFactor * (vals.type || 1);
      },
    },
    "print-pvc-board": {
      fields: [
        { key: "width", labelAr: "العرض (سم)", labelEn: "Width (cm)", type: "number", defaultValue: 50, min: 20 },
        { key: "height", labelAr: "الطول (سم)", labelEn: "Height (cm)", type: "number", defaultValue: 70, min: 20 },
        { key: "quantity", labelAr: "الكمية", labelEn: "Quantity", type: "number", defaultValue: 1, min: 1 },
      ],
      calcFn: (vals, rules) => {
        const perCm2 = rules.find((r: any) => r.serviceId === "print-pvc-board" && r.unitType === "cm2")?.pricePerUnit || 0.05;
        const area = (vals.width || 50) * (vals.height || 70);
        return area * perCm2 * (vals.quantity || 1);
      },
    },
    "print-copiest": {
      fields: [
        { key: "pages", labelAr: "عدد الصفحات", labelEn: "Number of pages", type: "number", defaultValue: 100, min: 1 },
        { key: "color", labelAr: "نوع الطباعة", labelEn: "Print type", type: "select", options: [
          { value: 1, labelAr: "أبيض وأسود", labelEn: "B&W" },
          { value: 2.5, labelAr: "ملون", labelEn: "Color" },
        ], defaultValue: 1 },
      ],
      calcFn: (vals, rules) => {
        const perPiece = rules.find((r: any) => r.serviceId === "print-copiest" && r.unitType === "piece")?.pricePerUnit || 15;
        return (vals.pages || 100) * perPiece * (vals.color || 1);
      },
    },
  };
  return configs[serviceId] || null;
}

export interface CalculatorField {
  key: string;
  labelAr: string;
  labelEn: string;
  type: "number" | "select";
  options?: { value: number; labelAr: string; labelEn: string }[];
  defaultValue: number;
  min?: number;
}

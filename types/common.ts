export type Direction = "rtl" | "ltr";

export interface ServiceAttributeOption {
  labelAr: string;
  labelEn: string;
  value: string;
  priceModifier: number;
}

export interface ServiceAttribute {
  nameAr: string;
  nameEn: string;
  type: "select" | "color" | "size";
  required: boolean;
  options: ServiceAttributeOption[];
}

export interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  imageUrl?: string;
  basePrice: number;
  parentId: string | null;
  attributes?: ServiceAttribute[];
}

export interface ServiceCategory {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
}

export interface Package {
  id: string;
  nameAr: string;
  nameEn: string;
  items: string[];
  price: number;
  originalPrice: number;
  badge?: string;
}

export interface Review {
  id: string;
  name: string;
  textAr: string;
  textEn: string;
  rating: number;
  date: string;
}

export interface ReviewSubmission {
  id: string;
  name: string;
  textAr: string;
  textEn: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  src: string;
  altAr: string;
  altEn: string;
  order: number;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  nameAr: string;
  nameEn: string;
  pricePerUnit: number;
  unitType: string;
  updatedAt: string;
}

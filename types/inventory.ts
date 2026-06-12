export interface InventoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

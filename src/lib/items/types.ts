export interface OwnerMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface OwnerMenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isSoldOut: boolean;
  isBestSeller: boolean;
}

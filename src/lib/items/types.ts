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
  photoUrl: string | null;
  isSoldOut: boolean;
  isBestSeller: boolean;
  hasStaleTranslation: boolean;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface IngredientOption {
  id: string;
  name: string;
}

export interface ItemFormItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  photoUrl: string | null;
  isDisplayed: boolean;
  isSoldOut: boolean;
  isBestSeller: boolean;
  descriptionSource: "ai_generated" | "manual" | null;
  aiKeywords: string[] | null;
  ingredients: IngredientOption[];
}

export interface ItemFormData {
  categories: CategoryOption[];
  businessIngredients: IngredientOption[];
  item: ItemFormItem | null;
}

// types/item.ts
export enum ItemCategory {
  STARTER = "STARTER",
  MAIN = "MAIN",
  DESSERT = "DESSERT",
  SIDE = "SIDE",
  DRINK = "DRINK"
}

// Interface pour la création d'un article
export interface CreateItemInput {
  name: string;
  description?: string;
  category: ItemCategory; // Utilise l'enum ici
  basePrice: number;
  restaurantId: number;
  initialStock?: number;
}
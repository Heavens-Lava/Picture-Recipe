export interface Recipe {
  id: string;
  recipe_name: string;
  image_url: string;
  meal_image_url?: string;
  cookTime?: string;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  rating?: number;
  ingredients?: string[];
  availableIngredients?: number;
  totalIngredients?: number;
  instructions?: string;
}
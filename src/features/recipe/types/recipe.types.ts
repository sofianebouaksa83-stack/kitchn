export type RecipeDisplayIngredient = {
  id: string;
  quantity: number | null;
  unit: string | null;
  designation: string | null;
  order_index: number | null;
};

export type RecipeDisplaySection = {
  id: string;
  title: string | null;
  instructions: string | null;
  order_index: number | null;
};

export type RecipeSectionLink = {
  section_id: string;
  ingredient_id: string;
  order_index: number | null;
};

export type RecipeDisplayRow = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  notes: string | null;
  allergens: unknown;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string | null;
  recipe_sections?: RecipeDisplaySection[] | null;
};

export type RecipeDisplayData = {
  recipe: RecipeDisplayRow;
  ingredients: RecipeDisplayIngredient[];
  sections: RecipeDisplaySection[];
  links: RecipeSectionLink[];
  note: string;
  noteUpdatedAt: string | null;
};

export type RecipeListIngredient = {
  id: string;
  recipe_id: string;
  order_index: number | null;
  quantity: number | null;
  unit: string | null;
  designation: string | null;
  sub_recipe_id: string | null;
  cost_per_unit: number | null;
};

export type RecipeListItem = {
  id: string;
  created_by: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  allergens: unknown;
  steps: unknown;
  notes: string | null;
  is_base_recipe: boolean | null;
  is_visible: boolean | null;
  folder_id: string | null;
  created_at: string | null;
  ingredients: RecipeListIngredient[];
  is_favorite: boolean;
};

export type RecipeFolder = {
  id: string;
  name: string;
  created_by: string;
};

export type RecipeListData = {
  recipes: RecipeListItem[];
  folders: RecipeFolder[];
};
export type HomePageProps = {
  navigateTo: (path: string) => void;
  openRecipe?: (recipeId: string) => void;
  openSharedRecipe?: (
    recipeId: string,
    groupId: string
  ) => void;
};

export type RecipeItem = Record<string, any>;

export type SharedRecipeItem = {
  id: string;
  recipe_id: string;
  group_id: string;
  created_at?: string | null;
  recipe?: RecipeItem | null;
  group_name?: string | null;
};

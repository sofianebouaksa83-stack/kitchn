import type { RecipeItem } from "../types/home.types";

export const FREE_IMPORT_LIMIT = 30;

export function getRecipeDate(recipe: RecipeItem) {
  return (
    recipe?.created_at ||
    recipe?.updated_at ||
    recipe?.imported_at ||
    ""
  );
}

export function getRecipeTitle(
  recipe?: RecipeItem | null
) {
  return (
    recipe?.title ||
    recipe?.recipe_name ||
    recipe?.name ||
    recipe?.nom ||
    "Recette sans titre"
  );
}

export function getRecipeSubtitle(
  recipe?: RecipeItem | null
) {
  return (
    recipe?.category ||
    recipe?.categorie ||
    recipe?.type ||
    recipe?.recipe_type ||
    "Recette"
  );
}

export function uniqById(items: RecipeItem[]) {
  const itemsById = new Map<string, RecipeItem>();

  for (const item of items) {
    if (item?.id && !itemsById.has(item.id)) {
      itemsById.set(item.id, item);
    }
  }

  return Array.from(itemsById.values());
}
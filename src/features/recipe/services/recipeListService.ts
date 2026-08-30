import { supabase } from "../../../lib/supabase";
import type {
  RecipeFolder,
  RecipeListData,
  RecipeListIngredient,
  RecipeListItem,
} from "../types/recipe.types";

type FavoriteRelation = {
  user_id: string;
};

type RecipeQueryRow = Omit<
  RecipeListItem,
  "ingredients" | "is_favorite"
> & {
  favorite_recipes?: FavoriteRelation[] | null;
};

export async function loadRecipeListData(
  userId: string
): Promise<RecipeListData> {
  const [recipesResult, foldersResult] =
    await Promise.all([
      supabase
        .from("recipes")
        .select(
          `
            id,
            created_by,
            title,
            category,
            servings,
            prep_time,
            cook_time,
            allergens,
            steps,
            notes,
            is_base_recipe,
            is_visible,
            folder_id,
            created_at,
            favorite_recipes(user_id)
          `
        )
        .eq("created_by", userId)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("recipe_folders")
        .select("id, name, created_by")
        .eq("created_by", userId)
        .order("name", {
          ascending: true,
        }),
    ]);

  if (recipesResult.error) {
    throw recipesResult.error;
  }

  if (foldersResult.error) {
    throw foldersResult.error;
  }

  const recipeRows =
    (recipesResult.data ?? []) as unknown as RecipeQueryRow[];

  const recipeIds = recipeRows.map(
    (recipe) => recipe.id
  );

  let ingredients: RecipeListIngredient[] = [];

  if (recipeIds.length > 0) {
    const ingredientsResult = await supabase
      .from("ingredients")
      .select(
        `
          id,
          recipe_id,
          order_index,
          quantity,
          unit,
          designation,
          sub_recipe_id,
          cost_per_unit
        `
      )
      .in("recipe_id", recipeIds)
      .order("order_index", {
        ascending: true,
      });

    if (ingredientsResult.error) {
      throw ingredientsResult.error;
    }

    ingredients =
      (ingredientsResult.data ??
        []) as RecipeListIngredient[];
  }

  const ingredientsByRecipe = new Map<
    string,
    RecipeListIngredient[]
  >();

  for (const ingredient of ingredients) {
    const current =
      ingredientsByRecipe.get(
        ingredient.recipe_id
      ) ?? [];

    ingredientsByRecipe.set(
      ingredient.recipe_id,
      [...current, ingredient]
    );
  }

  const recipes = recipeRows.map(
    ({
      favorite_recipes,
      ...recipe
    }): RecipeListItem => ({
      ...recipe,
      folder_id: recipe.folder_id ?? null,
      ingredients:
        ingredientsByRecipe.get(recipe.id) ?? [],
      is_favorite: Array.isArray(
        favorite_recipes
      )
        ? favorite_recipes.some(
            (favorite) =>
              favorite.user_id === userId
          )
        : false,
    })
  );

  return {
    recipes,
    folders:
      (foldersResult.data ??
        []) as RecipeFolder[],
  };
}

export async function deleteRecipe(
  recipeId: string,
  userId: string
) {
  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .eq("created_by", userId);

  if (error) throw error;
}

export async function setRecipeVisibility(
  recipeId: string,
  userId: string,
  isVisible: boolean
) {
  const { error } = await supabase
    .from("recipes")
    .update({
      is_visible: isVisible,
    })
    .eq("id", recipeId)
    .eq("created_by", userId);

  if (error) throw error;
}

export async function setRecipeFavorite(
  recipeId: string,
  userId: string,
  isFavorite: boolean
) {
  if (isFavorite) {
    const { error } = await supabase
      .from("favorite_recipes")
      .insert({
        recipe_id: recipeId,
        user_id: userId,
      });

    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("favorite_recipes")
    .delete()
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function createRecipeFolder(
  name: string,
  userId: string
): Promise<RecipeFolder> {
  const { data, error } = await supabase
    .from("recipe_folders")
    .insert({
      name,
      created_by: userId,
    })
    .select("id, name, created_by")
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error(
      "Création du dossier impossible."
    );
  }

  return data as RecipeFolder;
}

export async function moveRecipeToFolder(
  recipeId: string,
  folderId: string | null,
  userId: string
) {
  const { error } = await supabase
    .from("recipes")
    .update({
      folder_id: folderId,
    })
    .eq("id", recipeId)
    .eq("created_by", userId);

  if (error) throw error;
}

export async function removeRecipeFolder(
  folderId: string,
  userId: string
) {
  const { error: unlinkError } =
    await supabase
      .from("recipes")
      .update({
        folder_id: null,
      })
      .eq("folder_id", folderId)
      .eq("created_by", userId);

  if (unlinkError) throw unlinkError;

  const { error: deleteError } =
    await supabase
      .from("recipe_folders")
      .delete()
      .eq("id", folderId)
      .eq("created_by", userId);

  if (deleteError) throw deleteError;
}

export async function renameRecipeFolder(
  folderId: string,
  name: string,
  userId: string
) {
  const { error } = await supabase
    .from("recipe_folders")
    .update({ name })
    .eq("id", folderId)
    .eq("created_by", userId);

  if (error) throw error;
}

export async function duplicateRecipe(
  recipe: RecipeListItem,
  userId: string
) {
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      created_by: userId,
      title: `${recipe.title ?? "Sans titre"} (copie)`,
      category: recipe.category,
      servings: recipe.servings,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      allergens: recipe.allergens,
      steps: recipe.steps,
      notes: recipe.notes,
      is_base_recipe: recipe.is_base_recipe,
      is_visible: recipe.is_visible,
      folder_id: recipe.folder_id,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      "Duplication de la recette impossible."
    );
  }

  if (recipe.ingredients.length === 0) {
    return;
  }

  const { error: ingredientsError } =
    await supabase.from("ingredients").insert(
      recipe.ingredients.map(
        (ingredient, index) => ({
          recipe_id: data.id,
          order_index: index,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          designation:
            ingredient.designation,
          sub_recipe_id:
            ingredient.sub_recipe_id,
          cost_per_unit:
            ingredient.cost_per_unit,
        })
      )
    );

  if (ingredientsError) {
    throw ingredientsError;
  }
}
import { supabase } from "../../../lib/supabase";
import type {
  RecipeDisplayData,
  RecipeDisplayIngredient,
  RecipeDisplayRow,
  RecipeSectionLink,
} from "../types/recipe.types";

async function loadRecipe(
  recipeId: string
): Promise<RecipeDisplayRow> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
        id,
        title,
        category,
        servings,
        prep_time,
        cook_time,
        notes,
        allergens,
        image_url,
        image_urls,
        created_at,
        recipe_sections (
          id,
          title,
          instructions,
          order_index
        )
      `
    )
    .eq("id", recipeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Recette introuvable");

  return data as RecipeDisplayRow;
}

async function loadIngredients(
  recipeId: string
): Promise<RecipeDisplayIngredient[]> {
  const { data, error } = await supabase
    .from("ingredients")
    .select(
      "id, quantity, unit, designation, order_index"
    )
    .eq("recipe_id", recipeId)
    .order("order_index", { ascending: true });

  if (error) throw error;

  return (data ?? []) as RecipeDisplayIngredient[];
}

async function loadSectionLinks(
  sectionIds: string[]
): Promise<RecipeSectionLink[]> {
  if (sectionIds.length === 0) return [];

  const { data, error } = await supabase
    .from("section_ingredients")
    .select("section_id, ingredient_id, order_index")
    .in("section_id", sectionIds)
    .order("order_index", { ascending: true });

  if (error) throw error;

  return (data ?? []) as RecipeSectionLink[];
}

async function loadPrivateNote(
  recipeId: string,
  userId?: string
) {
  if (!userId) {
    return {
      note: "",
      noteUpdatedAt: null as string | null,
    };
  }

  const { data, error } = await supabase
    .from("recipe_user_notes")
    .select("content, updated_at")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      note: "",
      noteUpdatedAt: null as string | null,
    };
  }

  return {
    note: data?.content ?? "",
    noteUpdatedAt: data?.updated_at ?? null,
  };
}

export async function loadRecipeDisplayData(
  recipeId: string,
  userId?: string
): Promise<RecipeDisplayData> {
  const [recipe, ingredients] = await Promise.all([
    loadRecipe(recipeId),
    loadIngredients(recipeId),
  ]);

  const sections = (recipe.recipe_sections ?? [])
    .slice()
    .sort(
      (first, second) =>
        (first.order_index ?? 0) -
        (second.order_index ?? 0)
    );

  const sectionIds = sections.map((section) => section.id);

  const [links, privateNote] = await Promise.all([
    loadSectionLinks(sectionIds),
    loadPrivateNote(recipeId, userId),
  ]);

  return {
    recipe,
    ingredients,
    sections,
    links,
    ...privateNote,
  };
}

export async function savePrivateRecipeNote(
  recipeId: string,
  userId: string,
  content: string
) {
  const { data, error } = await supabase
    .from("recipe_user_notes")
    .upsert(
      {
        recipe_id: recipeId,
        user_id: userId,
        content,
      },
      {
        onConflict: "recipe_id,user_id",
      }
    )
    .select("updated_at")
    .maybeSingle();

  if (error) throw error;

  return data?.updated_at ?? new Date().toISOString();
}
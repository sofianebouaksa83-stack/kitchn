import { supabase } from "../../../lib/supabase";
import type { RecipeItem } from "../types/home.types";
import {
  getRecipeDate,
  uniqById,
} from "../utils/homeHelpers";

export async function getMyLatestRecipes(
  userId: string
) {
  const queries = [
    supabase
      .from("recipes")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ];

  const results = await Promise.all(
    queries.map(async (query) => {
      const { data, error } = await query;

      if (error) {
        console.warn(
          "[HomePage] latest recipes query ignored:",
          error.message
        );

        return [] as RecipeItem[];
      }

      return (data || []) as RecipeItem[];
    })
  );

  return uniqById(results.flat())
    .sort((a, b) =>
      getRecipeDate(b).localeCompare(getRecipeDate(a))
    )
    .slice(0, 5);
}

export async function getMyRecipesCount(
  userId: string
) {
  const queries = [
    supabase
      .from("recipes")
      .select("id")
      .eq("created_by", userId),
    supabase
      .from("recipes")
      .select("id")
      .eq("user_id", userId),
  ];

  const ids = new Set<string>();

  for (const query of queries) {
    const { data, error } = await query;

    if (error) {
      console.warn(
        "[HomePage] recipes count query ignored:",
        error.message
      );

      continue;
    }

    (data || []).forEach((item: any) => {
      if (item?.id) {
        ids.add(item.id);
      }
    });
  }

  return ids.size;
}
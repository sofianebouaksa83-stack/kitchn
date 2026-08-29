import { supabase } from "../../../lib/supabase";
import type {
  RecipeItem,
  SharedRecipeItem,
} from "../types/home.types";
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

export async function getLatestSharedRecipes(
  groupIds: string[]
) {
  const { data: sharedRows, error } = await supabase
    .from("work_group_recipes")
    .select("*")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.warn(
      "[HomePage] latest shared recipes ignored:",
      error.message
    );

    return [] as SharedRecipeItem[];
  }

  if (!sharedRows || sharedRows.length === 0) {
    return [];
  }

  const recipeIds = sharedRows
    .map((row: any) => row.recipe_id)
    .filter(Boolean);

  const relatedGroupIds = sharedRows
    .map((row: any) => row.group_id)
    .filter(Boolean);

  const [recipesRes, groupsRes] = await Promise.all([
    recipeIds.length > 0
      ? supabase
          .from("recipes")
          .select("*")
          .in("id", recipeIds)
      : Promise.resolve({
          data: [] as any[],
          error: null,
        } as any),

    relatedGroupIds.length > 0
      ? supabase
          .from("work_groups")
          .select("id, name")
          .in("id", relatedGroupIds)
      : Promise.resolve({
          data: [] as any[],
          error: null,
        } as any),
  ]);

  if (recipesRes.error) {
    console.warn(
      "[HomePage] shared recipe details ignored:",
      recipesRes.error.message
    );
  }

  if (groupsRes.error) {
    console.warn(
      "[HomePage] shared group details ignored:",
      groupsRes.error.message
    );
  }

  const recipesById = new Map(
    (recipesRes.data || []).map((recipe: any) => [
      recipe.id,
      recipe,
    ])
  );

  const groupsById = new Map(
    (groupsRes.data || []).map((group: any) => [
      group.id,
      group.name,
    ])
  );

  return sharedRows.map((row: any) => ({
    id: row.id,
    recipe_id: row.recipe_id,
    group_id: row.group_id,
    created_at: row.created_at,
    recipe: recipesById.get(row.recipe_id) || null,
    group_name:
      groupsById.get(row.group_id) ||
      "Groupe partagé",
  })) as SharedRecipeItem[];
}

export async function getHomeUserIdentity() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const displayName =
    user.user_metadata?.first_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Chef";

  return {
    id: user.id,
    displayName,
  };
}

export async function getHomeGroupIds(userId: string) {
  const { data } = await supabase
    .from("group_members")
    .select("work_group_id")
    .eq("user_id", userId);

  return (data || [])
    .map((item) => item.work_group_id)
    .filter(
      (groupId): groupId is string =>
        typeof groupId === "string"
    );
}

export async function getHomeImportCount(
  userId: string,
  periodKey: string
) {
  const { data } = await supabase
    .from("ai_import_usage")
    .select("import_count")
    .eq("user_id", userId)
    .eq("period_key", periodKey)
    .maybeSingle();

  return data?.import_count || 0;
}

export async function getSharedRecipesCount(
  groupIds: string[]
) {
  const { count, error } = await supabase
    .from("work_group_recipes")
    .select("id", {
      count: "exact",
      head: true,
    })
    .in("group_id", groupIds);

  if (error) return 0;

  return count || 0;
}

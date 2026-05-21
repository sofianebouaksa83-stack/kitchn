import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useSubscription } from "../../hooks/useSubscription";
import { ui } from "../../styles/ui";
import { RecipeImportAIWidget } from "../Import/RecipeImportAIWidget";

const FREE_IMPORT_LIMIT = 30;

type HomePageProps = {
  navigateTo: (path: string) => void;
  openRecipe?: (recipeId: string) => void;
  openSharedRecipe?: (recipeId: string, groupId: string) => void;
};

type RecipeItem = Record<string, any>;

type SharedRecipeItem = {
  id: string;
  recipe_id: string;
  group_id: string;
  created_at?: string | null;
  recipe?: RecipeItem | null;
  group_name?: string | null;
};

function getRecipeDate(recipe: RecipeItem) {
  return recipe?.created_at || recipe?.updated_at || recipe?.imported_at || "";
}

function getRecipeTitle(recipe?: RecipeItem | null) {
  return (
    recipe?.title ||
    recipe?.recipe_name ||
    recipe?.name ||
    recipe?.nom ||
    "Recette sans titre"
  );
}

function getRecipeSubtitle(recipe?: RecipeItem | null) {
  return (
    recipe?.category ||
    recipe?.categorie ||
    recipe?.type ||
    recipe?.recipe_type ||
    "Recette"
  );
}

function uniqById(items: RecipeItem[]) {
  const map = new Map<string, RecipeItem>();

  for (const item of items) {
    if (item?.id && !map.has(item.id)) map.set(item.id, item);
  }

  return Array.from(map.values());
}

function unlockPageScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.touchAction = "";
}

export default function HomePage({
  navigateTo,
  openRecipe,
  openSharedRecipe,
}: HomePageProps) {
  const subscription = useSubscription() as {
    isPremium?: boolean;
    loading?: boolean;
  };

  const isPremium = !!subscription.isPremium;
  const subscriptionLoading = !!subscription.loading;

  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("Chef");
  const [recipesCount, setRecipesCount] = useState(0);
  const [sharedCount, setSharedCount] = useState(0);
  const [importCount, setImportCount] = useState(0);
  const [latestRecipes, setLatestRecipes] = useState<RecipeItem[]>([]);
  const [latestSharedRecipes, setLatestSharedRecipes] = useState<
    SharedRecipeItem[]
  >([]);

  useEffect(() => {
    unlockPageScroll();

    const onPageShow = () => unlockPageScroll();
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    void loadHomeData();

    const onRefresh = () => void loadHomeData();
    const onVisibility = () => {
      if (!document.hidden) void loadHomeData();
    };

    window.addEventListener("focus", onRefresh);
    window.addEventListener("popstate", onRefresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("focus", onRefresh);
      window.removeEventListener("popstate", onRefresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);

  async function loadHomeData() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const displayName =
        user.user_metadata?.first_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Chef";

      setFirstName(displayName);

      const periodKey = new Date().toISOString().slice(0, 7);

      const [recipesData, recipesTotal, groupMembersRes, importUsageRes] =
        await Promise.all([
          getMyLatestRecipes(user.id),
          getMyRecipesCount(user.id),
          supabase
            .from("group_members")
            .select("work_group_id")
            .eq("user_id", user.id),
          supabase
            .from("ai_import_usage")
            .select("import_count")
            .eq("user_id", user.id)
            .eq("period_key", periodKey)
            .maybeSingle(),
        ]);

      setLatestRecipes(recipesData);
      setRecipesCount(recipesTotal);
      setImportCount(importUsageRes.data?.import_count || 0);

      const groupIds =
        groupMembersRes.data
          ?.map((item: any) => item.work_group_id)
          .filter(Boolean) || [];

      setSharedCount(0);
      setLatestSharedRecipes([]);

      if (groupIds.length === 0) return;

      const { count: sharedTotal, error: sharedCountError } = await supabase
        .from("work_group_recipes")
        .select("id", { count: "exact", head: true })
        .in("group_id", groupIds);

      if (!sharedCountError) setSharedCount(sharedTotal || 0);

      const latestShared = await getLatestSharedRecipes(groupIds);
      setLatestSharedRecipes(latestShared);
    } catch (error) {
      console.error("[HomePage] loadHomeData error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getMyLatestRecipes(userId: string) {
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
            error.message,
          );
          return [] as RecipeItem[];
        }

        return (data || []) as RecipeItem[];
      }),
    );

    return uniqById(results.flat())
      .sort((a, b) => getRecipeDate(b).localeCompare(getRecipeDate(a)))
      .slice(0, 5);
  }

  async function getMyRecipesCount(userId: string) {
    const queries = [
      supabase.from("recipes").select("id").eq("created_by", userId),
      supabase.from("recipes").select("id").eq("user_id", userId),
    ];

    const ids = new Set<string>();

    for (const query of queries) {
      const { data, error } = await query;

      if (error) {
        console.warn("[HomePage] recipes count query ignored:", error.message);
        continue;
      }

      (data || []).forEach((item: any) => item?.id && ids.add(item.id));
    }

    return ids.size;
  }

  async function getLatestSharedRecipes(groupIds: string[]) {
    const { data: sharedRows, error } = await supabase
      .from("work_group_recipes")
      .select("*")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("[HomePage] latest shared recipes ignored:", error.message);
      return [] as SharedRecipeItem[];
    }

    if (!sharedRows || sharedRows.length === 0) return [];

    const recipeIds = sharedRows
      .map((row: any) => row.recipe_id)
      .filter(Boolean);
    const relatedGroupIds = sharedRows
      .map((row: any) => row.group_id)
      .filter(Boolean);

    const [recipesRes, groupsRes] = await Promise.all([
      recipeIds.length > 0
        ? supabase.from("recipes").select("*").in("id", recipeIds)
        : Promise.resolve({ data: [] as any[], error: null } as any),
      relatedGroupIds.length > 0
        ? supabase
            .from("work_groups")
            .select("id, name")
            .in("id", relatedGroupIds)
        : Promise.resolve({ data: [] as any[], error: null } as any),
    ]);

    if (recipesRes.error) {
      console.warn(
        "[HomePage] shared recipe details ignored:",
        recipesRes.error.message,
      );
    }

    if (groupsRes.error) {
      console.warn(
        "[HomePage] shared group details ignored:",
        groupsRes.error.message,
      );
    }

    const recipesById = new Map(
      (recipesRes.data || []).map((recipe: any) => [recipe.id, recipe]),
    );
    const groupsById = new Map(
      (groupsRes.data || []).map((group: any) => [group.id, group.name]),
    );

    return sharedRows.map((row: any) => ({
      id: row.id,
      recipe_id: row.recipe_id,
      group_id: row.group_id,
      created_at: row.created_at,
      recipe: recipesById.get(row.recipe_id) || null,
      group_name: groupsById.get(row.group_id) || "Groupe partagé",
    })) as SharedRecipeItem[];
  }

  function handleOpenRecipe(recipeId: string) {
    sessionStorage.setItem("selectedRecipeId", recipeId);
    window.dispatchEvent(
      new CustomEvent("kitchn:open-recipe", { detail: { recipeId } }),
    );

    if (openRecipe) {
      openRecipe(recipeId);
      return;
    }

    navigateTo("/recipes");
  }

  function handleOpenSharedRecipe(recipeId: string, groupId: string) {
    sessionStorage.setItem("selectedSharedRecipeId", recipeId);
    sessionStorage.setItem("selectedWorkGroupId", groupId);
    sessionStorage.setItem("selectedSharedGroupId", groupId);
    window.dispatchEvent(
      new CustomEvent("kitchn:open-shared-recipe", {
        detail: { recipeId, groupId },
      }),
    );

    if (openSharedRecipe) {
      openSharedRecipe(recipeId, groupId);
      return;
    }

    navigateTo("/shared");
  }

  const importValue = useMemo(() => {
    if (subscriptionLoading) return "...";
    if (isPremium) return importCount;
    return Math.max(FREE_IMPORT_LIMIT - importCount, 0);
  }, [subscriptionLoading, isPremium, importCount]);

  const importLabel = subscriptionLoading
    ? "Imports IA"
    : isPremium
      ? "Imports IA faits"
      : "Imports IA restants";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-bold">
            Bonjour <span className="text-[#D4AF37]">{firstName}</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigateTo("/recipes/new")}
          className={ui.btnPrimary}
        >
          <Plus className="h-4 w-4" />
          Nouvelle recette
        </button>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Résumé</h2>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <StatCard icon={<BookOpen />} value={recipesCount} label="Recettes" />
          <StatCard
            icon={<Users />}
            value={sharedCount}
            label="Recettes partagées"
          />
          <StatCard
            icon={<Sparkles />}
            value={subscriptionLoading ? "..." : importValue}
            label={importLabel}
          />
        </div>
      </section>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Dernières recettes ajoutées"
          onClick={() => navigateTo("/recipes")}
        >
          {loading ? (
            <LoadingLine />
          ) : latestRecipes.length === 0 ? (
            <EmptyLine text="Aucune recette récente pour le moment." />
          ) : (
            <div className="space-y-3">
              {latestRecipes.map((recipe) => (
                <ListItem
                  key={recipe.id}
                  title={getRecipeTitle(recipe)}
                  subtitle={getRecipeSubtitle(recipe)}
                  onClick={() => handleOpenRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title="Dernières recettes partagées"
          onClick={() => navigateTo("/shared")}
        >
          {loading ? (
            <LoadingLine />
          ) : latestSharedRecipes.length === 0 ? (
            <EmptyLine text="Aucune recette partagée pour le moment." />
          ) : (
            <div className="space-y-3">
              {latestSharedRecipes.map((item) => (
                <ListItem
                  key={item.id}
                  title={getRecipeTitle(item.recipe)}
                  subtitle={item.group_name || "Groupe partagé"}
                  onClick={() =>
                    handleOpenSharedRecipe(item.recipe_id, item.group_id)
                  }
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <RecipeImportAIWidget onOpenFull={() => navigateTo("/import")} />
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="w-full min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:rounded-3xl sm:p-5">
      <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] sm:h-11 sm:w-11">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xl font-bold leading-none sm:text-3xl">{value}</p>
          <p className="mt-1 text-[11px] leading-tight text-white/55 sm:text-sm">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
        <h3 className="min-w-0 truncate font-semibold">{title}</h3>

        <button
          type="button"
          onClick={onClick}
          className="shrink-0 text-sm text-[#D4AF37]"
        >
          Voir tout
        </button>
      </div>

      {children}
    </div>
  );
}

function ListItem({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-left transition hover:bg-white/[0.06]"
    >
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words font-medium text-white">
          {title}
        </p>
        <p className="mt-1 truncate text-sm text-white/45">{subtitle}</p>
      </div>

      <ArrowRight className="ml-3 h-4 w-4 shrink-0 text-white/35" />
    </button>
  );
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
      {text}
    </div>
  );
}

function LoadingLine() {
  return (
    <div className="flex items-center gap-2 text-sm text-white/50">
      <Loader2 className="h-4 w-4 animate-spin" />
      Chargement...
    </div>
  );
}

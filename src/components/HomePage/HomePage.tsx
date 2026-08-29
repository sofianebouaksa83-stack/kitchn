import { useEffect, useMemo } from "react";
import {
  BookOpen,
  Users,
  Sparkles,
  Plus,
} from "lucide-react";
import { useSubscription } from "../../hooks/useSubscription";
import { ui } from "../../styles/ui";
import { RecipeImportAIWidget } from "../Import/RecipeImportAIWidget";
import type { HomePageProps } from "../../features/home/types/home.types";
import { FREE_IMPORT_LIMIT, getRecipeSubtitle, getRecipeTitle, } from "../../features/home/utils/homeHelpers";
import { HomeStatCard } from "../../features/home/components/HomeStatCard";
import { HomePanel } from "../../features/home/components/HomePanel";
import { HomeListItem } from "../../features/home/components/HomeListItem";
import { HomeEmptyLine } from "../../features/home/components/HomeEmptyLine";
import { HomeLoadingLine } from "../../features/home/components/HomeLoadingLine";
import { useHomeData } from "../../features/home/hooks/useHomeData";

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
  const {
    loading,
    firstName,
    recipesCount,
    sharedCount,
    importCount,
    latestRecipes,
    latestSharedRecipes,
  } = useHomeData(isPremium);


  useEffect(() => {
    unlockPageScroll();

    const onPageShow = () => unlockPageScroll();
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

    
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
          <HomeStatCard icon={<BookOpen />} value={recipesCount} label="Recettes" />
          <HomeStatCard
            icon={<Users />}
            value={sharedCount}
            label="Recettes partagées"
          />
          <HomeStatCard
            icon={<Sparkles />}
            value={subscriptionLoading ? "..." : importValue}
            label={importLabel}
          />
        </div>
      </section>

      <div className="grid w-full min-w-0 grid-cols-1 gap-5 lg:grid-cols-2">
        <HomePanel
          title="Dernières recettes ajoutées"
          onClick={() => navigateTo("/recipes")}
        >
          {loading ? (
            <HomeLoadingLine />
          ) : latestRecipes.length === 0 ? (
            <HomeEmptyLine text="Aucune recette récente pour le moment." />
          ) : (
            <div className="space-y-3">
              {latestRecipes.map((recipe) => (
                <HomeListItem
                  key={recipe.id}
                  title={getRecipeTitle(recipe)}
                  subtitle={getRecipeSubtitle(recipe)}
                  onClick={() => handleOpenRecipe(recipe.id)}
                />
              ))}
            </div>
          )}
        </HomePanel>

        <HomePanel
          title="Dernières recettes partagées"
          onClick={() => navigateTo("/shared")}
        >
          {loading ? (
            <HomeLoadingLine />
          ) : latestSharedRecipes.length === 0 ? (
            <HomeEmptyLine text="Aucune recette partagée pour le moment." />
          ) : (
            <div className="space-y-3">
              {latestSharedRecipes.map((item) => (
                <HomeListItem
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
        </HomePanel>
      </div>

      <RecipeImportAIWidget onOpenFull={() => navigateTo("/import")} />
    </div>
  );
}
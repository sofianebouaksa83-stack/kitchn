import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Heart,
  Eye,
  FolderPlus,
  Folder,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type RecipeListDemoPanelProps = {
  onCreateNew?: () => void;
  onOpenRecipe?: (id: string) => void;
  autoDemo?: boolean;
  highlightedRecipeId?: string;
};

type DemoRecipe = {
  id: string;
  title: string;
  category: string;
  servings: number;
  prep: number;
  cook: number;
  folder?: string;
  isFavorite?: boolean;
};

type DemoFolder = {
  id: string;
  name: string;
  count: number;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function RecipeListDemoPanel({
  onCreateNew,
  onOpenRecipe,
  autoDemo = false,
  highlightedRecipeId,
}: RecipeListDemoPanelProps) {
  const recipes = useMemo<DemoRecipe[]>(
    () => [
      {        
        id: "demo-1",
        title: "Carpaccio de bar, citron confit",
        category: "Entrée",
        servings: 4,
        prep: 15,
        cook: 0,
        folder: "Toutes les recettes",
        isFavorite: true,
      },
      {
        id: "demo-2",
        title: "Volaille rôtie, jus réduit",
        category: "Plat",
        servings: 6,
        prep: 25,
        cook: 45,
        folder: "Toutes les recettes",
        isFavorite: true,
      },
      {
        id: "demo-3",
        title: "Pomme de terre fondante, beurre noisette",
        category: "Garniture",
        servings: 8,
        prep: 20,
        cook: 35,
        folder: "Toutes les recettes",
        isFavorite: false,
      },
      {
        id: "demo-4",
        title: "Ganache chocolat, fleur de sel",
        category: "Dessert",
        servings: 10,
        prep: 15,
        cook: 10,
        folder: "Toutes les recettes",
        isFavorite: false,
      },
    ],
    []
  );

  const folders = useMemo<DemoFolder[]>(
    () => [
      { id: "all", name: "Toutes les recettes", count: recipes.length },
      {
        id: "favorites",
        name: "Mes favoris",
        count: recipes.filter((r) => r.isFavorite).length,
      },
      { id: "entrees", name: "entrées", count: 1 },
      { id: "plats", name: "plats", count: 1 },
      { id: "garnitures", name: "garnitures", count: 1 },
      { id: "desserts", name: "desserts", count: 1 },
    ],
    [recipes]
  );

  const [activeFolder, setActiveFolder] = useState<string>("all");

  const visibleRecipes = useMemo(() => {
    if (activeFolder === "favorites") {
      return recipes.filter((recipe) => recipe.isFavorite);
    }

    if (activeFolder === "entrees") {
      return recipes.filter((recipe) => recipe.category === "Entrée");
    }

    if (activeFolder === "plats") {
      return recipes.filter((recipe) => recipe.category === "Plat");
    }

    if (activeFolder === "garnitures") {
      return recipes.filter((recipe) => recipe.category === "Garniture");
    }

    if (activeFolder === "desserts") {
      return recipes.filter((recipe) => recipe.category === "Dessert");
    }

    return recipes;
  }, [activeFolder, recipes]);

  return (
    <div className="h-full w-full rounded-[28px] bg-[#0E1736]/95 ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-3 sm:p-4 lg:p-5">
      <div className="flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-semibold text-slate-100">
              Mes recettes
            </div>
            <div className="mt-1 text-[11px] sm:text-xs text-slate-300/70">
              Toutes •{" "}
              <span className="font-medium text-slate-200">
                {visibleRecipes.length}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCreateNew?.()}
            className={cn(
              ui.btnPrimary,
              "h-9 sm:h-10 rounded-xl px-3 sm:px-4 text-xs sm:text-sm shrink-0"
            )}
            title="Nouvelle recette"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle recette</span>
            <span className="sm:hidden">Nouvelle</span>
          </button>
        </div>

        {/* Layout */}
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <div className="min-h-0 rounded-[24px] border border-white/10 bg-white/[0.06] p-3 sm:p-4">
            <div className="mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-slate-200/85">
              Dossiers
            </div>

            <div className="space-y-2">
              {folders.slice(0, 2).map((folder) => {
                const isActive = activeFolder === folder.id;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolder(folder.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition",
                      isActive
                        ? "bg-white/12 text-white"
                        : "text-slate-200/90 hover:bg-white/[0.05]"
                    )}
                  >
                    <span className="truncate text-xs sm:text-sm font-medium">
                      {folder.name}
                    </span>

                    {folder.id === "favorites" ? (
                      <Heart className="h-4 w-4 opacity-80" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="my-3 border-t border-white/10" />

            <div className="space-y-1.5">
              {folders.slice(2).map((folder) => {
                const isActive = activeFolder === folder.id;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolder(folder.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition",
                      isActive
                        ? "bg-white/8 text-white"
                        : "text-slate-200/85 hover:bg-white/[0.04]"
                    )}
                  >
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-xs sm:text-sm">
                      {folder.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({folder.count})
                    </span>
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3">
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-amber-300/95 opacity-80 cursor-not-allowed"
                title="Démo"
              >
                <FolderPlus className="h-4 w-4" />
                Nouveau dossier
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="min-h-0">
            {/* Toolbar */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div
                className={cn(
                  ui.cardSoft,
                  "flex h-10 sm:h-11 items-center gap-2 rounded-2xl px-3 sm:px-4 w-full"
                )}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300/70" />
                <div className="truncate text-xs sm:text-sm text-slate-300/70">
                  Rechercher par nom ou ingrédient...
                </div>
              </div>

              <div
                className={cn(
                  ui.cardSoft,
                  "flex h-10 sm:h-11 w-full sm:w-[180px] items-center justify-between rounded-2xl px-3 sm:px-4 shrink-0"
                )}
              >
                <span className="text-xs sm:text-sm text-slate-100">Toutes</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Recipes list */}
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02]">
              <div className="divide-y divide-white/10">
                {visibleRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenRecipe?.(recipe.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onOpenRecipe?.(recipe.id);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-4 transition-all duration-500 cursor-pointer",
                      highlightedRecipeId === recipe.id
                        ? "bg-white/[0.08] ring-1 ring-amber-300/20"
                        : "hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-xs sm:text-sm font-semibold text-slate-100">
                          {recipe.title}
                        </div>

                        <span className="hidden sm:inline-flex shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] sm:text-[11px] text-slate-200">
                          {recipe.category}
                        </span>
                      </div>

                      <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                        Prép {recipe.prep}min · Cuisson {recipe.cook}min ·{" "}
                        {recipe.servings} couverts
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-3 text-slate-400">
                      <Heart
                        className={cn(
                          "h-4 w-4 sm:h-[18px] sm:w-[18px]",
                          recipe.isFavorite ? "text-slate-200" : "opacity-70"
                        )}
                      />
                      <Eye className="h-4 w-4 sm:h-[18px] sm:w-[18px] opacity-80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 px-1 text-[10px] sm:text-xs text-slate-400">
              Démo visuelle de la liste des recettes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
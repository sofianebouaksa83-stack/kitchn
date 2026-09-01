import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Heart,
  Eye,
  FolderPlus,
  Folder,
  MoreVertical,
  ChevronDown,
  Filter,
  Share2,
  Tag,
  Trash2,
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
      {
        id: "demo-5",
        title: "Suprême de volaille fermière, jus court",
        category: "Autre",
        servings: 6,
        prep: 20,
        cook: 25,
        folder: "Toutes les recettes",
        isFavorite: false,
      },
      {
        id: "demo-6",
        title: "Soupe tomate basilic confit",
        category: "Autre",
        servings: 8,
        prep: 15,
        cook: 30,
        folder: "Toutes les recettes",
        isFavorite: true,
      },
      {
        id: "demo-7",
        title: "Bar de ligne rôti, fenouil confit",
        category: "Autre",
        servings: 4,
        prep: 25,
        cook: 18,
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
      { id: "entrees", name: "entrées", count: recipes.filter((r) => r.category === "Entrée").length },
      { id: "plats", name: "plats", count: recipes.filter((r) => r.category === "Plat").length },
      {
        id: "garnitures",
        name: "garnitures",
        count: recipes.filter((r) => r.category === "Garniture").length,
      },
      {
        id: "desserts",
        name: "desserts",
        count: recipes.filter((r) => r.category === "Dessert").length,
      },
    ],
    [recipes]
  );

  const mobileCategories = useMemo(() => {
    const ordered = ["Toutes", "Autre", "Entrée", "Plat", "Garniture", "Dessert"];
    return ordered.filter((cat) =>
      cat === "Toutes" || recipes.some((r) => r.category === cat)
    );
  }, [recipes]);

  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [activeMobileCategory, setActiveMobileCategory] = useState<string>("Toutes");

  const desktopVisibleRecipes = useMemo(() => {
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

  const mobileVisibleRecipes = useMemo(() => {
    if (activeMobileCategory === "Toutes") return recipes;
    return recipes.filter((recipe) => recipe.category === activeMobileCategory);
  }, [activeMobileCategory, recipes]);

  return (
    <div className="h-full w-full">
      {/* MOBILE ONLY */}
        <div className="lg:hidden h-full w-full bg-transparent ring-0 shadow-none overflow-hidden">        
          <div className="flex h-full min-h-0 flex-col px-0 pt-0 pb-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[18px] font-semibold tracking-tight text-slate-100">
                Mes recettes
              </div>
              <div className="mt-1 text-sm text-slate-300/80">
                Toutes •{" "}
                <span className="font-semibold text-slate-100">
                  {mobileVisibleRecipes.length}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="h-12 w-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 inline-flex items-center justify-center text-slate-100"
              aria-label="Filtres"
              title="Filtres"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={() => onCreateNew?.()}
              className={cn(ui.btnPrimary, "w-full h-12 rounded-2xl justify-center")}
            >
              <Plus className="w-5 h-5" />
              Nouvelle recette
            </button>
          </div>

          <div className="mt-5 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300/70 pointer-events-none" />
            <div className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 border border-white/10 text-slate-400/70 flex items-center">
              Rechercher par nom ou ingrédient...
            </div>
          </div>

          <div className="mt-4 overflow-x-auto [-webkit-overflow-scrolling:touch] no-scrollbar">
            <div className="flex items-center gap-2 min-w-max pr-2">
              {mobileCategories.map((cat) => {
                const active = cat === activeMobileCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveMobileCategory(cat)}
                    className={cn(
                      "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap ring-1 transition",
                      active
                        ? "bg-amber-400/20 ring-amber-300/30 text-amber-100"
                        : "bg-white/[0.05] ring-white/10 text-slate-200"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 min-h-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto no-scrollbar divide-y divide-white/10">
              {mobileVisibleRecipes.map((recipe) => (
                <div key={recipe.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => onOpenRecipe?.(recipe.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") onOpenRecipe?.(recipe.id);
                      }}
                      className="min-w-0 flex-1 outline-none"
                    >
                      <div
                        className={cn(
                          "text-[15px] font-medium tracking-tight text-white truncate transition",
                          highlightedRecipeId === recipe.id && "text-amber-100"
                        )}
                      >
                        {recipe.title}
                      </div>

                      <div className="mt-1 text-xs text-white/50 flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-white/40" />
                        {recipe.category}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled
                      className="h-10 w-10 rounded-full bg-white/[0.04] ring-1 ring-white/10 inline-flex items-center justify-center text-white/60"
                      aria-label="Actions"
                      title="Actions"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-white/60">
                    <button
                      type="button"
                      disabled
                      className="h-10 w-10 rounded-full inline-flex items-center justify-center"
                      title="Partager"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      disabled
                      className={cn(
                        "h-10 w-10 rounded-full inline-flex items-center justify-center",
                        recipe.isFavorite ? "text-amber-300" : ""
                      )}
                      title="Favori"
                    >
                      <Heart className={cn("w-5 h-5", recipe.isFavorite && "fill-current")} />
                    </button>

                    <button
                      type="button"
                      disabled
                      className="h-10 w-10 rounded-full inline-flex items-center justify-center"
                      title="Visible"
                    >
                      <Eye className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />

                    <button
                      type="button"
                      disabled
                      className="h-10 w-10 rounded-full inline-flex items-center justify-center text-white/60"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP / TABLET */}
      <div className="hidden lg:block h-full w-full rounded-[28px] bg-[#0E1736]/95 ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-3 sm:p-4 lg:p-5">
        <div className="flex h-full min-h-0 flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-semibold text-slate-100">
                Mes recettes
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-300/70">
                Toutes •{" "}
                <span className="font-medium text-slate-200">
                  {desktopVisibleRecipes.length}
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

          <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[220px_1fr]">
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

            <div className="min-h-0">
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

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02]">
                <div className="divide-y divide-white/10">
                  {desktopVisibleRecipes.map((recipe) => (
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
    </div>
  );
}
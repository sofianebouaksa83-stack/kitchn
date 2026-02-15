import React, { useMemo, useState } from "react";
import { Share2, Clock, Users, Folder, ArrowLeft, Eye } from "lucide-react";
import { ui } from "../../../styles/ui";

type GroupMini = { id: string; name: string };

type DemoRecipe = {
  id: string;
  title: string;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  created_by: string; // fake
  groups: GroupMini[];
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function SharedRecipesDemo() {
  // --- DEMO DATA (copie la logique de tes dossiers + badges) ---
  const userGroups = useMemo<GroupMini[]>(
    () => [
      { id: "bistro", name: "BISTRO" },
      { id: "jdb", name: "JDB" },
    ],
    []
  );

  const recipes = useMemo<DemoRecipe[]>(
    () => [
      {
        id: "r1",
        title: "carpaccio de langoustine, pomme…",
        category: "Autre",
        servings: 4,
        prep_time: 0,
        cook_time: 0,
        created_by: "demo-user",
        groups: [{ id: "bistro", name: "BISTRO" }],
      },
    ],
    []
  );

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const folders = useMemo(() => {
    const map = new Map<string, { group: GroupMini; recipes: DemoRecipe[] }>();

    for (const g of userGroups) {
      map.set(g.id, { group: g, recipes: [] });
    }

    for (const r of recipes) {
      for (const g of r.groups) {
        if (!map.has(g.id)) map.set(g.id, { group: g, recipes: [] });
        map.get(g.id)!.recipes.push(r);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.group.name.localeCompare(b.group.name));
  }, [recipes, userGroups]);

  const visibleRecipes = useMemo(() => {
    if (!selectedGroupId) return recipes;
    return recipes.filter((r) => r.groups.some((g) => g.id === selectedGroupId));
  }, [recipes, selectedGroupId]);

  const showFolders = userGroups.length > 1 && !selectedGroupId;
  const emptyStateFolders = userGroups.length === 0;
  const emptyStateRecipes = visibleRecipes.length === 0 && !showFolders;

  const headerActions =
    userGroups.length > 1 && selectedGroupId ? (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSelectedGroupId(null)}
          className="h-11 w-11 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-slate-200 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
          title="Retour aux dossiers"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-slate-200 text-sm">
          Dossier :{" "}
          <span className="font-semibold">
            {userGroups.find((g) => g.id === selectedGroupId)?.name ?? "—"}
          </span>
        </div>
      </div>
    ) : null;

  // --- DEMO: si “Voir” cliqué, on affiche juste un panneau (pas RecipeDisplay) ---
  if (selectedRecipeId) {
    const r = recipes.find((x) => x.id === selectedRecipeId);
    return (
      <div className={ui.dashboardBg}>
        <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
          <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                  <Share2 className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-100">Partager</div>
                  <div className="text-sm text-slate-300/70">Recettes visibles via tes groupes de travail</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRecipeId(null)}
                className={`${ui.btnGhost} px-5 py-2.5 rounded-2xl`}
              >
                Retour
              </button>
            </div>

            <div className={cn(ui.cardSoft, "p-5 rounded-3xl")}>
              <div className="text-sm text-slate-300/70 mb-2">Aperçu recette (démo)</div>
              <div className="text-xl font-semibold text-slate-100 truncate">{r?.title ?? "—"}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-100">
                  {r?.category || "Sans catégorie"}
                </span>
                {(r?.groups ?? []).map((g) => (
                  <span
                    key={g.id}
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-200"
                  >
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-300/80">
                  <Users className="w-4 h-4" />
                  <span>{r?.servings ?? "—"} couverts</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300/80">
                  <Clock className="w-4 h-4" />
                  <span>
                    Prép: {r?.prep_time ?? "—"}min · Cuisson: {r?.cook_time ?? "—"}min
                  </span>
                </div>
              </div>

              <div className="mt-6 text-xs text-slate-400">
                Ici tu peux afficher un vrai <code>RecipeDisplay</code> plus tard, mais en landing on garde safe (sans data).
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <Share2 className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Partager</h1>
                <p className="text-sm text-slate-300/70 mt-1">Recettes visibles via tes groupes de travail</p>
                <p className="text-xs text-slate-400 mt-2">Démo • mêmes cartes que la page réelle</p>
              </div>
            </div>

            {headerActions}
          </div>

          {/* Empty: no groups */}
          {emptyStateFolders ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
              <Share2 className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-200 text-lg font-semibold">Tu n’es dans aucun groupe pour le moment</p>
              <p className="text-sm text-slate-300/70 mt-2">Rejoins un restaurant ou demande une invitation.</p>
            </div>
          ) : showFolders ? (
            /* FOLDERS */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {folders.map((f) => (
                <button
                  key={f.group.id}
                  onClick={() => setSelectedGroupId(f.group.id)}
                  title={`Ouvrir ${f.group.name}`}
                  type="button"
                  className={[
                    "text-left",
                    "relative rounded-3xl border ring-1 overflow-hidden",
                    "border-white/10 ring-white/10 bg-white/[0.06]",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                    "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
                  ].join(" ")}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                        <Folder className="w-5 h-5 text-amber-200" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg font-semibold text-slate-100 truncate">{f.group.name}</div>
                        <div className="text-sm text-slate-300/70">
                          {f.recipes.length} recette{f.recipes.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
                </button>
              ))}
            </div>
          ) : (
            /* RECIPES LIST */
            <>
              {emptyStateRecipes ? (
                <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-10 text-center">
                  <Eye className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-200 text-lg font-semibold">Aucune recette partagée dans ce groupe</p>
                  <p className="text-sm text-slate-300/70 mt-2">Les recettes apparaissent ici quand quelqu’un partage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleRecipes.map((recipe) => {
                    const shown = recipe.groups.slice(0, 2);
                    const extra = recipe.groups.length - shown.length;

                    return (
                      <div
                        key={recipe.id}
                        onClick={() => setSelectedRecipeId(recipe.id)}
                        className={[
                          "cursor-pointer",
                          "relative rounded-3xl border ring-1 overflow-hidden",
                          "border-white/10 ring-white/10 bg-white/[0.06]",
                          "shadow-[0_18px_60px_rgba(0,0,0,0.30)]",
                          "transition-transform duration-200 hover:-translate-y-1 active:scale-[0.99] hover:bg-white/[0.08]",
                        ].join(" ")}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setSelectedRecipeId(recipe.id);
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4 gap-3">
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-slate-100 tracking-tight truncate">
                                {recipe.title}
                              </h3>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-100">
                                  {recipe.category || "Sans catégorie"}
                                </span>

                                {shown.map((g) => (
                                  <span
                                    key={g.id}
                                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-200"
                                    title={`Groupe : ${g.name}`}
                                  >
                                    {g.name}
                                  </span>
                                ))}

                                {extra > 0 && (
                                  <span
                                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-300"
                                    title={`${extra} autre(s) groupe(s)`}
                                  >
                                    +{extra}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center">
                              <Eye className="w-5 h-5 text-slate-200" />
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300/80">
                              <Users className="w-4 h-4" />
                              <span>{recipe.servings} couverts</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300/80">
                              <Clock className="w-4 h-4" />
                              <span>
                                Prép: {recipe.prep_time}min · Cuisson: {recipe.cook_time}min
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRecipeId(recipe.id);
                              }}
                              className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors"
                              title="Voir la recette"
                              type="button"
                            >
                              Voir
                            </button>
                            <div />
                          </div>
                        </div>

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

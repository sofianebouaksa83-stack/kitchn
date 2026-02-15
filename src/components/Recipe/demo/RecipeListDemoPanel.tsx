import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Heart,
  Eye,
  Users,
  Clock,
  Pencil,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type RecipeListDemoPanelProps = {
  onCreateNew?: () => void;
  onOpenRecipe?: (id: string) => void;
};

type DemoRecipe = {
  id: string;
  title: string;
  category: string;
  servings: number;
  prep: number;
  cook: number;
  folder?: string;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function RecipeListDemoPanel({
  onCreateNew,
  onOpenRecipe,
}: RecipeListDemoPanelProps) {
  const folders = useMemo(() => ["Toutes les recettes", "Mes favoris"], []);

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
      },
      {
        id: "demo-2",
        title: "Volaille rôtie, jus réduit",
        category: "Plat",
        servings: 6,
        prep: 25,
        cook: 45,
        folder: "Toutes les recettes",
      },
      {
        id: "demo-3",
        title: "Pomme de terre fondante, beurre noisette",
        category: "Garniture",
        servings: 8,
        prep: 20,
        cook: 35,
        folder: "Toutes les recettes",
      },
      {
        id: "demo-4",
        title: "Ganache chocolat, fleur de sel",
        category: "Dessert",
        servings: 10,
        prep: 15,
        cook: 10,
        folder: "Toutes les recettes",
      },
    ],
    []
  );

  const [activeFolder, setActiveFolder] = useState("Toutes les recettes");

  const visible = useMemo(() => {
    if (activeFolder === "Mes favoris") return recipes.slice(0, 2);
    return recipes;
  }, [activeFolder, recipes]);

  const headerLabel = activeFolder === "Mes favoris" ? "Favoris" : "Toutes";

  return (
  <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
    {/* Header */}
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="text-lg sm:text-xl font-semibold text-slate-100">
          Mes recettes
        </div>
        <div className="text-sm text-slate-300/70 mt-1">
          {headerLabel} •{" "}
          <span className="text-slate-200 font-medium">{visible.length}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onCreateNew?.()}
        className={cn(ui.btnPrimary)}
        title="Nouvelle Recette"
      >
        <Plus className="w-5 h-5" />
        Nouvelle recette
      </button>
    </div>

    {/* Layout responsive (panel friendly) */}
    <div className="grid gap-5 md:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <div className={cn(ui.cardSoft, "p-4 rounded-3xl")}>
        <div className="text-xs tracking-widest uppercase text-slate-300/70 font-semibold mb-3">
          Dossiers
        </div>

        <div className="space-y-2">
          {folders.map((f) => {
            const active = activeFolder === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFolder(f)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-2xl transition ring-1",
                  active
                    ? "bg-white/10 text-slate-100 ring-white/10"
                    : "bg-white/5 text-slate-200 ring-white/5 hover:bg-white/8"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{f}</span>
                  {f === "Mes favoris" ? (
                    <Heart className="w-4 h-4 opacity-80" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 text-amber-300 transition opacity-60 cursor-not-allowed"
            title="Démo (désactivé)"
          >
            <FolderPlus className="w-4 h-4" />
            Nouveau dossier
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="min-w-0">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mb-5">
          <div
            className={cn(
              ui.cardSoft,
              "flex items-center gap-3 px-4 py-3 rounded-2xl w-full"
            )}
          >
            <Search className="w-5 h-5 text-slate-300/70" />
            <input
              disabled
              value="Rechercher par nom ou ingrédient..."
              className="bg-transparent outline-none text-sm text-slate-300/70 w-full cursor-not-allowed"
              readOnly
            />
          </div>

          <div
            className={cn(
              ui.cardSoft,
              "px-4 py-3 rounded-2xl w-full sm:w-[220px] flex items-center justify-between"
            )}
          >
            <span className="text-sm text-slate-200">Toutes</span>
            <span className="text-slate-400">▾</span>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenRecipe?.(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenRecipe?.(r.id);
                }
              }}
              className={cn(
                ui.cardSoft,
                "rounded-3xl p-5 relative overflow-hidden text-left w-full",
                "transition-transform duration-200 hover:-translate-y-1",
                "cursor-pointer select-none"
              )}
            >
              {/* top icons */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center opacity-60 cursor-not-allowed"
                  aria-label="Favori (démo)"
                >
                  <Heart className="w-5 h-5 text-slate-200" />
                </button>

                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="h-10 w-10 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center opacity-60 cursor-not-allowed"
                  aria-label="Voir (démo)"
                >
                  <Eye className="w-5 h-5 text-slate-200" />
                </button>
              </div>

              <div className="text-lg font-semibold text-slate-100 truncate pr-24">
                {r.title}
              </div>

              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black/10 ring-1 ring-white/10 text-slate-200">
                {r.category}
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-300/80">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {r.servings} couverts
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Prép: {r.prep}min · Cuisson: {r.cook}min
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="h-11 w-11 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center opacity-60 cursor-not-allowed"
                  aria-label="Éditer (démo)"
                >
                  <Pencil className="w-5 h-5 text-amber-200" />
                </button>

                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  className="h-11 w-11 rounded-2xl bg-black/10 ring-1 ring-white/10 grid place-items-center opacity-60 cursor-not-allowed"
                  aria-label="Supprimer (démo)"
                >
                  <Trash2 className="w-5 h-5 text-rose-200" />
                </button>

                <div className="ml-auto text-xs text-slate-400">Démo</div>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
}
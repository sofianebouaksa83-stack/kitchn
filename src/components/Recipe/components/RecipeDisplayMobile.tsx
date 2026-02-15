// =====================================
// 2) RecipeDisplayMobile.tsx (nouveau)
// =====================================
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Pencil,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
  /** utilisé quand affiché dans PageShell desktop */
  desktopMode?: boolean;
};

type IngredientRow = {
  id: string;
  quantity: number | null;
  unit: string | null;
  designation: string | null;
  order_index: number | null;
};

type RecipeSectionRow = {
  id: string;
  title: string | null;
  instructions: string | null;
  order_index: number | null;
};

type SectionIngredientRow = {
  section_id: string;
  ingredient_id: string;
  order_index: number | null;
};

type RecipeRow = {
  id: string;
  title: string | null;
  category: string | null;
  servings: number | null;
  prep_time: number | null;
  cook_time: number | null;
  notes: string | null;
  allergens: string | null;
  created_at: string | null;
  recipe_sections?: RecipeSectionRow[] | null;
};

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function safeTitle(t?: string | null) {
  const s = (t || "").trim();
  return s ? s : "Sans titre";
}

export default function RecipeDisplayMobile({
  recipeId,
  onBack,
  onEdit,
  desktopMode,
}: Props) {
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [sections, setSections] = useState<RecipeSectionRow[]>([]);
  const [links, setLinks] = useState<SectionIngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multiplier (servings)
  const [servings, setServings] = useState<number>(4);

  // Accordéons
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(new Set());
  const [showAllergens, setShowAllergens] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const { data, error: rErr } = await supabase
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

      if (rErr) throw rErr;
      if (!data) throw new Error("Recette introuvable");

      const r = data as RecipeRow;
      setRecipe(r);

      const sortedSections = (r.recipe_sections ?? [])
        .slice()
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      setSections(sortedSections);

      // Reset servings sur la base
      const base = Math.max(1, Number(r.servings ?? 1));
      setServings(base);

      // Accordéon: ouvrir automatiquement la 1ère section si existe
      setOpenSectionIds(
        sortedSections.length > 0 ? new Set([sortedSections[0].id]) : new Set()
      );

      const { data: ing, error: iErr } = await supabase
        .from("ingredients")
        .select("id, quantity, unit, designation, order_index")
        .eq("recipe_id", recipeId)
        .order("order_index", { ascending: true });

      if (iErr) throw iErr;
      setIngredients((ing ?? []) as IngredientRow[]);

      const sectionIds = sortedSections.map((s) => s.id);
      if (sectionIds.length > 0) {
        const { data: lnk, error: lErr } = await supabase
          .from("section_ingredients")
          .select("section_id, ingredient_id, order_index")
          .in("section_id", sectionIds)
          .order("order_index", { ascending: true });

        if (lErr) throw lErr;
        setLinks((lnk ?? []) as SectionIngredientRow[]);
      } else {
        setLinks([]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
      setRecipe(null);
      setIngredients([]);
      setSections([]);
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }

  const baseServings = useMemo(
    () => Math.max(1, Number(recipe?.servings ?? 1)),
    [recipe?.servings]
  );
  const ratio = useMemo(() => servings / baseServings, [servings, baseServings]);

  const subtitle = useMemo(() => {
    if (!recipe) return "";
    const cat = recipe.category || "Sans catégorie";
    const prep = recipe.prep_time ?? 0;
    const cook = recipe.cook_time ?? 0;
    return `${cat} · Prépa ${prep}min · Cuisson ${cook}min`;
  }, [recipe]);

  const ingredientsById = useMemo(() => {
    const m = new Map<string, IngredientRow>();
    for (const i of ingredients) m.set(i.id, i);
    return m;
  }, [ingredients]);

  const sectionIngredients = useMemo(() => {
    const map = new Map<string, IngredientRow[]>();
    const sortedLinks = [...links].sort(
      (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
    );

    for (const l of sortedLinks) {
      const ing = ingredientsById.get(l.ingredient_id);
      if (!ing) continue;
      if (!map.has(l.section_id)) map.set(l.section_id, []);
      map.get(l.section_id)!.push(ing);
    }
    return map;
  }, [links, ingredientsById]);

  function toggleSection(id: string) {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const stickyPad = desktopMode ? "" : "pb-28"; // place pour la barre sticky

  return (
    <div className={cn("relative", desktopMode ? "" : "px-4", stickyPad)}>
      {/* ✅ MOBILE HEADER plein écran (simple, lisible) */}
      {!desktopMode && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-slate-200 hover:text-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-300/80">Chargement…</div>
        </div>
      ) : error ? (
        <div className="mt-6 rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <div className="text-red-200">{error}</div>
        </div>
      ) : recipe ? (
        <>
          {/* Title + meta */}
          <div className={cn(desktopMode ? "mt-2" : "mt-6")}>
            <div className="text-2xl font-semibold text-slate-100 tracking-tight">
              {safeTitle(recipe.title)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-300/75">
              <Tag className="w-4 h-4" />
              <span className="truncate">{subtitle}</span>
            </div>
          </div>

          {/* Multiplier card (aéré) */}
          <div className="mt-8 rounded-[28px] bg-white/[0.05] ring-1 ring-white/10 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs text-slate-300/60">Multiplier</div>
                <div className="mt-1 text-base font-semibold text-slate-100">
                  ×{Math.round(ratio * 100) / 100}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-11 w-11 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center"
                  aria-label="Diminuer"
                >
                  <Minus className="w-4 h-4 text-slate-100" />
                </button>

                <button
                  type="button"
                  onClick={() => setServings((s) => s + 1)}
                  className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center"
                  aria-label="Augmenter"
                >
                  <Plus className="w-4 h-4 text-amber-100" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setServings(baseServings)}
              className="mt-3 text-xs text-slate-300/70 hover:text-slate-100 transition"
              type="button"
            >
              Reset au nombre de base ({baseServings})
            </button>
          </div>

          {/* Allergens + Notes (accordéons simples) */}
          {recipe.allergens ? (
            <div className="mt-6 rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAllergens((v) => !v)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="text-slate-100 font-semibold">Allergènes</div>
                {showAllergens ? (
                  <ChevronUp className="w-5 h-5 text-slate-200" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-200" />
                )}
              </button>
              {showAllergens && (
                <div className="px-5 pb-5 text-sm text-slate-300/80 whitespace-pre-wrap">
                  {recipe.allergens}
                </div>
              )}
            </div>
          ) : null}

          {recipe.notes ? (
            <div className="mt-4 rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="text-slate-100 font-semibold">Notes</div>
                {showNotes ? (
                  <ChevronUp className="w-5 h-5 text-slate-200" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-200" />
                )}
              </button>
              {showNotes && (
                <div className="px-5 pb-5 text-sm text-slate-300/80 whitespace-pre-wrap">
                  {recipe.notes}
                </div>
              )}
            </div>
          ) : null}

          {/* Sections list (accordéons) */}
          <div className="mt-10 space-y-6">
            {sections.length > 0 ? (
              sections.map((section) => {
                const open = openSectionIds.has(section.id);
                const ings = sectionIngredients.get(section.id) ?? [];

                return (
                  <div
                    key={section.id}
                    className="rounded-[30px] bg-white/[0.06] ring-1 ring-white/10 overflow-hidden shadow-[0_18px_60px_rgba(0,0,0,0.22)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-5 py-5 flex items-start justify-between gap-4 text-left"
                    >
                      <div className="min-w-0">
                        <div className="text-slate-100 font-semibold text-base">
                          {section.title?.trim() ? section.title : "Sans titre"}
                        </div>
                        <div className="mt-2 text-sm text-slate-300/70 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{ings.length} ingrédient(s)</span>
                        </div>
                      </div>

                      <div className="shrink-0 h-10 w-10 rounded-2xl bg-black/15 ring-1 ring-white/10 flex items-center justify-center">
                        {open ? (
                          <ChevronUp className="w-5 h-5 text-slate-200" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-200" />
                        )}
                      </div>
                    </button>

                    {open && (
                      <div className="px-5 pb-6">
                        <div className="h-px bg-white/10 mb-5" />

                        <div>
                          <div className="text-sm text-slate-200 font-medium mb-3">
                            Ingrédients
                          </div>

                          {ings.length === 0 ? (
                            <div className="text-sm text-slate-300/70">
                              Aucun ingrédient
                            </div>
                          ) : (
                            <ul className="space-y-2">
                              {ings.map((ing) => {
                                const scaled =
                                  ing.quantity === null
                                    ? null
                                    : ing.quantity * ratio;

                                return (
                                  <li
                                    key={ing.id}
                                    className="flex items-baseline justify-between gap-4"
                                  >
                                    <div className="text-slate-100">
                                      {ing.designation ?? "—"}
                                    </div>
                                    <div className="text-slate-300/80 whitespace-nowrap">
                                      {fmtQty(scaled)} {ing.unit ?? ""}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        <div className="mt-7">
                          <div className="text-sm text-slate-200 font-medium mb-3">
                            Étapes
                          </div>

                          {section.instructions?.trim() ? (
                            <div className="text-sm leading-6 text-slate-300/80 whitespace-pre-wrap">
                              {section.instructions}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-300/60">
                              Aucune instruction
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 p-6">
                <div className="text-slate-100 font-semibold mb-2">
                  Sections
                </div>
                <div className="text-sm text-slate-300/70">
                  Aucune section (étape) n’a encore été ajoutée à cette recette.
                </div>
              </div>
            )}
          </div>

          {/* Sticky actions (mobile only) */}
          {!desktopMode && (
            <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
              <div className="rounded-[26px] bg-[#0B1020]/95 backdrop-blur ring-1 ring-white/10 shadow-[0_-18px_60px_rgba(0,0,0,0.45)] p-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className={cn(ui.btnGhost, "flex-1 h-11 justify-center")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>

                {onEdit && recipe ? (
                  <button
                    type="button"
                    onClick={() => onEdit(recipe.id)}
                    className={cn(ui.btnPrimary, "flex-1 h-11 justify-center")}
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setServings(baseServings)}
                    className={cn(
                      ui.btnGhost,
                      "flex-1 h-11 justify-center"
                    )}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

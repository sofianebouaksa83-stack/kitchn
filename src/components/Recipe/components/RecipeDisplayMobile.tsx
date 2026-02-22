// =====================================
// 2) RecipeDisplayMobile.tsx (affiné)
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
  RotateCcw,
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

function safeTitle(t?: string | null) {
  const s = (t || "").trim();
  return s ? s : "Sans titre";
}

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function normUnit(u: string | null) {
  return (u ?? "").trim();
}

function isQS(unit: string | null) {
  const u = normUnit(unit).toLowerCase();
  return u === "qs" || u === "q.s" || u === "q.s." || u === "quantité suffisante";
}

/**
 * Règles d’affichage quantité :
 * - Si unit = QS => afficher "QS" (jamais "0 QS") et ne pas scaler
 * - Si qty = null :
 *    - si unit existe => afficher unit (ex: "PM", "QS") sinon "—"
 * - Si qty = 0 et pas QS => cacher (retourne "")
 * - Sinon => afficher qty (scaled) + unit
 */
function formatQtyDisplay(qtyScaled: number | null, unit: string | null) {
  const u = normUnit(unit);

  if (isQS(unit)) return "QS";

  if (qtyScaled === null) {
    return u ? u : "—";
  }

  if (qtyScaled === 0) {
    // évite les "0 g" / "0 ml" parasites
    return "";
  }

  return `${fmtQty(qtyScaled)}${u ? ` ${u}` : ""}`.trim();
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

  const meta = useMemo(() => {
    if (!recipe) return "";
    const cat = (recipe.category || "Autre").trim() || "Autre";
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

  const stickyPad = desktopMode ? "" : "pb-24"; // place pour la barre sticky

  return (
    <div className={cn("relative", desktopMode ? "" : "px-4", stickyPad)}>
      {/* ✅ Header compact (mobile) */}
      {!desktopMode && (
        <div className="pt-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-100/90 backdrop-blur hover:bg-white/[0.06] transition active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
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
          {/* Title + meta (plus compact & premium) */}
          <div className={cn(desktopMode ? "mt-2" : "mt-4")}>
            <div className="text-[13px] text-slate-300/70 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span className="truncate">{meta}</span>
            </div>

            <div className="mt-2 text-[22px] font-semibold text-slate-100 tracking-tight leading-[1.15] line-clamp-2">
              {safeTitle(recipe.title)}
            </div>
          </div>

          {/* Multiplier (horizontal premium) */}
          <div className="mt-5 rounded-[26px] bg-white/[0.05] ring-1 ring-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] text-slate-300/60">Multiplier</div>
                <div className="mt-1 flex items-end gap-2">
                  <div className="text-[18px] font-semibold text-slate-100">
                    x{Math.round(ratio * 100) / 100}
                  </div>
                  <button
                    type="button"
                    onClick={() => setServings(baseServings)}
                    className="text-[12px] text-slate-300/60 hover:text-slate-100 transition"
                  >
                    Base ({baseServings})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-10 w-10 rounded-full bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/[0.08] transition inline-flex items-center justify-center active:scale-[0.98]"
                  aria-label="Diminuer"
                  disabled={servings <= 1}
                >
                  <Minus className="w-4 h-4 text-slate-100" />
                </button>

                <button
                  type="button"
                  onClick={() => setServings((s) => s + 1)}
                  className="h-10 w-10 rounded-full bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center active:scale-[0.98]"
                  aria-label="Augmenter"
                >
                  <Plus className="w-4 h-4 text-amber-100" />
                </button>
              </div>
            </div>
          </div>

          {/* Allergènes + Notes (style secondaire) */}
          {recipe.allergens ? (
            <div className="mt-3 rounded-[22px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAllergens((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="text-slate-100/90 font-medium text-[14px]">
                  Allergènes
                </div>
                {showAllergens ? (
                  <ChevronUp className="w-5 h-5 text-slate-200/80" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-200/80" />
                )}
              </button>
              {showAllergens && (
                <div className="px-4 pb-4 text-[13px] leading-6 text-slate-300/80 whitespace-pre-wrap">
                  {recipe.allergens}
                </div>
              )}
            </div>
          ) : null}

          {recipe.notes ? (
            <div className="mt-2 rounded-[22px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowNotes((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="text-slate-100/90 font-medium text-[14px]">
                  Notes
                </div>
                {showNotes ? (
                  <ChevronUp className="w-5 h-5 text-slate-200/80" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-200/80" />
                )}
              </button>
              {showNotes && (
                <div className="px-4 pb-4 text-[13px] leading-6 text-slate-300/80 whitespace-pre-wrap">
                  {recipe.notes}
                </div>
              )}
            </div>
          ) : null}

          {/* Sections (liste fine, compact) */}
          <div className="mt-6 overflow-hidden rounded-[22px] bg-white/[0.04] ring-1 ring-white/10">
            {sections.length > 0 ? (
              <div className="divide-y divide-white/10">
                {sections.map((section) => {
                  const open = openSectionIds.has(section.id);
                  const ings = sectionIngredients.get(section.id) ?? [];

                  // filtre 0 inutiles (sauf QS)
                  const displayedIngs = ings.filter((ing) => {
                    const u = (ing.unit ?? "").trim().toLowerCase();
                    const qs = u === "qs" || u === "q.s" || u === "q.s." || u === "quantité suffisante";
                    if (qs) return true;
                    if (ing.quantity === null) return true;
                    return ing.quantity !== 0;
                  });

                  return (
                    <div key={section.id} className="bg-transparent">
                      {/* Ligne section */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left hover:bg-white/[0.03] transition"
                      >
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-slate-100 truncate">
                            {section.title?.trim() ? section.title : "Sans titre"}
                          </div>
                          <div className="mt-1 text-[12px] text-slate-300/60">
                            {displayedIngs.length} ingrédient(s)
                          </div>
                        </div>

                        <div className="shrink-0 text-slate-200/70">
                          {open ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Contenu déroulé (sans carte) */}
                      {open && (
                        <div className="px-4 pb-5">
                          {/* Ingrédients */}
                          <div className="text-[12px] text-slate-200/70 font-medium mb-2">
                            Ingrédients
                          </div>

                          {displayedIngs.length === 0 ? (
                            <div className="text-[13px] text-slate-300/60">
                              Aucun ingrédient
                            </div>
                          ) : (
                            <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/10">
                              {displayedIngs.map((ing) => {
                                const u = (ing.unit ?? "").trim();
                                const uLow = u.toLowerCase();
                                const qs = uLow === "qs" || uLow === "q.s" || uLow === "q.s." || uLow === "quantité suffisante";

                                // QS ne se scale pas
                                const scaled =
                                  qs || ing.quantity === null ? ing.quantity : (ing.quantity * ratio);

                                // format affichage (QS / qty+unit)
                                let right = "";
                                if (qs) right = "QS";
                                else if (scaled === null) right = u ? u : "—";
                                else if (scaled === 0) right = "";
                                else {
                                  const v = Math.round(scaled * 100) / 100;
                                  const s = String(v).endsWith(".0") ? String(v).slice(0, -2) : String(v);
                                  right = `${s}${u ? ` ${u}` : ""}`.trim();
                                }

                                if (!right) return null;

                                return (
                                  <div key={ing.id} className="flex items-baseline justify-between gap-4 px-3 py-3">
                                    <div className="min-w-0 text-slate-100/90 truncate">
                                      {ing.designation ?? "—"}
                                    </div>
                                    <div className="shrink-0 text-slate-200/75 font-semibold whitespace-nowrap text-[13px]">
                                      {right}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Étapes */}
                          <div className="mt-5">
                            <div className="text-[12px] text-slate-200/70 font-medium mb-2">
                              Étapes
                            </div>

                            {section.instructions?.trim() ? (
                              <div className="text-[13px] leading-7 text-slate-300/80 whitespace-pre-wrap">
                                {section.instructions}
                              </div>
                            ) : (
                              <div className="text-[13px] text-slate-300/55">
                                Aucune instruction
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5">
                <div className="text-slate-100 font-semibold mb-2">Sections</div>
                <div className="text-[13px] text-slate-300/70">
                  Aucune section (étape) n’a encore été ajoutée à cette recette.
                </div>
              </div>
            )}
          </div>

          {/* Sticky actions (mobile only) */}
          {!desktopMode && (
            <div className="fixed inset-x-0 bottom-0 z-[80] px-4 pb-4">
              <div className="rounded-[22px] bg-[#0B1020]/70 backdrop-blur-2xl ring-1 ring-white/10 shadow-[0_-18px_60px_rgba(0,0,0,0.45)] px-3 py-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className={cn(ui.btnGhost, "flex-1 h-10 justify-center")}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>

                {onEdit && recipe ? (
                  <button
                    type="button"
                    onClick={() => onEdit(recipe.id)}
                    className={cn(ui.btnPrimary, "flex-1 h-10 justify-center")}
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setServings(baseServings)}
                    className={cn(ui.btnGhost, "flex-1 h-10 justify-center")}
                  >
                    <RotateCcw className="w-4 h-4" />
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
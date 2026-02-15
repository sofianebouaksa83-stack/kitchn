import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, Clock, Tag, AlertCircle } from "lucide-react";
import { PageShell } from "../../Layout/PageShell";
import { ui } from "../../../styles/ui";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
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

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export default function RecipeDisplayDesktop({ recipeId, onBack, onEdit }: Props) {
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [sections, setSections] = useState<RecipeSectionRow[]>([]);
  const [links, setLinks] = useState<SectionIngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Multiplication inline (comme avant)
  const [servings, setServings] = useState<number>(4);

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

      // ✅ reset servings sur la base
      const base = Math.max(1, Number(r.servings ?? 1));
      setServings(base);

      const { data: ing, error: iErr } = await supabase
        .from("ingredients")
        .select("id, quantity, unit, designation, order_index")
        .eq("recipe_id", recipeId)
        .order("order_index", { ascending: true });

      if (iErr) throw iErr;
      setIngredients((ing ?? []) as IngredientRow[]);

      // ✅ liens section -> ingrédients
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
    if (!recipe) return null;
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

  return (
    <PageShell
      title={recipe?.title ?? "Recette"}
      subtitle={subtitle}
      icon={<Tag className="w-5 h-5 text-amber-200" />}
      actions={
        <div className="flex items-center gap-2">
          <button onClick={onBack} className={ui.btnGhost} type="button">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {onEdit && recipe ? (
            <button
              onClick={() => onEdit(recipe.id)}
              className={ui.btnPrimary}
              type="button"
            >
              Modifier
            </button>
          ) : null}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-slate-300/80">Chargement…</div>
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <div className="text-red-200">{error}</div>
        </div>
      ) : recipe ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Infos */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 space-y-4">
              {/* ✅ MULTIPLIER INLINE */}
              <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs text-slate-300/60">Multiplier</div>
                  <div className="text-sm text-slate-100 font-semibold">
                    ×{Math.round(ratio * 100) / 100}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setServings((s) => Math.max(1, s - 1))}
                    className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                    type="button"
                    aria-label="Diminuer"
                  >
                    –
                  </button>
                  <button
                    onClick={() => setServings((s) => s + 1)}
                    className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center text-amber-100"
                    type="button"
                    aria-label="Augmenter"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setServings(baseServings)}
                className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                type="button"
              >
                Reset
              </button>

              {recipe.allergens ? (
                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 p-4">
                  <div className="text-slate-100 font-semibold mb-2">
                    Allergènes
                  </div>
                  <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                    {recipe.allergens}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Contenu */}
          <div className="lg:col-span-2 space-y-5">
            <div className="space-y-4">
              {sections.length > 0 ? (
                sections.map((section) => {
                  const ings = sectionIngredients.get(section.id) ?? [];

                  return (
                    <div
                      key={section.id}
                      className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]"
                    >
                      <div className="text-slate-100 font-semibold">
                        {section.title?.trim() ? section.title : "Sans titre"}
                      </div>

                      <div className="mt-4 h-px bg-white/10" />

                      <div className="mt-4">
                        <div className="text-sm text-slate-200 font-medium mb-2">
                          Ingrédients
                        </div>

                        {ings.length === 0 ? (
                          <div className="text-sm text-slate-300/70">
                            Aucun ingrédient
                          </div>
                        ) : (
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            {ings.map((ing) => {
                              const scaled =
                                ing.quantity === null
                                  ? null
                                  : ing.quantity * ratio;

                              return (
                                <li
                                  key={ing.id}
                                  className="flex items-baseline justify-between gap-3"
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

                      <div className="mt-5">
                        <div className="text-sm text-slate-200 font-medium mb-2">
                          Étapes
                        </div>
                        {section.instructions?.trim() ? (
                          <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                            {section.instructions}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-300/60">
                            Aucune instruction
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                  <div className="text-slate-100 font-semibold mb-2">
                    Sections
                  </div>
                  <div className="text-sm text-slate-300/70">
                    Aucune section (étape) n’a encore été ajoutée à cette recette.
                  </div>
                </div>
              )}
            </div>

            {recipe.notes ? (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                <div className="text-slate-100 font-semibold mb-2">Notes</div>
                <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                  {recipe.notes}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}


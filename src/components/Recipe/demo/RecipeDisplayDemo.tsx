import React, { useMemo, useState } from "react";
import { ArrowLeft, Tag } from "lucide-react";
import { PageShell } from "../../Layout/PageShell";
import { ui } from "../../../styles/ui";

type Props = {
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
  recipeId?: string;
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
};

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

/** ✅ Recettes FAKE (landing) */
const DEMO_RECIPES: Record<string, RecipeRow> = {
  "demo-1": {
    id: "demo-1",
    title: "Carpaccio de bar, citron confit",
    category: "Entrée",
    servings: 4,
    prep_time: 15,
    cook_time: 0,
    notes: "Dresser très froid. Assaisonner au dernier moment.",
    allergens: "Poisson",
    created_at: null,
  },
  "demo-2": {
    id: "demo-2",
    title: "Volaille rôtie, jus réduit",
    category: "Plat",
    servings: 6,
    prep_time: 25,
    cook_time: 45,
    notes: "Laisser reposer 8–10 min avant découpe.",
    allergens: "",
    created_at: null,
  },
  "demo-3": {
    id: "demo-3",
    title: "Pomme de terre fondante, beurre noisette",
    category: "Garniture",
    servings: 8,
    prep_time: 20,
    cook_time: 35,
    notes: "Arroser régulièrement. Finition au beurre noisette.",
    allergens: "Lait",
    created_at: null,
  },
  "demo-4": {
    id: "demo-4",
    title: "Ganache chocolat, fleur de sel",
    category: "Dessert",
    servings: 10,
    prep_time: 15,
    cook_time: 10,
    notes: "Chocolat noir 70% minimum. Laisser cristalliser au froid.",
    allergens: "Lait",
    created_at: null,
  },
};

type DemoBundle = {
  sections: RecipeSectionRow[];
  ingredients: IngredientRow[];
  links: SectionIngredientRow[];
};

/** ✅ Détails FAKE par recette */
const DEMO_DETAILS: Record<string, DemoBundle> = {
  "demo-1": {
    sections: [
      {
        id: "s1",
        title: "Carpaccio",
        instructions:
          "Lever les filets, parer.\nTailler finement.\nAssaisonner (huile, citron confit, sel, poivre).\nDresser immédiatement.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Condiment",
        instructions:
          "Hacher citron confit et herbes.\nMonter à l’huile d’olive.\nFinition au zeste et fleur de sel.",
        order_index: 2,
      },
    ],
    ingredients: [
      { id: "i1", designation: "Bar (filet)", quantity: 2, unit: "pièce", order_index: 1 },
      { id: "i2", designation: "Citron confit", quantity: 30, unit: "g", order_index: 2 },
      { id: "i3", designation: "Huile d’olive", quantity: 40, unit: "g", order_index: 3 },
      { id: "i4", designation: "Ciboulette", quantity: 5, unit: "g", order_index: 4 },
      { id: "i5", designation: "Fleur de sel", quantity: null, unit: "QS", order_index: 5 },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s2", ingredient_id: "i2", order_index: 1 },
      { section_id: "s2", ingredient_id: "i4", order_index: 2 },
      { section_id: "s2", ingredient_id: "i5", order_index: 3 },
    ],
  },

  "demo-2": {
    sections: [
      {
        id: "s1",
        title: "Volaille",
        instructions:
          "Assaisonner, ficeler.\nRôtir sur le coffre.\nArroser régulièrement.\nRepos avant découpe.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Jus réduit",
        instructions:
          "Déglacer.\nAjouter fond / jus.\nRéduire.\nMonter au beurre (option).",
        order_index: 2,
      },
    ],
    ingredients: [
      { id: "i1", designation: "Volaille", quantity: 1, unit: "pièce", order_index: 1 },
      { id: "i2", designation: "Beurre", quantity: 40, unit: "g", order_index: 2 },
      { id: "i3", designation: "Ail", quantity: 2, unit: "gousse", order_index: 3 },
      { id: "i4", designation: "Thym", quantity: 2, unit: "branche", order_index: 4 },
      { id: "i5", designation: "Fond / jus", quantity: 0.5, unit: "L", order_index: 5 },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s1", ingredient_id: "i4", order_index: 3 },
      { section_id: "s2", ingredient_id: "i5", order_index: 1 },
      { section_id: "s2", ingredient_id: "i2", order_index: 2 },
    ],
  },

  "demo-3": {
    sections: [
      {
        id: "s1",
        title: "Cuisson fondante",
        instructions:
          "Cuire à couvert avec un fond.\nMaintenir une petite ébullition.\nVérifier la pointe.\nGlacer en fin de cuisson.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Beurre noisette",
        instructions:
          "Cuire le beurre jusqu’à noisette.\nFiltrer.\nNapper au service.",
        order_index: 2,
      },
    ],
    ingredients: [
      { id: "i1", designation: "Pomme de terre grenaille", quantity: 800, unit: "g", order_index: 1 },
      { id: "i2", designation: "Beurre", quantity: 120, unit: "g", order_index: 2 },
      { id: "i3", designation: "Bouillon", quantity: 0.3, unit: "L", order_index: 3 },
      { id: "i4", designation: "Sel", quantity: null, unit: "QS", order_index: 4 },
      { id: "i5", designation: "Persil", quantity: 10, unit: "g", order_index: 5 },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i1", order_index: 1 },
      { section_id: "s1", ingredient_id: "i3", order_index: 2 },
      { section_id: "s1", ingredient_id: "i4", order_index: 3 },
      { section_id: "s2", ingredient_id: "i2", order_index: 1 },
      { section_id: "s2", ingredient_id: "i5", order_index: 2 },
    ],
  },

  "demo-4": {
    sections: [
      {
        id: "s1",
        title: "Ganache",
        instructions:
          "Faire bouillir la crème.\nVerser sur le chocolat.\nÉmulsion.\nRefroidir.",
        order_index: 1,
      },
      {
        id: "s2",
        title: "Finition",
        instructions:
          "Mettre en poche.\nDresser.\nFleur de sel au dernier moment.",
        order_index: 2,
      },
    ],
    ingredients: [
      { id: "i1", designation: "Chocolat noir", quantity: 250, unit: "g", order_index: 1 },
      { id: "i2", designation: "Crème", quantity: 200, unit: "g", order_index: 2 },
      { id: "i3", designation: "Beurre", quantity: 30, unit: "g", order_index: 3 },
      { id: "i4", designation: "Fleur de sel", quantity: null, unit: "QS", order_index: 4 },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i2", order_index: 1 },
      { section_id: "s1", ingredient_id: "i1", order_index: 2 },
      { section_id: "s1", ingredient_id: "i3", order_index: 3 },
      { section_id: "s2", ingredient_id: "i4", order_index: 1 },
    ],
  },
};

export function RecipeDisplayDemo({ onBack, onEdit, recipeId }: Props) {
  const key = useMemo(() => (recipeId && DEMO_RECIPES[recipeId] ? recipeId : "demo-1"), [recipeId]);

  const recipe = useMemo<RecipeRow>(() => DEMO_RECIPES[key], [key]);
  const detail = useMemo<DemoBundle>(() => DEMO_DETAILS[key], [key]);

  const sections = detail.sections;
  const ingredients = detail.ingredients;
  const links = detail.links;

  // ✅ Multiplication inline
  const [servings, setServings] = useState<number>(Math.max(1, Number(recipe.servings ?? 1)));

  // Si on change de recette, on reset les couverts sur la valeur de base
  React.useEffect(() => {
    setServings(Math.max(1, Number(recipe.servings ?? 1)));
  }, [recipe.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const baseServings = useMemo(() => Math.max(1, Number(recipe.servings ?? 1)), [recipe.servings]);
  const ratio = useMemo(() => servings / baseServings, [servings, baseServings]);

  const subtitle = useMemo(() => {
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
    const sortedLinks = [...links].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

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
      title={recipe.title ?? "Recette"}
      subtitle={subtitle}
      icon={<Tag className="w-5 h-5 text-amber-200" />}
      actions={
        <div className="flex items-center gap-2">
          <button onClick={onBack} className={ui.btnGhost} type="button">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          {onEdit ? (
            <button onClick={() => onEdit(recipe.id)} className={ui.btnPrimary} type="button">
              Modifier
            </button>
          ) : null}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Infos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 space-y-4">
            {/* MULTIPLIER INLINE */}
            <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs text-slate-300/60">Multiplier</div>
                <div className="text-sm text-slate-100 font-semibold">×{Math.round(ratio * 100) / 100}</div>
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
                  className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center"
                  type="button"
                  aria-label="Augmenter"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => setServings(baseServings)}
              className="text-xs text-slate-300/70 hover:text-slate-100 transition text-left"
              type="button"
            >
              Reset
            </button>
          </div>

          {recipe.allergens?.trim() ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="text-slate-100 font-semibold mb-2">Allergènes</div>
              <div className="text-sm text-slate-300/80 whitespace-pre-wrap">{recipe.allergens}</div>
            </div>
          ) : null}
        </div>

        {/* Contenu */}
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-4">
            {sections.map((section) => {
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
                    <div className="text-sm text-slate-200 font-medium mb-2">Ingrédients</div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      {ings.map((ing) => {
                        const scaled = ing.quantity === null ? null : ing.quantity * ratio;

                        return (
                          <li key={ing.id} className="flex items-baseline justify-between gap-3">
                            <div className="text-slate-100">{ing.designation ?? "—"}</div>
                            <div className="text-slate-300/80 whitespace-nowrap">
                              {fmtQty(scaled)} {ing.unit ?? ""}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm text-slate-200 font-medium mb-2">Étapes</div>
                    {section.instructions?.trim() ? (
                      <div className="text-sm text-slate-300/80 whitespace-pre-wrap">{section.instructions}</div>
                    ) : (
                      <div className="text-sm text-slate-300/60">Aucune instruction</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {recipe.notes?.trim() ? (
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="text-slate-100 font-semibold mb-2">Notes</div>
              <div className="text-sm text-slate-300/80 whitespace-pre-wrap">{recipe.notes}</div>
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}


import React, { useMemo, useState } from "react";
import { ArrowLeft, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { ui } from "../../../styles/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../styles/ui/select";

type Props = {
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
  recipeId?: string;
  autoDemo?: boolean;
  demoKey?: number;
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

type DemoBundle = {
  sections: RecipeSectionRow[];
  ingredients: IngredientRow[];
  links: SectionIngredientRow[];
};

const CROSS_MANUAL_VALUE = "__manual__";

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function normUnit(unit?: string | null) {
  if (!unit) return "";
  return unit === "QS" ? "QS" : unit;
}

function isQS(unit?: string | null) {
  const u = (unit ?? "").trim().toLowerCase();
  return u === "qs" || u === "q.s" || u === "q.s.";
}

function formatQtyDisplay(qtyScaled: number | null, unit: string | null) {
  const u = normUnit(unit);
  if (isQS(unit)) return "QS";
  if (qtyScaled === null) return u ? u : "—";
  if (qtyScaled === 0) return "";
  return `${fmtQty(qtyScaled)}${u ? ` ${u}` : ""}`.trim();
}

function cn(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

/** ✅ Recettes fake landing */
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

/** ✅ Détails fake */
const DEMO_DETAILS: Record<string, DemoBundle> = {
  "demo-1": {
    sections: [
      {
        id: "s1",
        title: "Carpaccio de bar",
        instructions:
          "Lever les filets, parer.\nTailler finement.\nAssaisonner avec huile d’olive, citron confit, sel et poivre.\nDresser immédiatement.",
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
      {
        id: "i1",
        designation: "Bar (filet)",
        quantity: 2,
        unit: "pièce",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Citron confit",
        quantity: 30,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Huile d’olive",
        quantity: 40,
        unit: "g",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Ciboulette",
        quantity: 5,
        unit: "g",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Fleur de sel",
        quantity: null,
        unit: "QS",
        order_index: 5,
      },
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
          "Déglacer.\nAjouter fond / jus.\nRéduire.\nMonter au beurre si besoin.",
        order_index: 2,
      },
    ],
    ingredients: [
      {
        id: "i1",
        designation: "Volaille",
        quantity: 1,
        unit: "pièce",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Beurre",
        quantity: 40,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Ail",
        quantity: 2,
        unit: "gousse",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Thym",
        quantity: 2,
        unit: "branche",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Fond / jus",
        quantity: 0.5,
        unit: "L",
        order_index: 5,
      },
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
      {
        id: "i1",
        designation: "Pomme de terre grenaille",
        quantity: 800,
        unit: "g",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Beurre",
        quantity: 120,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Bouillon",
        quantity: 0.3,
        unit: "L",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Sel",
        quantity: null,
        unit: "QS",
        order_index: 4,
      },
      {
        id: "i5",
        designation: "Persil",
        quantity: 10,
        unit: "g",
        order_index: 5,
      },
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
      {
        id: "i1",
        designation: "Chocolat noir",
        quantity: 250,
        unit: "g",
        order_index: 1,
      },
      {
        id: "i2",
        designation: "Crème",
        quantity: 200,
        unit: "g",
        order_index: 2,
      },
      {
        id: "i3",
        designation: "Beurre",
        quantity: 30,
        unit: "g",
        order_index: 3,
      },
      {
        id: "i4",
        designation: "Fleur de sel",
        quantity: null,
        unit: "QS",
        order_index: 4,
      },
    ],
    links: [
      { section_id: "s1", ingredient_id: "i2", order_index: 1 },
      { section_id: "s1", ingredient_id: "i1", order_index: 2 },
      { section_id: "s1", ingredient_id: "i3", order_index: 3 },
      { section_id: "s2", ingredient_id: "i4", order_index: 1 },
    ],
  },
};

export function RecipeDisplayDemo({
  onBack,
  onEdit,
  recipeId,
  autoDemo = false,
  demoKey = 0,
}: Props) {
  const key = useMemo(
    () => (recipeId && DEMO_RECIPES[recipeId] ? recipeId : "demo-1"),
    [recipeId]
  );

  const recipe = useMemo<RecipeRow>(() => DEMO_RECIPES[key], [key]);
  const detail = useMemo<DemoBundle>(() => DEMO_DETAILS[key], [key]);

  const sections = detail.sections;
  const ingredients = detail.ingredients;
  const links = detail.links;

  const [servings, setServings] = useState<number>(
    Math.max(1, Number(recipe.servings ?? 1))
  );
  const [crossRefIngredientId, setCrossRefIngredientId] =
    useState<string>("");
  const [crossBase, setCrossBase] = useState<number>(500);
  const [crossHave, setCrossHave] = useState<string>("");
  const [openTools, setOpenTools] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(detail.sections.map((s) => [s.id, false]))
  );

  React.useEffect(() => {
    setServings(Math.max(1, Number(recipe.servings ?? 1)));
    setCrossRefIngredientId("");
    setCrossBase(500);
    setCrossHave("");
    setOpenTools(false);
    setOpenSections(Object.fromEntries(detail.sections.map((s) => [s.id, false])));

    if (autoDemo) {
      const timers: number[] = [];

      timers.push(
        window.setTimeout(() => {
          setOpenSections(
            Object.fromEntries(detail.sections.map((s, i) => [s.id, i === 0]))
          );
        }, 500)
      );

      timers.push(
        window.setTimeout(() => {
          const firstIngredient =
            detail.ingredients.find((ing) => ing.quantity && ing.quantity > 0) ?? null;

          if (firstIngredient) {
            setCrossRefIngredientId(firstIngredient.id);
            setCrossHave(String(Math.round((firstIngredient.quantity ?? 1) * 1.6)));
          } else {
            setCrossHave("350");
          }
        }, 1200)
      );

      timers.push(
        window.setTimeout(() => {
          setOpenTools(true);
        }, 250)
      );

      return () => timers.forEach((t) => window.clearTimeout(t));
    }
  }, [recipe.id, detail.sections, detail.ingredients, autoDemo, demoKey]);

  const baseServings = useMemo(
    () => Math.max(1, Number(recipe.servings ?? 1)),
    [recipe.servings]
  );

  const ratio = useMemo(
    () => servings / baseServings,
    [servings, baseServings]
  );

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

  const crossSelectableIngredients = useMemo(() => {
    return ingredients
      .filter((ing) => ing.quantity !== null && Number(ing.quantity) > 0 && !isQS(ing.unit))
      .map((ing) => ({
        id: ing.id,
        label: `${ing.designation ?? "Ingrédient"} · ${fmtQty(ing.quantity)}${
          normUnit(ing.unit) ? ` ${normUnit(ing.unit)}` : ""
        }`,
      }));
  }, [ingredients]);

  const refIngredient = useMemo(() => {
    return ingredients.find((ing) => ing.id === crossRefIngredientId) ?? null;
  }, [ingredients, crossRefIngredientId]);

  const refBaseQty = useMemo(() => {
    return refIngredient?.quantity ?? crossBase;
  }, [refIngredient, crossBase]);

  const refUnit = useMemo(() => {
    return refIngredient?.unit ?? null;
  }, [refIngredient]);

  const crossRatio = useMemo(() => {
    const have = Number(crossHave);
    const base = Number(refBaseQty);
    if (!Number.isFinite(have) || have <= 0) return null;
    if (!Number.isFinite(base) || base <= 0) return null;
    return have / base;
  }, [crossHave, refBaseQty]);

  const activeRatio = crossRatio ?? ratio;

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="h-full w-full">
{/* MOBILE — version alignée avec le vrai site mobile */}
<div className="lg:hidden h-full w-full bg-transparent ring-0 shadow-none overflow-hidden">
  <div className="h-full min-h-0 bg-[#0E1736]/95 px-4 pt-5 pb-4">
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold text-slate-100 truncate">
              {recipe.title ?? "Recette"}
            </h1>

            <p className="mt-1 text-sm text-slate-300/70 truncate">
              {subtitle}
            </p>
          </div>

          {onEdit ? (
            <button
              onClick={() => onEdit(recipe.id)}
              className={cn(ui.btnPrimary, "shrink-0 h-10 px-4 rounded-2xl")}
              type="button"
            >
              Modifier
            </button>
          ) : null}
        </div>

        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar space-y-4">
        {/* Outils */}
        <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenTools((prev) => !prev)}
            className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
          >
            <div className="min-w-0">
              <div className="text-slate-100 font-semibold truncate">
                Multiplicateur
              </div>
            </div>

            <div className="shrink-0 text-slate-300/70">
              {openTools ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          </button>

          {openTools ? (
            <div className="px-4 pb-4">
              <div className="h-px bg-white/10 mb-4" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-300/60">
                      Multiplier
                    </div>
                    <div className="text-sm text-slate-100 font-semibold">
                      ×{Math.round(activeRatio * 100) / 100}
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-300/55">
                      {servings} couvert(s) (base {baseServings})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServings((s) => Math.max(1, s - 1))}
                      className="h-10 w-10 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                      type="button"
                      aria-label="Diminuer"
                      disabled={servings <= 1 || !!crossRatio}
                    >
                      –
                    </button>

                    <button
                      onClick={() => setServings((s) => s + 1)}
                      className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center text-amber-100"
                      type="button"
                      aria-label="Augmenter"
                      disabled={!!crossRatio}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div>
                  <div className="text-xs text-slate-300/60 mb-2">
                    Ingrédient de référence
                  </div>

                  <Select
                    value={crossRefIngredientId || CROSS_MANUAL_VALUE}
                    onValueChange={(v) =>
                      setCrossRefIngredientId(
                        v === CROSS_MANUAL_VALUE ? "" : v
                      )
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-sm text-slate-100 outline-none hover:bg-white/[0.06] transition">
                      <SelectValue placeholder="Manuel (pas d’ingrédient)" />
                    </SelectTrigger>

                    <SelectContent className="z-[9999] rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
                      <SelectItem
                        value={CROSS_MANUAL_VALUE}
                        className="cursor-pointer focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10"
                      >
                        Manuel (pas d’ingrédient)
                      </SelectItem>

                      {crossSelectableIngredients.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.id}
                          className="cursor-pointer focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {refIngredient ? (
                    <div className="mt-2 text-xs text-slate-300/60">
                      Base auto : {fmtQty(refBaseQty)}
                      {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!refIngredient ? (
                    <div>
                      <div className="text-xs text-slate-300/60">Base</div>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={crossBase}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setCrossBase(Number.isFinite(v) && v > 0 ? v : 1);
                        }}
                        className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-slate-300/60">
                        Base (auto)
                      </div>
                      <div className="mt-1 h-11 flex items-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100">
                        {fmtQty(refBaseQty)}
                        {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-slate-300/60">
                      J’ai
                      {refIngredient && normUnit(refUnit)
                        ? ` (${normUnit(refUnit)})`
                        : ""}
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={refIngredient ? "ex: 763" : "ex: 350"}
                      value={crossHave}
                      onChange={(e) => setCrossHave(e.target.value)}
                      className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 outline-none placeholder:text-slate-300/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {crossRatio ? (
                    <button
                      onClick={() => setCrossHave("")}
                      className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                      type="button"
                    >
                      Désactiver le produit en croix
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      setServings(baseServings);
                      setCrossHave("");
                      setCrossBase(500);
                      setCrossRefIngredientId("");
                    }}
                    className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {recipe.allergens?.trim() ? (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-slate-100 font-semibold mb-2">
              Allergènes
            </div>
            <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
              {recipe.allergens}
            </div>
          </div>
        ) : null}

        {sections.map((section) => {
          const isOpen = !!openSections[section.id];
          const ings = sectionIngredients.get(section.id) ?? [];

          return (
            <div
              key={section.id}
              className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="text-slate-100 font-semibold truncate">
                    {section.title?.trim() ? section.title : "Sans titre"}
                  </div>
                  <div className="mt-0.5 text-[12px] text-slate-300/55">
                    {ings.length} ingrédient(s)
                    {section.instructions?.trim() ? " · Étapes" : ""}
                  </div>
                </div>

                <div className="shrink-0 text-slate-300/70">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isOpen ? (
                <div className="px-4 pb-4">
                  <div className="h-px bg-white/10 mb-4" />

                  <div>
                    <div className="text-sm text-slate-200 font-medium mb-2">
                      Ingrédients
                    </div>

                    {ings.length === 0 ? (
                      <div className="text-sm text-slate-300/70">
                        Aucun ingrédient
                      </div>
                    ) : (
                      <ul className="space-y-1">
                        {ings.map((ing) => {
                          const scaled =
                            isQS(ing.unit) || ing.quantity === null
                              ? ing.quantity
                              : ing.quantity * activeRatio;

                          const right = formatQtyDisplay(scaled, ing.unit);
                          if (!right) return null;

                          return (
                            <li
                              key={ing.id}
                              className="flex items-baseline justify-between gap-3"
                            >
                              <div className="text-slate-100">
                                {ing.designation ?? "—"}
                              </div>
                              <div className="text-slate-300/80 whitespace-nowrap">
                                {right}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="mt-4">
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
              ) : null}
            </div>
          );
        })}

        {recipe.notes?.trim() ? (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-slate-100 font-semibold mb-2">Notes</div>
            <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
              {recipe.notes}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  </div>
</div>

      {/* DESKTOP — inchangé */}
      <div className="hidden lg:block h-full w-full rounded-[28px] bg-[#0E1736]/95 ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-4 sm:p-5 lg:p-6 overflow-hidden">
        <div className="flex h-full flex-col">
          {/* HEADER */}
          <div className="pb-4 border-b border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                    <Tag className="w-4 h-4 text-amber-200" />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                      {recipe.title ?? "Recette"}
                    </div>
                    <div className="mt-1 text-[11px] sm:text-xs text-slate-300/70 truncate">
                      {subtitle}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onBack}
                  className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
              </div>

              {onEdit ? (
                <button
                  onClick={() => onEdit(recipe.id)}
                  className={cn(ui.btnPrimary, "shrink-0")}
                  type="button"
                >
                  Modifier
                </button>
              ) : null}
            </div>
          </div>

          {/* CONTENT */}
          <div className="pt-5 grid grid-cols-1 lg:grid-cols-3 gap-5 overflow-y-auto">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-1 space-y-5">
              {/* multiplier */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-300/60">Multiplier</div>
                    <div className="text-sm font-semibold text-slate-100">
                      ×{Math.round(activeRatio * 100) / 100}
                    </div>
                    <div className="mt-0.5 text-[12px] text-slate-300/55">
                      {servings} couvert(s) (base {baseServings})
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

                <div className="h-px bg-white/10" />
              </div>

              {/* produit en croix */}
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 space-y-4">
                <div>
                  <div className="text-xs text-slate-300/60 mb-2">
                    Ingrédient de référence
                  </div>

                  <Select
                    value={crossRefIngredientId || CROSS_MANUAL_VALUE}
                    onValueChange={(v) =>
                      setCrossRefIngredientId(v === CROSS_MANUAL_VALUE ? "" : v)
                    }
                  >
                    <SelectTrigger className="w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-sm text-slate-100 outline-none backdrop-blur-md hover:bg-white/[0.06] transition">
                      <SelectValue placeholder="Manuel (pas d’ingrédient)" />
                    </SelectTrigger>

                    <SelectContent className="z-[9999] rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
                      <SelectItem
                        value={CROSS_MANUAL_VALUE}
                        className="cursor-pointer focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10"
                      >
                        Manuel (pas d’ingrédient)
                      </SelectItem>

                      {crossSelectableIngredients.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.id}
                          className="cursor-pointer focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {refIngredient ? (
                    <div className="mt-2 text-xs text-slate-300/60">
                      Base auto : {fmtQty(refBaseQty)}
                      {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {!refIngredient ? (
                    <div>
                      <div className="text-xs text-slate-300/60">Base</div>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={crossBase}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setCrossBase(Number.isFinite(v) && v > 0 ? v : 1);
                        }}
                        className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-slate-300/60">Base (auto)</div>
                      <div className="mt-1 h-11 flex items-center rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100">
                        {fmtQty(refBaseQty)}
                        {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-slate-300/60">
                      J’ai
                      {refIngredient && normUnit(refUnit)
                        ? ` (${normUnit(refUnit)})`
                        : ""}
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder={refIngredient ? "ex: 763" : "ex: 350"}
                      value={crossHave}
                      onChange={(e) => setCrossHave(e.target.value)}
                      className="mt-1 w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-slate-100 outline-none placeholder:text-slate-300/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {crossRatio ? (
                    <button
                      onClick={() => setCrossHave("")}
                      className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                      type="button"
                    >
                      Désactiver le produit en croix
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      setServings(baseServings);
                      setCrossHave("");
                      setCrossBase(500);
                      setCrossRefIngredientId("");
                    }}
                    className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {recipe.allergens?.trim() ? (
                <div>
                  <div className="text-sm text-slate-100 font-semibold mb-2">
                    Allergènes
                  </div>
                  <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                    {recipe.allergens}
                  </div>
                </div>
              ) : null}
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              {sections.map((section) => {
                const isOpen = !!openSections[section.id];
                const ings = sectionIngredients.get(section.id) ?? [];

                return (
                  <div
                    key={section.id}
                    className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-4 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="text-slate-100 font-semibold truncate">
                          {section.title?.trim() ? section.title : "Sans titre"}
                        </div>
                        <div className="mt-0.5 text-[12px] text-slate-300/55">
                          {ings.length} ingrédient(s)
                          {section.instructions?.trim() ? " · Étapes" : ""}
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-300/70">
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </button>

                    {isOpen ? (
                      <div className="px-4 pb-4">
                        <div className="h-px bg-white/10 mb-4" />

                        <div>
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
                                  ing.quantity === null || isQS(ing.unit)
                                    ? ing.quantity
                                    : ing.quantity * activeRatio;

                                const right = formatQtyDisplay(scaled, ing.unit);
                                if (!right) return null;

                                return (
                                  <li
                                    key={ing.id}
                                    className="flex items-baseline justify-between gap-3"
                                  >
                                    <div className="text-slate-100">
                                      {ing.designation ?? "—"}
                                    </div>
                                    <div className="text-slate-300/80 whitespace-nowrap">
                                      {right}
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>

                        <div className="mt-4">
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
                    ) : null}
                  </div>
                );
              })}

              {recipe.notes?.trim() ? (
                <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                  <div className="text-slate-100 font-semibold mb-2">Notes</div>
                  <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                    {recipe.notes}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
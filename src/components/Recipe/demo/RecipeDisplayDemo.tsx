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
import {
  DEMO_DETAILS,
  DEMO_RECIPES,
  type IngredientRow,
  type RecipeRow,
  type RecipeSectionRow,
} from "../../../features/recipe/demo/recipeDisplayDemoData";

type Props = {
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
  recipeId?: string;
  autoDemo?: boolean;
  demoKey?: number;
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

function DemoRecipeSection({
  section,
  ingredients,
  activeRatio,
  isOpen,
  onToggle,
}: {
  section: RecipeSectionRow;
  ingredients: IngredientRow[];
  activeRatio: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white/[0.06] shadow-[0_10px_40px_rgba(0,0,0,0.20)] ring-1 ring-white/10">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-100">
            {section.title?.trim() ? section.title : "Sans titre"}
          </div>

          <div className="mt-0.5 text-[12px] text-slate-300/55">
            {ingredients.length} ingrédient(s)
            {section.instructions?.trim() ? " · Étapes" : ""}
          </div>
        </div>

        <div className="shrink-0 text-slate-300/70">
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {isOpen ? (
        <div className="px-4 pb-4">
          <div className="mb-4 h-px bg-white/10" />

          <div className="mb-2 text-sm font-medium text-slate-200">
            Ingrédients
          </div>

          {ingredients.length === 0 ? (
            <div className="text-sm text-slate-300/70">
              Aucun ingrédient
            </div>
          ) : (
            <ul className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-1 lg:space-y-0">
              {ingredients.map((ingredient) => {
                const scaled =
                  ingredient.quantity === null || isQS(ingredient.unit)
                    ? ingredient.quantity
                    : ingredient.quantity * activeRatio;

                const quantity = formatQtyDisplay(
                  scaled,
                  ingredient.unit
                );

                if (!quantity) return null;

                return (
                  <li
                    key={ingredient.id}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <div className="text-slate-100">
                      {ingredient.designation ?? "—"}
                    </div>

                    <div className="whitespace-nowrap text-slate-300/80">
                      {quantity}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium text-slate-200">
              Étapes
            </div>

            {section.instructions?.trim() ? (
              <div className="whitespace-pre-wrap text-sm text-slate-300/80">
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
}

function DemoRecipeHeader({
  recipe,
  subtitle,
  onBack,
  onEdit,
}: {
  recipe: RecipeRow;
  subtitle: string;
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
}) {
  return (
    <div className="mb-5 lg:mb-0 lg:border-b lg:border-white/10 lg:pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="hidden h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 lg:grid">
              <Tag className="h-4 w-4 text-amber-200" />
            </span>

            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-semibold text-slate-100 lg:text-base">
                {recipe.title ?? "Recette"}
              </h1>

              <p className="mt-1 truncate text-sm text-slate-300/70 lg:text-xs">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"
            type="button"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        </div>

        {onEdit ? (
          <button
            onClick={() => onEdit(recipe.id)}
            className={cn(
              ui.btnPrimary,
              "h-10 shrink-0 rounded-2xl px-4 lg:h-auto"
            )}
            type="button"
          >
            Modifier
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function RecipeDisplayDemo({
  onBack,
  onEdit,
  recipeId,
  autoDemo = false,
  demoKey = 0,
}: Props) {
  const key =
    recipeId && DEMO_RECIPES[recipeId] ? recipeId : "demo-1";

  const recipe = DEMO_RECIPES[key];
  const detail = DEMO_DETAILS[key];
  const { sections, ingredients, links } = detail;

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

  const baseServings = Math.max(1, Number(recipe.servings ?? 1));
  const ratio = servings / baseServings;

  const subtitle = `${recipe.category || "Sans catégorie"
    } · Prépa ${recipe.prep_time ?? 0}min · Cuisson ${recipe.cook_time ?? 0
    }min`;

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
        label: `${ing.designation ?? "Ingrédient"} · ${fmtQty(ing.quantity)}${normUnit(ing.unit) ? ` ${normUnit(ing.unit)}` : ""
          }`,
      }));
  }, [ingredients]);

  const refIngredient =
    ingredients.find((ingredient) => ingredient.id === crossRefIngredientId) ??
    null;

  const refBaseQty = refIngredient?.quantity ?? crossBase;
  const refUnit = refIngredient?.unit ?? null;
  const availableQuantity = Number(crossHave);

  const crossRatio =
    Number.isFinite(availableQuantity) &&
      availableQuantity > 0 &&
      Number.isFinite(refBaseQty) &&
      refBaseQty > 0
      ? availableQuantity / refBaseQty
      : null;

  const activeRatio = crossRatio ?? ratio;

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="h-full w-full">
      {/* MOBILE — version alignée avec le vrai site mobile */}
      <div className="h-full w-full overflow-hidden lg:rounded-[28px] lg:bg-[#0E1736]/95 lg:ring-1 lg:ring-white/10 lg:shadow-[0_18px_70px_rgba(0,0,0,0.35)] lg:backdrop-blur-md">
        <div className="h-full min-h-0 bg-[#0E1736]/95 px-4 pt-5 pb-4 lg:bg-transparent lg:p-6">
          <div className="flex h-full min-h-0 flex-col">
            <DemoRecipeHeader
              recipe={recipe}
              subtitle={subtitle}
              onBack={onBack}
              onEdit={onEdit}
            />

            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar lg:grid lg:grid-cols-3 lg:gap-5 lg:pt-5">
              <div className="space-y-4 lg:space-y-5">
                {/* Outils */}
                <div className="overflow-hidden rounded-3xl bg-white/[0.06] shadow-[0_10px_40px_rgba(0,0,0,0.20)] ring-1 ring-white/10 lg:rounded-none lg:bg-transparent lg:shadow-none lg:ring-0">
                  <button
                    type="button"
                    onClick={() => setOpenTools((prev) => !prev)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left lg:hidden"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-100">
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

                  <div
                    className={cn(
                      "px-4 pb-4 lg:block lg:p-0",
                      !openTools && "hidden lg:block"
                    )}
                  >
                    <div className="mb-4 h-px bg-white/10 lg:hidden" />

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
                </div>

                <div className="space-y-4 lg:col-span-2">
                  {sections.map((section) => (
                    <DemoRecipeSection
                      key={section.id}
                      section={section}
                      ingredients={sectionIngredients.get(section.id) ?? []}
                      activeRatio={activeRatio}
                      isOpen={Boolean(openSections[section.id])}
                      onToggle={() => toggleSection(section.id)}
                    />
                  ))}

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
      </div>
    </div>
  );
}
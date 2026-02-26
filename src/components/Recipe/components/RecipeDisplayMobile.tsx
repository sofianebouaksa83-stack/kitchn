import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft, Tag, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { PageShell } from "../../Layout/PageShell";
import { ui } from "../../../styles/ui";

// ✅ Dropdown custom (shadcn/radix)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../styles/ui/select";

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

function normUnit(u: string | null) {
  return (u ?? "").trim();
}

function isQS(unit: string | null) {
  const u = normUnit(unit).toLowerCase();
  return u === "qs" || u === "q.s" || u === "q.s." || u === "quantité suffisante";
}

function formatQtyDisplay(qtyScaled: number | null, unit: string | null) {
  const u = normUnit(unit);
  if (isQS(unit)) return "QS";
  if (qtyScaled === null) return u ? u : "—";
  if (qtyScaled === 0) return "";
  return `${fmtQty(qtyScaled)}${u ? ` ${u}` : ""}`.trim();
}

function ingredientLabel(i: IngredientRow) {
  const label = ((i.designation ?? "—").trim() || "—").toString();
  const u = normUnit(i.unit);
  const q = i.quantity ?? null;
  return q !== null && Number.isFinite(q)
    ? `${label} (${fmtQty(q)}${u ? ` ${u}` : ""})`
    : label;
}

const CROSS_MANUAL_VALUE = "__manual__";

export default function RecipeDisplayMobile({ recipeId, onBack, onEdit }: Props) {
  const [recipe, setRecipe] = useState<RecipeRow | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [sections, setSections] = useState<RecipeSectionRow[]>([]);
  const [links, setLinks] = useState<SectionIngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Multiplication inline
  const [servings, setServings] = useState<number>(4);

  // Produit en croix
  const [crossRefIngredientId, setCrossRefIngredientId] = useState<string>("");
  const [crossBase, setCrossBase] = useState<number>(500);
  const [crossHave, setCrossHave] = useState<string>("");

  // ✅ Mes notes (privées)
  const [myNote, setMyNote] = useState<string>("");
  const [noteLoading, setNoteLoading] = useState<boolean>(true);
  const [noteSaving, setNoteSaving] = useState<boolean>(false);
  const [noteSavedAt, setNoteSavedAt] = useState<string | null>(null);

  // ✅ sections accordion (fermées par défaut)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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

      // ✅ sections fermées par défaut
      const closed: Record<string, boolean> = {};
      for (const s of sortedSections) closed[s.id] = false;
      setOpenSections(closed);

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

      // ✅ charger "ma note"
      setNoteLoading(true);
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const uid = authData.user?.id;
      if (uid) {
        const { data: noteRow, error: nErr } = await supabase
          .from("recipe_user_notes")
          .select("content, updated_at")
          .eq("recipe_id", recipeId)
          .eq("user_id", uid)
          .maybeSingle();

        if (!nErr) {
          setMyNote(noteRow?.content ?? "");
          setNoteSavedAt(noteRow?.updated_at ?? null);
        }
      }
      setNoteLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "Erreur");
      setRecipe(null);
      setIngredients([]);
      setSections([]);
      setLinks([]);

      setMyNote("");
      setNoteSavedAt(null);
      setNoteLoading(false);
      setOpenSections({});
    } finally {
      setLoading(false);
    }
  }

  const baseServings = useMemo(
    () => Math.max(1, Number(recipe?.servings ?? 1)),
    [recipe?.servings]
  );
  const ratio = useMemo(() => servings / baseServings, [servings, baseServings]);

  const refIngredient = useMemo(() => {
    if (!crossRefIngredientId) return null;
    return ingredients.find((i) => i.id === crossRefIngredientId) ?? null;
  }, [crossRefIngredientId, ingredients]);

  const refBaseQty = refIngredient?.quantity ?? null;
  const refUnit = refIngredient?.unit ?? null;

  const crossRatio = useMemo(() => {
    const haveStr = crossHave.trim();
    if (!haveStr) return null;

    const have = Number(haveStr);
    if (!Number.isFinite(have) || have <= 0) return null;

    if (refIngredient) {
      if (isQS(refUnit)) return null;
      if (refBaseQty === null || !Number.isFinite(refBaseQty) || refBaseQty <= 0)
        return null;
      return have / refBaseQty;
    }

    if (!Number.isFinite(crossBase) || crossBase <= 0) return null;
    return have / crossBase;
  }, [crossHave, crossBase, refIngredient, refBaseQty, refUnit]);

  const coefficient = crossRatio ?? ratio;

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

  const crossSelectableIngredients = useMemo(() => {
    return ingredients
      .filter((i) => i.quantity !== null && i.quantity > 0 && !isQS(i.unit))
      .map((i) => ({
        id: i.id,
        label: ingredientLabel(i),
      }));
  }, [ingredients]);

  // ✅ auto-save notes (debounce)
  useEffect(() => {
    if (loading) return;
    if (noteLoading) return;

    const t = setTimeout(async () => {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) return;

      setNoteSaving(true);

      const { data, error: upErr } = await supabase
        .from("recipe_user_notes")
        .upsert(
          { recipe_id: recipeId, user_id: uid, content: myNote },
          { onConflict: "recipe_id,user_id" }
        )
        .select("updated_at")
        .maybeSingle();

      setNoteSaving(false);

      if (!upErr) {
        setNoteSavedAt(data?.updated_at ?? new Date().toISOString());
      }
    }, 500);

    return () => clearTimeout(t);
  }, [myNote, recipeId, loading, noteLoading]);

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

return (
  <PageShell
    withPanel={false}
    title={undefined}
    subtitle={undefined}
    icon={undefined}
    actions={
      onEdit && recipe ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(recipe.id)}
            className={ui.btnPrimary}
            type="button"
          >
            Modifier
          </button>
        </div>
      ) : null
    }
  >
    {/* ✅ Header mobile custom */}
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-100 truncate">
            {recipe?.title ?? "Recette"}
          </h1>

          {subtitle ? (
            <p className="text-sm text-slate-300/70 mt-1">{subtitle}</p>
          ) : null}
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
      <div className="space-y-6">
        {/* ✅ Scaler MOBILE sans “carte globale” */}
        <div className="space-y-4">
          {/* header multiplier */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-slate-300/60">Multiplier</div>
              <div className="text-sm text-slate-100 font-semibold">
                ×{Math.round(coefficient * 100) / 100}
              </div>
              <div className="mt-0.5 text-[12px] text-slate-300/55">
                {crossRatio
                  ? `Produit en croix (x${Math.round(crossRatio * 100) / 100})`
                  : `${servings} couvert(s) (base ${baseServings})`}
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

          {/* separator */}
          <div className="h-px bg-white/10" />

          {/* select ref */}
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

          {/* base / have inputs */}
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
                {refIngredient && normUnit(refUnit) ? ` (${normUnit(refUnit)})` : ""}
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

          {/* actions */}
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

          {recipe.allergens ? (
            <div className="pt-2">
              <div className="text-sm text-slate-100 font-semibold mb-2">
                Allergènes
              </div>
              <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
                {recipe.allergens}
              </div>
            </div>
          ) : null}
        </div>

        {/* ✅ Sections en déroulé */}
        {sections.length > 0 ? (
          <div className="space-y-3">
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
                                  : ing.quantity * coefficient;

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
          </div>
        ) : (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-slate-100 font-semibold mb-2">Sections</div>
            <div className="text-sm text-slate-300/70">
              Aucune section (étape) n’a encore été ajoutée à cette recette.
            </div>
          </div>
        )}

        {/* Notes recette */}
        {recipe.notes ? (
          <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
            <div className="text-slate-100 font-semibold mb-2">Notes</div>
            <div className="text-sm text-slate-300/80 whitespace-pre-wrap">
              {recipe.notes}
            </div>
          </div>
        ) : null}

        {/* ✅ Mes notes (privées) */}
        <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-slate-100 font-semibold">Mes notes</div>
            <div className="text-xs text-slate-300/60">
              {noteLoading
                ? "Chargement…"
                : noteSaving
                  ? "Enregistrement…"
                  : noteSavedAt
                    ? "Enregistré"
                    : "—"}
            </div>
          </div>

          <textarea
            value={myNote}
            onChange={(e) => setMyNote(e.target.value)}
            placeholder="Écris tes notes ici…"
            className="
              mt-3
              w-full min-h-[160px]
              rounded-2xl
              bg-white/[0.03]
              ring-1 ring-white/10
              px-4 py-3
              text-sm text-slate-100
              outline-none
              placeholder:text-slate-300/40
              backdrop-blur-md
              resize-y
            "
          />
        </div>
      </div>
    ) : null}
  </PageShell>
);
}
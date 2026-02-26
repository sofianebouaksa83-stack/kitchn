import { useMemo, useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { ui } from "../../../styles/ui";

type Ingredient = {
  id: string;
  quantity: number | null;
  unit: string | null;
  designation: string | null;
};

type Recipe = {
  id: string;
  title: string | null;
  servings: number | null;
  ingredients: Ingredient[];
};

type Props = {
  recipe: Recipe;
  onClose: () => void;
};

function formatNumber(n: number) {
  const s = String(Math.round(n * 100) / 100);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function normUnit(u: string | null) {
  return (u ?? "").trim();
}

function isQS(unit: string | null) {
  const u = normUnit(unit).toLowerCase();
  return u === "qs" || u === "q.s" || u === "q.s." || u === "quantité suffisante";
}

function fmtQty(q: number | null) {
  if (q === null || Number.isNaN(q)) return "—";
  const v = Math.round(q * 100) / 100;
  const s = String(v);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

function formatQtyDisplay(qtyScaled: number | null, unit: string | null) {
  const u = normUnit(unit);
  if (isQS(unit)) return "QS";
  if (qtyScaled === null) return u ? u : "—";
  if (qtyScaled === 0) return "";
  return `${formatNumber(qtyScaled)}${u ? ` ${u}` : ""}`.trim();
}

export function RecipeScaler({ recipe, onClose }: Props) {
  const baseServings = Math.max(1, Number(recipe.servings ?? 1));
  const [servings, setServings] = useState<number>(baseServings);

  // Produit en croix (temporaire)
  const [crossRefIngredientId, setCrossRefIngredientId] = useState<string>("");
  const [crossBase, setCrossBase] = useState<number>(500);
  const [crossHave, setCrossHave] = useState<string>("");

  const ratio = useMemo(() => servings / baseServings, [servings, baseServings]);

  const refIngredient = useMemo(() => {
    if (!crossRefIngredientId) return null;
    return (recipe.ingredients ?? []).find((i) => i.id === crossRefIngredientId) ?? null;
  }, [crossRefIngredientId, recipe.ingredients]);

  const refBaseQty = refIngredient?.quantity ?? null;
  const refUnit = refIngredient?.unit ?? null;

  const crossRatio = useMemo(() => {
    const haveStr = crossHave.trim();
    if (!haveStr) return null;

    const have = Number(haveStr);
    if (!Number.isFinite(have) || have <= 0) return null;

    // ✅ Mode ingrédient choisi
    if (refIngredient) {
      if (isQS(refUnit)) return null;
      if (refBaseQty === null || !Number.isFinite(refBaseQty) || refBaseQty <= 0) return null;
      return have / refBaseQty;
    }

    // ✅ Mode manuel
    if (!Number.isFinite(crossBase) || crossBase <= 0) return null;
    return have / crossBase;
  }, [crossHave, crossBase, refIngredient, refBaseQty, refUnit]);

  const coefficient = crossRatio ?? ratio;

  const scaled = useMemo(() => {
    return (recipe.ingredients ?? [])
      .map((ing) => {
        const q =
          isQS(ing.unit) || ing.quantity === null || typeof ing.quantity !== "number"
            ? ing.quantity
            : ing.quantity * coefficient;

        return { ...ing, scaledQty: q };
      })
      // ✅ évite les lignes vides genre "0 g"
      .filter((ing: any) => {
        if (isQS(ing.unit)) return true;
        if (ing.quantity === null) return true;
        return ing.scaledQty !== 0;
      });
  }, [recipe.ingredients, coefficient]);

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Fermer"
        type="button"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-slate-100 font-semibold truncate">
                {recipe.title ?? "Recette"}
              </div>
              <div className="text-xs text-slate-300/70">
                Ajuste les quantités en changeant le nombre de couverts.
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-2xl inline-flex items-center justify-center hover:bg-white/[0.07] transition"
              aria-label="Fermer"
              type="button"
            >
              <X className="w-5 h-5 text-slate-200" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4">
              <div>
                <div className="text-sm text-slate-300/70">Couverts</div>
                <div className="text-xl font-semibold text-slate-100">{servings}</div>
                <div className="mt-1 text-xs text-slate-300/60">
                  {crossRatio
                    ? `Produit en croix (x${Math.round(crossRatio * 100) / 100})`
                    : `×${Math.round(ratio * 100) / 100}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-11 w-11 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                  type="button"
                  disabled={servings <= 1 || !!crossRatio}
                >
                  <Minus className="w-4 h-4 text-slate-200" />
                </button>

                <button
                  onClick={() => setServings((s) => s + 1)}
                  className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center"
                  type="button"
                  disabled={!!crossRatio}
                >
                  <Plus className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>

            {/* Produit en croix */}
            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5 space-y-3">
              <div className="text-slate-100 font-semibold">Produit en croix</div>

              <div>
                <div className="text-xs text-slate-300/60 mb-2">
                  Ingrédient de référence
                </div>
                <select
                  value={crossRefIngredientId}
                  onChange={(e) => setCrossRefIngredientId(e.target.value)}
                  className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">Manuel (pas d’ingrédient)</option>
                  {(recipe.ingredients ?? [])
                    .filter((i) => i.quantity !== null && i.quantity > 0 && !isQS(i.unit))
                    .map((i) => {
                      const label = ((i.designation ?? "—").trim() || "—").toString();
                      const u = normUnit(i.unit);
                      return (
                        <option key={i.id} value={i.id}>
                          {label} ({fmtQty(i.quantity)}
                          {u ? ` ${u}` : ""})
                        </option>
                      );
                    })}
                </select>

                {refIngredient && (
                  <div className="mt-2 text-xs text-slate-300/60">
                    Base auto : {fmtQty(refBaseQty)}
                    {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!refIngredient ? (
                  <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-slate-300/60">Base</div>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={crossBase}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCrossBase(Number.isFinite(v) && v > 0 ? v : 1);
                      }}
                      className="mt-1 w-full bg-transparent text-slate-100 outline-none"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3">
                    <div className="text-xs text-slate-300/60">Base (auto)</div>
                    <div className="mt-1 text-slate-100">
                      {fmtQty(refBaseQty)}
                      {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3">
                  <div className="text-xs text-slate-300/60">
                    J’ai{refIngredient && normUnit(refUnit) ? ` (${normUnit(refUnit)})` : ""}
                  </div>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={refIngredient ? "ex: 763" : "ex: 350"}
                    value={crossHave}
                    onChange={(e) => setCrossHave(e.target.value)}
                    className="mt-1 w-full bg-transparent text-slate-100 outline-none"
                  />
                </div>
              </div>

              {crossRatio && (
                <button
                  onClick={() => setCrossHave("")}
                  className="w-full rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 py-3 text-sm text-slate-200 hover:bg-white/[0.06] transition"
                  type="button"
                >
                  Désactiver le produit en croix
                </button>
              )}

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

            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="text-slate-100 font-semibold mb-4">Ingrédients</div>
              <ul className="space-y-2">
                {scaled.map((ing: any) => {
                  const right = formatQtyDisplay(ing.scaledQty, ing.unit);
                  if (!right) return null;

                  return (
                    <li
                      key={ing.id}
                      className="flex items-baseline justify-between gap-4"
                    >
                      <div className="text-slate-100">{ing.designation ?? "—"}</div>
                      <div className="text-slate-300/80 whitespace-nowrap">
                        {right}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className={ui.btnGhost} type="button">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  // 0.5 => 0.5 ; 1.25 => 1.25 (pas de format "chef", juste simple)
  const s = String(Math.round(n * 100) / 100);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}

export function RecipeScaler({ recipe, onClose }: Props) {
  const baseServings = Math.max(1, Number(recipe.servings ?? 1));
  const [servings, setServings] = useState<number>(baseServings);

  const ratio = useMemo(() => servings / baseServings, [servings, baseServings]);

  const scaled = useMemo(() => {
    return (recipe.ingredients ?? []).map((ing) => {
      const q = ing.quantity === null || typeof ing.quantity !== "number" ? null : ing.quantity * ratio;
      return { ...ing, scaledQty: q };
    });
  }, [recipe.ingredients, ratio]);

  return (
    <div className="fixed inset-0 z-[80]">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Fermer" type="button" />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-slate-100 font-semibold truncate">{recipe.title ?? "Recette"}</div>
              <div className="text-xs text-slate-300/70">Ajuste les quantités en changeant le nombre de couverts.</div>
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
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="h-11 w-11 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 hover:bg-white/[0.07] transition inline-flex items-center justify-center"
                  type="button"
                >
                  <Minus className="w-4 h-4 text-slate-200" />
                </button>

                <button
                  onClick={() => setServings((s) => s + 1)}
                  className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 hover:bg-amber-500/20 transition inline-flex items-center justify-center"
                  type="button"
                >
                  <Plus className="w-4 h-4 text-amber-200" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
              <div className="text-slate-100 font-semibold mb-4">Ingrédients</div>
              <ul className="space-y-2">
                {scaled.map((ing: any) => (
                  <li key={ing.id} className="flex items-baseline justify-between gap-4">
                    <div className="text-slate-100">{ing.designation ?? "—"}</div>
                    <div className="text-slate-300/80 whitespace-nowrap">
                      {ing.scaledQty === null ? "—" : formatNumber(ing.scaledQty)} {ing.unit ?? ""}
                    </div>
                  </li>
                ))}
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

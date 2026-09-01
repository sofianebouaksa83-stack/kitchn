import { useState } from "react";
import {
  ArrowLeft,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageShell } from "../../Layout/PageShell";
import { KitchNLoader } from "../../Loading/KitchNLoader";
import { ui } from "../../../styles/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../styles/ui/select";
import { useRecipeDisplay } from "../../../features/recipe/hooks/useRecipeDisplay";
import {
  CROSS_MANUAL_VALUE,
  fmtQty,
  formatCoefficient,
  formatQtyDisplay,
  isQS,
  normUnit,
} from "../../../features/recipe/utils/recipeHelpers";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
  embedded?: boolean;
  hideBackButton?: boolean;
};

export default function RecipeDisplayMobile({
  recipeId,
  onBack,
  onEdit,
  embedded = false,
  hideBackButton = false,
}: Props) {
  const [openTools, setOpenTools] = useState(false);

  const {
    recipe,
    ingredients,
    sections,
    loading,
    error,
    recipeImages,
    subtitle,
    allergensText,

    coefficient,
    crossRatio,

    crossRefIngredientId,
    setCrossRefIngredientId,
    crossBase,
    setCrossBase,
    crossHave,
    setCrossHave,

    refIngredient,
    refBaseQty,
    refUnit,
    crossSelectableIngredients,

    increaseMultiplier,
    decreaseMultiplier,
    resetMultiplier,

    sectionIngredients,
    openSections,
    toggleSection,

    myNote,
    setMyNote,
    noteLoading,
    noteSaving,
    noteSavedAt,
  } = useRecipeDisplay({
    recipeId,
    sectionsInitiallyOpen: true,
  });

  const content = (
    <>
      {/* ✅ Header mobile : en bottom sheet, on évite le doublon avec le titre déjà affiché */}
      <div className={embedded ? "mb-4" : "mb-6"}>
        {embedded ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
         </div>

            {onEdit && recipe ? (
              <button
                onClick={() => onEdit(recipe.id)}
                className={`${ui.btnPrimary} shrink-0 h-10 rounded-2xl px-4`}
                type="button"
              >
                Modifier
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-100 truncate">
                  {recipe?.title ?? "Recette"}
                </h1>

                {subtitle ? (
                  <p className="text-sm text-slate-300/70 mt-1">{subtitle}</p>
                ) : null}
              </div>

              {onEdit && recipe ? (
                <button
                  onClick={() => onEdit(recipe.id)}
                  className={`${ui.btnPrimary} shrink-0 h-10 rounded-2xl px-4`}
                  type="button"
                >
                  Modifier
                </button>
              ) : null}
            </div>

            {!hideBackButton ? (
              <button
                onClick={onBack}
                className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
                type="button"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
            ) : null}
          </>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <KitchNLoader className="kitchn-loader--compact" />
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-300" />
          <div className="text-red-200">{error}</div>
        </div>
      ) : recipe ? (
        <div className="space-y-6">
          {recipeImages.length > 0 ? (
            <div
              className={
                recipeImages.length === 1
                  ? "mx-auto flex w-full justify-center"
                  : "flex w-full gap-3 overflow-x-auto pb-1"
              }
            >
              {recipeImages.map((imageUrl, index) => (
                <img
                  key={imageUrl}
                  src={imageUrl}
                  alt={`Photo ${index + 1} de ${recipe.title ?? "la recette"}`}
                  className="h-auto max-h-60 w-auto max-w-[82vw] shrink-0 rounded-[20px] object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          {allergensText ? (
            <div className="rounded-3xl bg-amber-500/10 ring-1 ring-amber-400/20 px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.16em] text-amber-100/70">
                Allergènes
              </div>
              <div className="mt-1 text-sm leading-6 text-amber-50/90">
                {allergensText}
              </div>
            </div>
          ) : null}

          {/* ✅ Multiplicateur compact */}
          <div className="space-y-3">
            <div className="rounded-2xl bg-white/[0.06] ring-white/10/80 ring-1 ring-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.20)] overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenTools((prev) => !prev)}
                className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">
                    Multiplicateur
                  </div>
                  <div className="mt-0.5 text-xs text-white/45">
                    Coefficient x{formatCoefficient(coefficient)}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-200 ring-1 ring-amber-300/20">
                    x{formatCoefficient(coefficient)}
                  </span>

                  {openTools ? (
                    <ChevronUp className="w-4 h-4 text-white/70" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-white/70" />
                  )}
                </div>
              </button>

              {openTools ? (
                <div className="border-t border-white/10 px-4 py-3 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-white/45">Multiplier</div>
                      <div className="text-sm font-bold text-white">
                        x{formatCoefficient(coefficient)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={decreaseMultiplier}
                        className="h-9 w-9 rounded-xl bg-white/[0.06] ring-1 ring-white/10 hover:bg-white/[0.09] transition inline-flex items-center justify-center text-white"
                        aria-label="Diminuer"
                        disabled={coefficient <= 1 && !crossRatio}
                      >
                        –
                      </button>

                      <button
                        type="button"
                        onClick={increaseMultiplier}
                        className="h-9 w-9 rounded-xl bg-amber-500/20 ring-1 ring-amber-400/25 hover:bg-amber-500/25 transition inline-flex items-center justify-center text-amber-100"
                        aria-label="Augmenter"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-white/45 mb-1.5">
                      Ingrédient
                    </div>

                    <Select
                      value={crossRefIngredientId || CROSS_MANUAL_VALUE}
                      onValueChange={(v) =>
                        setCrossRefIngredientId(
                          v === CROSS_MANUAL_VALUE ? "" : v
                        )
                      }
                    >
                      <SelectTrigger className="w-full h-10 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 text-sm text-slate-100 outline-none backdrop-blur-md hover:bg-white/[0.07] transition">
                        <SelectValue placeholder="Manuel (pas d’ingrédient)" />
                      </SelectTrigger>

                      <SelectContent className="z-[9999] rounded-2xl border border-white/10 bg-slate-950/70 text-slate-100 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden">
                        <SelectItem
                          value={CROSS_MANUAL_VALUE}
                          className="cursor-pointer focus:bg-white/10 focus:text-white data-[state=checked]:bg-white/10"
                        >
                          Choisir un ingrédient
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
                      <div className="mt-1.5 text-xs text-white/45">
                        Base auto : {fmtQty(refBaseQty)}
                        {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {!refIngredient ? (
                      <div>
                        <div className="text-xs text-white/45 mb-1.5">Base</div>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={crossBase}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setCrossBase(Number.isFinite(v) && v > 0 ? v : 1);
                          }}
                          className="w-full h-10 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 text-sm font-semibold text-slate-100 outline-none"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-white/45 mb-1.5">
                          Base
                        </div>
                        <div className="h-10 flex items-center rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 text-sm font-semibold text-slate-100">
                          {fmtQty(refBaseQty)}
                          {normUnit(refUnit) ? ` ${normUnit(refUnit)}` : ""}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs text-white/45 mb-1.5">
                        J’ai
                        {refIngredient && normUnit(refUnit)
                          ? ` (${normUnit(refUnit)})`
                          : ""}
                      </div>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder={refIngredient ? "ex: 763" : "ex: 350"}
                        value={crossHave}
                        onChange={(e) => setCrossHave(e.target.value)}
                        className="w-full h-10 rounded-xl bg-white/[0.04] ring-1 ring-white/10 px-3 text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-300/40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={resetMultiplier}
                      className="text-xs font-semibold text-white/45 hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
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
                            <ul className="space-y-2">
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
                                    className="flex items-baseline justify-between gap-3 rounded-2xl bg-white/[0.035] px-3 py-2 ring-1 ring-white/10"
                                  >
                                    <div className="text-base leading-6 text-slate-50">
                                      {ing.designation ?? "—"}
                                    </div>
                                    <div className="whitespace-nowrap text-base font-semibold text-amber-100">
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
                            <div className="rounded-2xl bg-white/[0.03] p-3 text-base leading-7 text-slate-100 ring-1 ring-white/10 whitespace-pre-wrap">
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
            <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-4">
              <div className="text-slate-100 font-semibold mb-3">Ingrédients</div>

              {ingredients.length > 0 ? (
                <ul className="space-y-2">
                  {ingredients.map((ing) => {
                    const scaled =
                      isQS(ing.unit) || ing.quantity === null
                        ? ing.quantity
                        : ing.quantity * coefficient;

                    const right = formatQtyDisplay(scaled, ing.unit);
                    if (!right) return null;

                    return (
                      <li
                        key={ing.id}
                        className="flex items-baseline justify-between gap-3 rounded-2xl bg-white/[0.035] px-3 py-2 ring-1 ring-white/10"
                      >
                        <div className="text-base leading-6 text-slate-50">
                          {ing.designation ?? "—"}
                        </div>
                        <div className="whitespace-nowrap text-base font-semibold text-amber-100">
                          {right}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-sm text-slate-300/70">
                  Aucun ingrédient n’a encore été ajouté à cette recette.
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-white/[0.03] p-3 text-sm leading-6 text-slate-300/70 ring-1 ring-white/10">
                Aucune section d’étapes n’a encore été ajoutée à cette recette.
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
    </>
  );

  if (embedded) {
    return <div className="px-4 pb-8 pt-4">{content}</div>;
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
      {content}
    </PageShell>
  );
}
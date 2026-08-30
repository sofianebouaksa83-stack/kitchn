import {
  ArrowLeft,
  Tag,
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
  formatQtyDisplay,
  isQS,
  normUnit,
} from "../../../features/recipe/utils/recipeHelpers";

type Props = {
  recipeId: string;
  onBack: () => void;
  onEdit?: (recipeId: string) => void;
};

export default function RecipeDisplayDesktop({
  recipeId,
  onBack,
  onEdit,
}: Props) {
  const {
    recipe,
    sections,
    loading,
    error,
    recipeImages,
    subtitle,

    servings,
    setServings,
    baseServings,
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
    sectionsInitiallyOpen: false,
  });

  return (
    <PageShell withPanel={false} title={undefined} subtitle={undefined} icon={undefined} actions={undefined}>
      {/* ✅ Header custom desktop (sans carte globale) */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center shrink-0">
                <Tag className="w-5 h-5 text-amber-200" />
              </span>
              <h1 className="text-xl font-semibold text-slate-100 truncate">
                {recipe?.title ?? "Recette"}
              </h1>
            </div>

            {subtitle ? (
              <p className="text-sm text-slate-300/70 mt-2 max-w-3xl">{subtitle}</p>
            ) : null}

            <button
              onClick={onBack}
              className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
          </div>

          {recipe && onEdit ? (
            <div className="shrink-0 flex items-center gap-2">
              <button onClick={() => onEdit(recipe.id)} className={ui.btnPrimary} type="button">
                Modifier
              </button>
            </div>
          ) : null}
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recipeImages.length > 0 ? (
            <div className="lg:col-span-3">
              <div
                className={
                  recipeImages.length === 1
                    ? "mx-auto flex w-full justify-center"
                    : "flex w-full gap-4 overflow-x-auto pb-2"
                }
              >
                {recipeImages.map((imageUrl, index) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={`Photo ${index + 1} de ${recipe.title ?? "la recette"}`}
                    className="h-auto max-h-[340px] w-auto max-w-full shrink-0 rounded-[22px] object-contain"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          ) : null}

          {/* ✅ Col gauche : scaler “plat” */}
          <div className="lg:col-span-1 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-300/60">Multiplier</div>
                  <div className="text-sm text-slate-100 font-semibold">
                    ×{Math.round(coefficient * 100) / 100}
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

              <div className="mt-4 h-px bg-white/10" />
            </div>

            <div>
              <div className="text-xs text-slate-300/60 mb-2">Ingrédient</div>

              <Select
                value={crossRefIngredientId || CROSS_MANUAL_VALUE}
                onValueChange={(v) => setCrossRefIngredientId(v === CROSS_MANUAL_VALUE ? "" : v)}
              >
                <SelectTrigger className="w-full h-11 rounded-2xl bg-white/[0.03] ring-1 ring-white/10 px-4 text-sm text-slate-100 outline-none backdrop-blur-md hover:bg-white/[0.06] transition">
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
                  J’ai{refIngredient && normUnit(refUnit) ? ` (${normUnit(refUnit)})` : ""}
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

          {/* ✅ Col droite : accordion sections + notes */}
          <div className="lg:col-span-2 space-y-5">
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
                        className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
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
                        <div className="px-5 pb-5">
                          <div className="h-px bg-white/10 mb-4" />

                          <div>
                            <div className="text-sm text-slate-200 font-medium mb-2">
                              Ingrédients
                            </div>

                            {ings.length === 0 ? (
                              <div className="text-sm text-slate-300/70">Aucun ingrédient</div>
                            ) : (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
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
                                      <div className="text-slate-100">{ing.designation ?? "—"}</div>
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
                              <div className="text-sm text-slate-300/60">Aucune instruction</div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                <div className="text-slate-100 font-semibold mb-2">Sections</div>
                <div className="text-sm text-slate-300/70">
                  Aucune section (étape) n’a encore été ajoutée à cette recette.
                </div>
              </div>
            )}

            {recipe.notes ? (
              <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
                <div className="text-slate-100 font-semibold mb-2">Notes</div>
                <div className="text-sm text-slate-300/80 whitespace-pre-wrap">{recipe.notes}</div>
              </div>
            ) : null}

            <div className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
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
        </div>
      ) : null}
    </PageShell>
  );
}
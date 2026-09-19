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
  embedded?: boolean;
  hideBackButton?: boolean;
};

export default function RecipeDisplayDesktop({
  recipeId,
  onBack,
  onEdit,
  embedded = false,
  hideBackButton = false,
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

  const inputClass =
    "mt-1 h-11 w-full rounded-2xl " +
    "border border-[#173E31]/10 " +
    "bg-[#F7F5EF] px-4 " +
    "text-[#173E31] outline-none " +
    "placeholder:text-[#8B9791] " +
    "transition " +
    "focus:border-[#C7A45D]/50 " +
    "focus:ring-2 focus:ring-[#C7A45D]/15";

  const content = (
    <>
      {/* HEADER */}
      <div className="mb-7">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className="
                  grid h-11 w-11
                  shrink-0 place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                  ring-1 ring-[#173E31]/8
                "
              >
                <Tag className="h-5 w-5" />
              </span>

              <h1
                className="
                  truncate
                  font-serif
                  text-3xl
                  font-semibold
                  text-[#173E31]
                "
              >
                {recipe?.title ?? "Recette"}
              </h1>
            </div>

            {subtitle ? (
              <p
                className="
                  mt-2 max-w-3xl
                  text-sm
                  text-[#718078]
                "
              >
                {subtitle}
              </p>
            ) : null}

            {!hideBackButton ? (
              <button
                onClick={onBack}
              className="
                mt-4
                inline-flex items-center gap-2
                text-sm font-medium
                text-[#718078]
                transition
                hover:text-[#184C3A]
              "
              type="button"
            >
              <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
            ) : null}
          </div>

          {recipe && onEdit ? (
            <button
              onClick={() =>
                onEdit(recipe.id)
              }
              className={ui.btnPrimary}
              type="button"
            >
              Modifier
            </button>
          ) : null}
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <KitchNLoader className="kitchn-loader--compact" />
        </div>
      ) : error ? (
        <div
          className="
            flex gap-3
            rounded-[24px]
            border border-[#C05C56]/20
            bg-[#F8EAE7]
            p-6
          "
        >
          <AlertCircle className="h-5 w-5 text-[#C05C56]" />

          <div className="text-[#9B4944]">
            {error}
          </div>
        </div>
      ) : recipe ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* IMAGES */}
          {recipeImages.length > 0 ? (
            <div className="lg:col-span-3">
              <div
                className={
                  recipeImages.length === 1
                    ? "mx-auto flex w-full justify-center"
                    : "flex w-full gap-4 overflow-x-auto pb-2"
                }
              >
                {recipeImages.map(
                  (imageUrl, index) => (
                    <img
                      key={imageUrl}
                      src={imageUrl}
                      alt={`Photo ${
                        index + 1
                      } de ${
                        recipe.title ??
                        "la recette"
                      }`}
                      className="
                        h-auto
                        max-h-[340px]
                        w-auto max-w-full
                        shrink-0
                        rounded-[24px]
                        object-contain
                        shadow-[0_10px_30px_rgba(23,62,49,0.08)]
                      "
                      loading="lazy"
                    />
                  ),
                )}
              </div>
            </div>
          ) : null}

          {/* COLONNE OUTILS */}
          <div className="space-y-5 lg:col-span-1">
            <div
              className="
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-5
                shadow-[0_10px_30px_rgba(23,62,49,0.05)]
              "
            >
              <p
                className="
                  mb-5
                  text-xs font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-[#A8833E]
                "
              >
                Ajuster la recette
              </p>

              {/* MULTIPLICATEUR */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[#7A8981]">
                    Multiplicateur
                  </div>

                  <div
                    className="
                      mt-1
                      font-serif
                      text-xl font-semibold
                      text-[#173E31]
                    "
                  >
                    ×
                    {Math.round(
                      coefficient * 100,
                    ) / 100}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setServings((s) =>
                        Math.max(
                          1,
                          s - 1,
                        ),
                      )
                    }
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      border border-[#173E31]/10
                      bg-[#F3F0E8]
                      text-[#173E31]
                      transition
                      hover:bg-[#E7EEE8]
                      disabled:opacity-40
                    "
                    type="button"
                    aria-label="Diminuer"
                    disabled={
                      servings <= 1 ||
                      !!crossRatio
                    }
                  >
                    –
                  </button>

                  <button
                    onClick={() =>
                      setServings(
                        (s) => s + 1,
                      )
                    }
                    className="
                      inline-flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                      bg-[#184C3A]
                      text-[#F7F3EA]
                      transition
                      hover:bg-[#123C2E]
                      disabled:opacity-40
                    "
                    type="button"
                    aria-label="Augmenter"
                    disabled={!!crossRatio}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="my-5 h-px bg-[#173E31]/8" />

              {/* INGREDIENT REF */}
              <div>
                <div className="mb-2 text-xs text-[#7A8981]">
                  Ingrédient de référence
                </div>

                <Select
                  value={
                    crossRefIngredientId ||
                    CROSS_MANUAL_VALUE
                  }
                  onValueChange={(value) =>
                    setCrossRefIngredientId(
                      value ===
                        CROSS_MANUAL_VALUE
                        ? ""
                        : value,
                    )
                  }
                >
                  <SelectTrigger
                    className="
                      h-11 w-full
                      rounded-2xl
                      border border-[#173E31]/10
                      bg-[#F7F5EF]
                      px-4
                      text-sm text-[#173E31]
                      outline-none
                      transition
                      hover:bg-[#E7EEE8]
                    "
                  >
                    <SelectValue placeholder="Manuel (pas d’ingrédient)" />
                  </SelectTrigger>

                  <SelectContent
                    className="
                      z-[9999]
                      overflow-hidden
                      rounded-2xl
                      border border-[#173E31]/10
                      bg-[#FBFAF6]
                      text-[#173E31]
                      shadow-[0_18px_45px_rgba(23,62,49,0.12)]
                    "
                  >
                    <SelectItem
                      value={
                        CROSS_MANUAL_VALUE
                      }
                      className="
                        cursor-pointer
                        focus:bg-[#E7EEE8]
                        focus:text-[#184C3A]
                        data-[state=checked]:bg-[#E7EEE8]
                      "
                    >
                      Choisir un ingrédient
                    </SelectItem>

                    {crossSelectableIngredients.map(
                      (option) => (
                        <SelectItem
                          key={option.id}
                          value={option.id}
                          className="
                            cursor-pointer
                            focus:bg-[#E7EEE8]
                            focus:text-[#184C3A]
                            data-[state=checked]:bg-[#E7EEE8]
                          "
                        >
                          {option.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>

                {refIngredient ? (
                  <div className="mt-2 text-xs text-[#7A8981]">
                    Base auto :{" "}
                    {fmtQty(refBaseQty)}

                    {normUnit(refUnit)
                      ? ` ${normUnit(
                          refUnit,
                        )}`
                      : ""}
                  </div>
                ) : null}
              </div>

              {/* BASE / J'AI */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {!refIngredient ? (
                  <div>
                    <div className="text-xs text-[#7A8981]">
                      Base
                    </div>

                    <input
                      type="number"
                      inputMode="numeric"
                      value={crossBase}
                      onChange={(event) => {
                        const value =
                          Number(
                            event.target
                              .value,
                          );

                        setCrossBase(
                          Number.isFinite(
                            value,
                          ) &&
                            value > 0
                            ? value
                            : 1,
                        );
                      }}
                      className={
                        inputClass
                      }
                    />
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-[#7A8981]">
                      Base auto
                    </div>

                    <div
                      className="
                        mt-1
                        flex h-11
                        items-center
                        rounded-2xl
                        border border-[#173E31]/10
                        bg-[#F7F5EF]
                        px-4
                        text-[#173E31]
                      "
                    >
                      {fmtQty(refBaseQty)}

                      {normUnit(refUnit)
                        ? ` ${normUnit(
                            refUnit,
                          )}`
                        : ""}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs text-[#7A8981]">
                    J’ai
                    {refIngredient &&
                    normUnit(refUnit)
                      ? ` (${normUnit(
                          refUnit,
                        )})`
                      : ""}
                  </div>

                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder={
                      refIngredient
                        ? "ex: 763"
                        : "ex: 350"
                    }
                    value={crossHave}
                    onChange={(event) =>
                      setCrossHave(
                        event.target.value,
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setServings(
                    baseServings,
                  );
                  setCrossHave("");
                  setCrossBase(500);
                  setCrossRefIngredientId(
                    "",
                  );
                }}
                className="
                  mt-5 w-full
                  rounded-2xl
                  border border-[#173E31]/10
                  bg-[#F3F0E8]
                  px-4 py-3
                  text-sm font-medium
                  text-[#617168]
                  transition
                  hover:bg-[#E7EEE8]
                  hover:text-[#184C3A]
                "
                type="button"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* CONTENU */}
          <div className="space-y-5 lg:col-span-2">
            {sections.length > 0 ? (
              <div className="space-y-3">
                {sections.map(
                  (section) => {
                    const isOpen =
                      !!openSections[
                        section.id
                      ];

                    const sectionItems =
                      sectionIngredients.get(
                        section.id,
                      ) ?? [];

                    return (
                      <div
                        key={section.id}
                        className="
                          overflow-hidden
                          rounded-[28px]
                          border border-[#173E31]/10
                          bg-[#FBFAF6]
                          shadow-[0_10px_30px_rgba(23,62,49,0.05)]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleSection(
                              section.id,
                            )
                          }
                          className="
                            flex w-full
                            items-center
                            justify-between
                            gap-3
                            px-5 py-5
                            text-left
                          "
                        >
                          <div className="min-w-0">
                            <div
                              className="
                                truncate
                                font-serif
                                text-xl
                                font-semibold
                                text-[#173E31]
                              "
                            >
                              {section.title?.trim()
                                ? section.title
                                : "Sans titre"}
                            </div>

                            <div className="mt-1 text-xs text-[#7A8981]">
                              {
                                sectionItems.length
                              }{" "}
                              ingrédient(s)
                              {section.instructions?.trim()
                                ? " · Étapes"
                                : ""}
                            </div>
                          </div>

                          <div className="shrink-0 text-[#718078]">
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </div>
                        </button>

                        {isOpen ? (
                          <div className="px-5 pb-5">
                            <div className="mb-4 h-px bg-[#173E31]/8" />

                            <div>
                              <div
                                className="
                                  mb-3
                                  text-sm
                                  font-semibold
                                  text-[#29493E]
                                "
                              >
                                Ingrédients
                              </div>

                              {sectionItems.length ===
                              0 ? (
                                <div className="text-sm text-[#718078]">
                                  Aucun
                                  ingrédient
                                </div>
                              ) : (
                                <ul
                                  className="
                                    grid
                                    grid-cols-1
                                    gap-2
                                    md:grid-cols-2
                                    md:gap-x-5
                                  "
                                >
                                  {sectionItems.map(
                                    (
                                      ingredient,
                                    ) => {
                                      const scaled =
                                        isQS(
                                          ingredient.unit,
                                        ) ||
                                        ingredient.quantity ===
                                          null
                                          ? ingredient.quantity
                                          : ingredient.quantity *
                                            coefficient;

                                      const right =
                                        formatQtyDisplay(
                                          scaled,
                                          ingredient.unit,
                                        );

                                      if (
                                        !right
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <li
                                          key={
                                            ingredient.id
                                          }
                                          className="
                                            flex
                                            items-baseline
                                            justify-between
                                            gap-3
                                            rounded-2xl
                                            border border-[#173E31]/8
                                            bg-[#F7F5EF]
                                            px-3 py-2.5
                                          "
                                        >
                                          <div className="text-sm text-[#173E31]">
                                            {ingredient.designation ??
                                              "—"}
                                          </div>

                                          <div
                                            className="
                                              whitespace-nowrap
                                              text-sm
                                              font-semibold
                                              text-[#A8833E]
                                            "
                                          >
                                            {
                                              right
                                            }
                                          </div>
                                        </li>
                                      );
                                    },
                                  )}
                                </ul>
                              )}
                            </div>

                            <div className="mt-5">
                              <div
                                className="
                                  mb-2
                                  text-sm
                                  font-semibold
                                  text-[#29493E]
                                "
                              >
                                Étapes
                              </div>

                              {section.instructions?.trim() ? (
                                <div
                                  className="
                                    whitespace-pre-wrap
                                    rounded-2xl
                                    border border-[#173E31]/8
                                    bg-[#F7F5EF]
                                    p-4
                                    text-sm
                                    leading-7
                                    text-[#617168]
                                  "
                                >
                                  {
                                    section.instructions
                                  }
                                </div>
                              ) : (
                                <div className="text-sm text-[#718078]">
                                  Aucune
                                  instruction
                                </div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div
                className="
                  rounded-[28px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-5
                "
              >
                <div
                  className="
                    mb-2
                    font-serif
                    text-xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Sections
                </div>

                <div className="text-sm text-[#718078]">
                  Aucune section (étape)
                  n’a encore été ajoutée à
                  cette recette.
                </div>
              </div>
            )}

            {/* NOTES RECETTE */}
            {recipe.notes ? (
              <div
                className="
                  rounded-[28px]
                  border border-[#173E31]/10
                  bg-[#FBFAF6]
                  p-5
                "
              >
                <div
                  className="
                    mb-2
                    font-serif
                    text-xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Notes
                </div>

                <div className="whitespace-pre-wrap text-sm leading-6 text-[#617168]">
                  {recipe.notes}
                </div>
              </div>
            ) : null}

            {/* MES NOTES */}
            <div
              className="
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                p-5
              "
            >
              <div className="flex items-center justify-between gap-3">
                <div
                  className="
                    font-serif
                    text-xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Mes notes
                </div>

                <div className="text-xs text-[#7A8981]">
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
                onChange={(event) =>
                  setMyNote(
                    event.target.value,
                  )
                }
                placeholder="Écris tes notes ici…"
                className="
                  mt-3
                  min-h-[160px]
                  w-full
                  resize-y
                  rounded-2xl
                  border border-[#173E31]/10
                  bg-[#F7F5EF]
                  px-4 py-3
                  text-sm
                  text-[#173E31]
                  outline-none
                  placeholder:text-[#8B9791]
                  transition
                  focus:border-[#C7A45D]/50
                  focus:ring-2
                  focus:ring-[#C7A45D]/15
                "
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );

  if (embedded) {
    return <div className="px-4 pb-8 pt-4">{content}</div>;
  }

  return <PageShell withPanel={false}>{content}</PageShell>;
}

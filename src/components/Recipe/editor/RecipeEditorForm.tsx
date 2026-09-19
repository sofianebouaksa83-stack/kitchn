import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { ui } from "../../../styles/ui";

import {
  CATEGORIES,
  UNITS,
} from "../../../features/recipe/hooks/useRecipeEditor";

import type {
  IngredientForm,
  useRecipeEditor,
} from "../../../features/recipe/hooks/useRecipeEditor";

type Editor = ReturnType<typeof useRecipeEditor>;

type Props = {
  editor: Editor;
  variant: "desktop" | "mobile";
};

type IngredientRowProps = {
  editor: Editor;
  ingredient: IngredientForm;
  ingredientIndex: number;
  sectionId: string;
  isOnlyIngredient: boolean;
  variant: "desktop" | "mobile";
};

/* ──────────────────────────────────────────────
   DESIGN SYSTEM LOCAL
────────────────────────────────────────────── */

const labelCls =
  "mb-2 block text-[12px] font-semibold text-[#29493E]";

const hintCls =
  "text-xs leading-relaxed text-[#7A8981]";

const inputBase =
  "w-full border border-[#173E31]/10 bg-[#FBFAF6] " +
  "text-[#173E31] outline-none transition-all duration-200 " +
  "placeholder:text-[#8B9791] " +
  "hover:border-[#173E31]/20 " +
  "focus:border-[#C7A45D]/50 " +
  "focus:ring-2 focus:ring-[#C7A45D]/15";

const inputCls =
  `${inputBase} h-10 rounded-xl px-3 text-sm`;

const textareaCls =
  "w-full resize-none rounded-2xl " +
  "border border-[#173E31]/10 bg-[#FBFAF6] " +
  "px-4 py-3 text-sm leading-6 text-[#173E31] " +
  "outline-none transition-all duration-200 " +
  "placeholder:text-[#8B9791] " +
  "hover:border-[#173E31]/20 " +
  "focus:border-[#C7A45D]/50 " +
  "focus:ring-2 focus:ring-[#C7A45D]/15";

const sectionTitleCls =
  "text-[11px] font-semibold uppercase " +
  "tracking-[0.18em] text-[#A8833E]";

const dividerCls =
  "border-b border-[#173E31]/8";

const softCardCls =
  "rounded-[24px] border border-[#173E31]/10 " +
  "bg-[#FBFAF6] shadow-[0_8px_24px_rgba(23,62,49,0.04)]";

const dangerIconButton =
  "inline-flex items-center justify-center " +
  "rounded-xl text-[#A86A66] transition " +
  "hover:bg-[#F5E4E0] hover:text-[#A54C48] " +
  "disabled:cursor-not-allowed disabled:opacity-30";

/* ──────────────────────────────────────────────
   INGREDIENT ROW
────────────────────────────────────────────── */

function IngredientRow({
  editor,
  ingredient,
  ingredientIndex,
  sectionId,
  isOnlyIngredient,
  variant,
}: IngredientRowProps) {
  if (variant === "desktop") {
    return (
      <div
        className="
          grid grid-cols-[86px_96px_1fr_40px]
          items-center gap-2
          rounded-2xl
          border border-[#173E31]/8
          bg-[#F7F5EF]
          p-2
        "
      >
        {/* QUANTITÉ */}
        <input
          type="number"
          step="0.001"
          min="0"
          value={ingredient.quantity}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "quantity",
              event.target.value,
            )
          }
          className={`${inputBase} h-10 rounded-xl px-3 text-sm`}
          placeholder="Qté"
        />

        {/* UNITÉ */}
        <select
          value={ingredient.unit}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "unit",
              event.target.value,
            )
          }
          className={`${inputBase} h-10 rounded-xl px-2 text-sm`}
        >
          {UNITS.map((unit) => (
            <option
              key={unit}
              value={unit}
              className="bg-[#FBFAF6] text-[#173E31]"
            >
              {unit}
            </option>
          ))}
        </select>

        {/* INGRÉDIENT */}
        <input
          value={ingredient.designation}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "designation",
              event.target.value,
            )
          }
          className={`${inputCls} min-w-0`}
          placeholder="Ingrédient"
        />

        {/* DELETE */}
        <button
          onClick={() =>
            editor.removeIngredient(
              sectionId,
              ingredientIndex,
            )
          }
          disabled={isOnlyIngredient}
          className={`${dangerIconButton} h-10 w-10`}
          type="button"
          title="Supprimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-2xl
        border border-[#173E31]/8
        bg-[#F7F5EF]
        p-2
      "
    >
      <div
        className="
          grid grid-cols-[78px_90px_1fr_36px]
          items-center gap-2
        "
      >
        {/* QUANTITÉ */}
        <input
          type="number"
          step="0.001"
          min="0"
          value={ingredient.quantity}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "quantity",
              event.target.value,
            )
          }
          className={`${inputBase} h-9 rounded-xl px-2 text-sm`}
          placeholder="Qté"
        />

        {/* UNITÉ */}
        <select
          value={ingredient.unit}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "unit",
              event.target.value,
            )
          }
          className={`${inputBase} h-9 rounded-xl px-2 text-sm`}
        >
          {UNITS.map((unit) => (
            <option
              key={unit}
              value={unit}
              className="bg-[#FBFAF6] text-[#173E31]"
            >
              {unit}
            </option>
          ))}
        </select>

        <div />

        {/* DELETE */}
        <button
          onClick={() =>
            editor.removeIngredient(
              sectionId,
              ingredientIndex,
            )
          }
          disabled={isOnlyIngredient}
          className={`${dangerIconButton} h-9 w-9`}
          type="button"
          title="Supprimer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* NOM INGRÉDIENT */}
      <div className="mt-2">
        <input
          value={ingredient.designation}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "designation",
              event.target.value,
            )
          }
          className={`${inputBase} h-10 w-full rounded-xl px-3 text-sm`}
          placeholder="Nom de l’ingrédient"
        />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MAIN FORM
────────────────────────────────────────────── */

export function RecipeEditorForm({
  editor,
  variant,
}: Props) {
  const isDesktop = variant === "desktop";

  return (
    <>
      {/* ═══════════════════════════════════════
          INFORMATIONS
      ═══════════════════════════════════════ */}

      <section
        className={`
          ${isDesktop ? "pb-8" : "mt-7 pb-7"}
          ${dividerCls}
        `}
      >
        <div className={sectionTitleCls}>
          Informations
        </div>

        <div
          className={`
            ${isDesktop ? "mt-1" : "mt-2"}
            ${hintCls}
          `}
        >
          Titre, catégorie et photos
        </div>

        <div
          className={
            isDesktop
              ? "mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
              : "mt-5 space-y-5"
          }
        >
          {/* TITRE */}
          <div
            className={
              isDesktop
                ? "md:col-span-2"
                : undefined
            }
          >
            <label className={labelCls}>
              Titre de la recette *
            </label>

            <input
              value={editor.title}
              onChange={(event) =>
                editor.setTitle(
                  event.target.value,
                )
              }
              placeholder={
                isDesktop
                  ? "Ex : Langoustine, bisque, pickles…"
                  : "Ex : Foie gras, coing et lie de vin"
              }
              className={`
                ${inputBase}
                h-12 rounded-2xl px-4
                ${
                  isDesktop
                    ? "text-base"
                    : "text-sm"
                }
              `}
            />
          </div>

          {/* CATÉGORIE */}
          <div>
            <label className={labelCls}>
              Catégorie
            </label>

            <select
              value={editor.category}
              onChange={(event) =>
                editor.setCategory(
                  event.target.value,
                )
              }
              className={`
                ${inputBase}
                h-12 rounded-2xl px-4
                ${
                  isDesktop
                    ? "text-base"
                    : "text-sm"
                }
              `}
            >
              {CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-[#FBFAF6] text-[#173E31]"
                  >
                    {category}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* PHOTOS */}
          <div
            className={
              isDesktop
                ? "md:col-span-2"
                : undefined
            }
          >
            <div className="flex items-center justify-between gap-3">
              <label className={labelCls}>
                Photos de la recette
              </label>

              {editor.recipeImages.length >
              0 ? (
                <span className="mb-2 text-[11px] text-[#7A8981]">
                  {
                    editor.recipeImages
                      .length
                  }{" "}
                  photo
                  {editor.recipeImages
                    .length > 1
                    ? "s"
                    : ""}
                </span>
              ) : null}
            </div>

            <div
              className={`
                ${softCardCls}
                p-3
              `}
            >
              {editor.recipeImages.length >
              0 ? (
                <div
                  className={
                    isDesktop
                      ? "grid grid-cols-2 gap-3 md:grid-cols-4"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  {editor.recipeImages.map(
                    (image, index) => (
                      <div
                        key={image.localId}
                        className="
                          relative
                          overflow-hidden
                          rounded-[18px]
                          border border-[#173E31]/8
                          bg-[#F7F5EF]
                        "
                      >
                        <img
                          src={image.url}
                          alt={`Photo ${
                            index + 1
                          } de la recette`}
                          className={`
                            ${
                              isDesktop
                                ? "h-40"
                                : "h-32"
                            }
                            w-full object-contain
                          `}
                        />

                        {/* PRINCIPALE */}
                        {index === 0 ? (
                          <div
                            className="
                              absolute
                              bottom-2 left-2
                              rounded-full
                              bg-[#184C3A]/90
                              px-2 py-1
                              text-[10px]
                              font-medium
                              text-[#F7F3EA]
                              backdrop-blur-md
                            "
                          >
                            Principale
                          </div>
                        ) : null}

                        {/* DELETE PHOTO */}
                        <button
                          type="button"
                          onClick={() =>
                            editor.removeRecipeImage(
                              image.localId,
                            )
                          }
                          className="
                            absolute right-2 top-2
                            inline-flex
                            h-8 w-8
                            items-center
                            justify-center
                            rounded-full
                            bg-[#FBFAF6]/95
                            text-[#A54C48]
                            shadow-sm
                            ring-1
                            ring-[#173E31]/10
                            transition
                            hover:bg-[#F5E4E0]
                          "
                          title="Supprimer cette photo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                /* EMPTY PHOTOS */
                <div
                  className={`
                    ${
                      isDesktop
                        ? "h-44"
                        : "h-36"
                    }
                    flex w-full
                    flex-col
                    items-center
                    justify-center
                    gap-2
                    rounded-[18px]
                    bg-[#F7F5EF]
                    text-[#718078]
                  `}
                >
                  <div
                    className="
                      grid h-11 w-11
                      place-items-center
                      rounded-2xl
                      bg-[#C7A45D]/12
                      text-[#A8833E]
                    "
                  >
                    <ImagePlus
                      className={
                        isDesktop
                          ? "h-6 w-6"
                          : "h-5 w-5"
                      }
                    />
                  </div>

                  <span className="text-sm font-medium">
                    Aucune photo ajoutée
                  </span>

                  <span className="text-[11px] text-[#8B9791]">
                    JPG, PNG ou WebP · max 8
                    Mo/photo
                  </span>
                </div>
              )}

              {/* PHOTO ACTIONS */}
              <div className="mt-3 flex items-center gap-2">
                <label
                  className="
                    inline-flex h-10
                    flex-1 cursor-pointer
                    items-center
                    justify-center gap-2
                    rounded-2xl
                    border border-[#C7A45D]/20
                    bg-[#C7A45D]/10
                    text-sm font-medium
                    text-[#8B6C32]
                    transition
                    hover:bg-[#C7A45D]/16
                  "
                >
                  <ImagePlus className="h-4 w-4" />

                  Ajouter des photos

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      editor.handleRecipeImagesChange(
                        event.currentTarget
                          .files,
                      );

                      event.currentTarget.value =
                        "";
                    }}
                  />
                </label>

                {editor.recipeImages.length >
                0 ? (
                  <button
                    type="button"
                    onClick={
                      editor.clearAllRecipeImages
                    }
                    className={`${dangerIconButton} h-10 w-10 border border-[#173E31]/8 bg-[#FBFAF6]`}
                    title="Supprimer toutes les photos"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTIONS
      ═══════════════════════════════════════ */}

      <section
        className={`
          ${
            isDesktop
              ? "mt-8 pb-8"
              : "mt-7 pb-7"
          }
          ${dividerCls}
        `}
      >
        {/* SECTION HEADER */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={sectionTitleCls}>
              Sections
            </div>

            <div className={`mt-1 ${hintCls}`}>
              Sous-recettes / éléments de la
              recette
            </div>
          </div>

          <button
            onClick={editor.addSection}
            className="
              inline-flex h-9
              items-center gap-2
              rounded-xl
              bg-[#E7EEE8]
              px-3
              text-sm font-medium
              text-[#184C3A]
              transition
              hover:bg-[#DDE8DF]
            "
            type="button"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        {/* SECTION LIST */}
        <div
          className={
            isDesktop
              ? "mt-5 space-y-6"
              : "mt-4 space-y-5"
          }
        >
          {editor.sections.map(
            (
              section,
              sectionIndex,
            ) => {
              const ingredients =
                editor
                  .sectionIngredients[
                  section.localId
                ] ?? [];

              const isOnlySection =
                editor.sections.length ===
                1;

              return (
                <div
                  key={section.localId}
                  className="
                    rounded-[26px]
                    border border-[#173E31]/10
                    bg-[#FBFAF6]
                    p-4
                    shadow-[0_8px_24px_rgba(23,62,49,0.04)]
                  "
                >
                  {/* SECTION TOP */}
                  <div className="flex items-center gap-2">
                    {/* INDEX */}
                    <div
                      className="
                        flex h-9 w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#E7EEE8]
                        text-sm font-semibold
                        text-[#184C3A]
                      "
                    >
                      {sectionIndex + 1}
                    </div>

                    {/* NAME */}
                    <div className="min-w-0 flex-1">
                      <input
                        value={section.title}
                        onChange={(
                          event,
                        ) =>
                          editor.setSections(
                            (
                              previousSections,
                            ) =>
                              previousSections.map(
                                (
                                  item,
                                ) =>
                                  item.localId ===
                                  section.localId
                                    ? {
                                        ...item,
                                        title:
                                          event
                                            .target
                                            .value,
                                      }
                                    : item,
                              ),
                          )
                        }
                        placeholder="Nom de la section"
                        className={inputCls}
                      />
                    </div>

                    {/* COLLAPSE */}
                    <button
                      onClick={() =>
                        editor.toggleCollapse(
                          section.localId,
                        )
                      }
                      className="
                        inline-flex
                        h-9 w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0F2EC]
                        text-[#617168]
                        transition
                        hover:bg-[#E7EEE8]
                        hover:text-[#184C3A]
                      "
                      type="button"
                      title={
                        section.collapsed
                          ? "Déplier"
                          : "Replier"
                      }
                    >
                      {section.collapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </button>

                    {/* DELETE SECTION */}
                    <button
                      onClick={() =>
                        editor.removeSection(
                          section.localId,
                        )
                      }
                      disabled={
                        isOnlySection
                      }
                      className={`${dangerIconButton} h-9 w-9 shrink-0`}
                      type="button"
                      title="Supprimer la section"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {!section.collapsed ? (
                    <div
                      className={
                        isDesktop
                          ? "mt-5 space-y-6"
                          : "mt-4 space-y-5"
                      }
                    >
                      {/* INGREDIENTS */}
                      <div>
                        <div
                          className="
                            mb-3
                            text-[12px]
                            font-semibold
                            text-[#29493E]
                          "
                        >
                          Ingrédients
                        </div>

                        <div className="space-y-2">
                          {ingredients.map(
                            (
                              ingredient,
                              ingredientIndex,
                            ) => (
                              <IngredientRow
                                key={
                                  ingredient.localId
                                }
                                editor={
                                  editor
                                }
                                ingredient={
                                  ingredient
                                }
                                ingredientIndex={
                                  ingredientIndex
                                }
                                sectionId={
                                  section.localId
                                }
                                isOnlyIngredient={
                                  ingredients.length ===
                                  1
                                }
                                variant={
                                  variant
                                }
                              />
                            ),
                          )}
                        </div>

                        <button
                          onClick={() =>
                            editor.addIngredient(
                              section.localId,
                            )
                          }
                          className="
                            mt-3
                            inline-flex
                            items-center gap-2
                            text-sm font-medium
                            text-[#A8833E]
                            transition
                            hover:text-[#7F632F]
                          "
                          type="button"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un ingrédient
                        </button>
                      </div>

                      {/* INSTRUCTIONS SECTION */}
                      <div>
                        <div
                          className="
                            mb-2
                            text-[12px]
                            font-semibold
                            text-[#29493E]
                          "
                        >
                          Instructions
                        </div>

                        <textarea
                          value={
                            section.instructions
                          }
                          onChange={(
                            event,
                          ) =>
                            editor.setSections(
                              (
                                previousSections,
                              ) =>
                                previousSections.map(
                                  (
                                    item,
                                  ) =>
                                    item.localId ===
                                    section.localId
                                      ? {
                                          ...item,
                                          instructions:
                                            event
                                              .target
                                              .value,
                                        }
                                      : item,
                                ),
                            )
                          }
                          rows={5}
                          placeholder="Étapes / cuisson / dressage…"
                          className={
                            textareaCls
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            },
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          INSTRUCTIONS GÉNÉRALES
      ═══════════════════════════════════════ */}

      <section
        className={
          isDesktop ? "mt-8" : "mt-7"
        }
      >
        <div className={sectionTitleCls}>
          Instructions générales
        </div>

        <div className={`mt-1 ${hintCls}`}>
          Optionnel · notes globales, timing,
          organisation…
        </div>

        <textarea
          value={
            editor.generalInstructions
          }
          onChange={(event) =>
            editor.setGeneralInstructions(
              event.target.value,
            )
          }
          rows={6}
          placeholder="Notes globales / timing / organisation…"
          className={`mt-4 ${textareaCls}`}
        />

        {/* SAVE DESKTOP */}
        {isDesktop ? (
          <div className="mt-6 flex justify-end">
            <button
              onClick={
                editor.handleSave
              }
              disabled={
                editor.saving
              }
              className={
                ui.btnPrimary
              }
              type="button"
            >
              <Save className="h-4 w-4" />

              {editor.saving
                ? "Enregistrement…"
                : "Enregistrer"}
            </button>
          </div>
        ) : null}
      </section>
    </>
  );
}
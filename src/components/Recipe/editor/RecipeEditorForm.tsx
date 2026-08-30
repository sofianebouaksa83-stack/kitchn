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

const labelCls =
  "block text-[12px] font-medium text-slate-200/90 mb-2";

const hintCls = "text-xs text-slate-300/60";

const inputBase =
  "w-full bg-white/[0.045] border border-white/10 text-slate-100 outline-none " +
  "placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20";

const inputCls = `${inputBase} h-10 rounded-xl px-3 text-sm`;

const textareaCls =
  "w-full rounded-2xl bg-white/[0.045] border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none " +
  "placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20 resize-none";

const sectionTitleCls =
  "text-[11px] uppercase tracking-wider text-slate-200/70 font-semibold";

const dividerCls = "border-b border-white/10";

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
      <div className="grid grid-cols-[86px_96px_1fr_40px] gap-2 items-center rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-2">
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
              event.target.value
            )
          }
          className={`${inputBase} h-10 rounded-xl px-3 text-sm`}
          placeholder="Qté"
        />

        <select
          value={ingredient.unit}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "unit",
              event.target.value
            )
          }
          className={`${inputBase} h-10 rounded-xl px-2 text-sm`}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit} className="bg-[#0B1020]">
              {unit}
            </option>
          ))}
        </select>

        <input
          value={ingredient.designation}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "designation",
              event.target.value
            )
          }
          className={`${inputCls} min-w-0`}
          placeholder="Ingrédient"
        />

        <button
          onClick={() =>
            editor.removeIngredient(sectionId, ingredientIndex)
          }
          disabled={isOnlyIngredient}
          className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
          type="button"
          title="Supprimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-2">
      <div className="grid grid-cols-[78px_90px_1fr_36px] gap-2 items-center">
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
              event.target.value
            )
          }
          className={`${inputBase} h-9 rounded-xl px-2 text-sm`}
          placeholder="Qté"
        />

        <select
          value={ingredient.unit}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "unit",
              event.target.value
            )
          }
          className={`${inputBase} h-9 rounded-xl px-2 text-sm`}
        >
          {UNITS.map((unit) => (
            <option key={unit} value={unit} className="bg-[#0B1020]">
              {unit}
            </option>
          ))}
        </select>

        <div className="text-[11px] text-slate-300/30 truncate px-1" />

        <button
          onClick={() =>
            editor.removeIngredient(sectionId, ingredientIndex)
          }
          disabled={isOnlyIngredient}
          className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
          type="button"
          title="Supprimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2">
        <input
          value={ingredient.designation}
          onChange={(event) =>
            editor.updateIngredient(
              sectionId,
              ingredientIndex,
              "designation",
              event.target.value
            )
          }
          className={`${inputBase} w-full h-10 rounded-xl px-3 text-sm`}
          placeholder="Nom de l’ingrédient"
        />
      </div>
    </div>
  );
}

export function RecipeEditorForm({ editor, variant }: Props) {
  const isDesktop = variant === "desktop";

  return (
    <>
      <div
        className={`${isDesktop ? "pb-8" : "mt-7 pb-7"} ${dividerCls}`}
      >
        <div className={sectionTitleCls}>Informations</div>

        <div className={`${isDesktop ? "mt-1" : "mt-3"} ${hintCls}`}>
          Titre, catégorie et photos
        </div>

        <div
          className={
            isDesktop
              ? "mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
              : "mt-4 space-y-4"
          }
        >
          <div className={isDesktop ? "md:col-span-2" : undefined}>
            <label className={labelCls}>Titre de la recette *</label>

            <input
              value={editor.title}
              onChange={(event) => editor.setTitle(event.target.value)}
              placeholder={
                isDesktop
                  ? "Ex: Langoustine, bisque, pickles…"
                  : "Ex: Foie gras, coing et lie de vin"
              }
              className={`${inputBase} h-11 rounded-2xl px-4 ${
                isDesktop ? "" : "text-sm"
              }`}
            />
          </div>

          <div>
            <label className={labelCls}>Catégorie</label>

            <select
              value={editor.category}
              onChange={(event) =>
                editor.setCategory(event.target.value)
              }
              className={`${inputBase} h-11 rounded-2xl px-3 ${
                isDesktop ? "" : "text-sm"
              }`}
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-[#0B1020]"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={isDesktop ? "md:col-span-2" : undefined}>
            <div className="flex items-center justify-between gap-3">
              <label className={labelCls}>Photos de la recette</label>

              {editor.recipeImages.length > 0 ? (
                <span className="text-[11px] text-slate-300/50">
                  {editor.recipeImages.length} photo
                  {editor.recipeImages.length > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>

            <div className="rounded-[24px] bg-white/[0.025] ring-1 ring-white/10 p-3">
              {editor.recipeImages.length > 0 ? (
                <div
                  className={
                    isDesktop
                      ? "grid grid-cols-2 md:grid-cols-4 gap-3"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  {editor.recipeImages.map((image, index) => (
                    <div
                      key={image.localId}
                      className="relative overflow-hidden rounded-[18px] bg-white/[0.03] ring-1 ring-white/10"
                    >
                      <img
                        src={image.url}
                        alt={`Photo ${index + 1} de la recette`}
                        className={`${
                          isDesktop ? "h-40" : "h-32"
                        } w-full object-contain`}
                      />

                      {index === 0 ? (
                        <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                          Principale
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={() =>
                          editor.removeRecipeImage(image.localId)
                        }
                        className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/45 text-red-100 backdrop-blur-md ring-1 ring-white/10 hover:bg-red-500/30 inline-flex items-center justify-center"
                        title="Supprimer cette photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`${
                    isDesktop ? "h-44" : "h-36"
                  } w-full flex flex-col items-center justify-center gap-2 rounded-[18px] bg-white/[0.035] text-slate-300/70`}
                >
                  <ImagePlus
                    className={`${
                      isDesktop ? "h-8 w-8" : "h-7 w-7"
                    } text-amber-200/80`}
                  />
                  <span className="text-sm">Aucune photo ajoutée</span>
                  <span className="text-[11px] text-slate-400/60">
                    JPG, PNG ou WebP · max 8 Mo/photo
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <label className="flex-1 h-10 cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/20 hover:bg-amber-300/15 text-sm font-medium">
                  <ImagePlus className="w-4 h-4" />
                  Ajouter des photos

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      editor.handleRecipeImagesChange(
                        event.currentTarget.files
                      );
                      event.currentTarget.value = "";
                    }}
                  />
                </label>

                {editor.recipeImages.length > 0 ? (
                  <button
                    type="button"
                    onClick={editor.clearAllRecipeImages}
                    className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center"
                    title="Supprimer toutes les photos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${isDesktop ? "mt-8 pb-8" : "mt-7 pb-7"} ${dividerCls}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={sectionTitleCls}>Sections</div>
            <div className={`mt-1 ${hintCls}`}>
              Sous-recettes / éléments de la recette
            </div>
          </div>

          <button
            onClick={editor.addSection}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-amber-300/10 text-amber-200 ring-1 ring-amber-300/20 hover:bg-amber-300/15 text-sm"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div
          className={
            isDesktop ? "mt-5 space-y-6" : "mt-4 space-y-5"
          }
        >
          {editor.sections.map((section, sectionIndex) => {
            const ingredients =
              editor.sectionIngredients[section.localId] ?? [];
            const isOnlySection = editor.sections.length === 1;

            return (
              <div key={section.localId} className="pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-200 font-semibold text-sm">
                    {sectionIndex + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      value={section.title}
                      onChange={(event) =>
                        editor.setSections((previousSections) =>
                          previousSections.map((item) =>
                            item.localId === section.localId
                              ? {
                                  ...item,
                                  title: event.target.value,
                                }
                              : item
                          )
                        )
                      }
                      placeholder="Nom de la section"
                      className={inputCls}
                    />
                  </div>

                  <button
                    onClick={() =>
                      editor.toggleCollapse(section.localId)
                    }
                    className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200 inline-flex items-center justify-center"
                    type="button"
                    title={section.collapsed ? "Déplier" : "Replier"}
                  >
                    {section.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() =>
                      editor.removeSection(section.localId)
                    }
                    disabled={isOnlySection}
                    className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
                    type="button"
                    title="Supprimer la section"
                  >
                    <X className="w-4 h-4" />
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
                    <div>
                      <div className="text-[12px] text-slate-200 font-medium mb-3">
                        Ingrédients
                      </div>

                      <div className="space-y-2">
                        {ingredients.map(
                          (ingredient, ingredientIndex) => (
                            <IngredientRow
                              key={ingredient.localId}
                              editor={editor}
                              ingredient={ingredient}
                              ingredientIndex={ingredientIndex}
                              sectionId={section.localId}
                              isOnlyIngredient={
                                ingredients.length === 1
                              }
                              variant={variant}
                            />
                          )
                        )}
                      </div>

                      <button
                        onClick={() =>
                          editor.addIngredient(section.localId)
                        }
                        className="mt-3 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-medium"
                        type="button"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un ingrédient
                      </button>
                    </div>

                    <div>
                      <div className="text-[12px] text-slate-200 font-medium mb-2">
                        Instructions
                      </div>

                      <textarea
                        value={section.instructions}
                        onChange={(event) =>
                          editor.setSections((previousSections) =>
                            previousSections.map((item) =>
                              item.localId === section.localId
                                ? {
                                    ...item,
                                    instructions: event.target.value,
                                  }
                                : item
                            )
                          )
                        }
                        rows={5}
                        placeholder="Étapes / cuisson / dressage…"
                        className={textareaCls}
                      />
                    </div>

                    <div className="pt-1 border-b border-white/10" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={isDesktop ? "mt-8" : "mt-7"}>
        <div className={sectionTitleCls}>Instructions générales</div>
        <div className={`mt-1 ${hintCls}`}>(optionnel)</div>

        <textarea
          value={editor.generalInstructions}
          onChange={(event) =>
            editor.setGeneralInstructions(event.target.value)
          }
          rows={6}
          placeholder="Notes globales / timing / organisation…"
          className={`mt-4 ${textareaCls}`}
        />

        {isDesktop ? (
          <div className="mt-6 flex justify-end">
            <button
              onClick={editor.handleSave}
              disabled={editor.saving}
              className={ui.btnPrimary}
              type="button"
            >
              <Save className="w-4 h-4" />
              {editor.saving
                ? "Enregistrement…"
                : "Enregistrer"}
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
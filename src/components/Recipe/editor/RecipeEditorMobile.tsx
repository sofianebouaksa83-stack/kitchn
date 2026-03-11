import React from "react";
import { ui } from "../../../styles/ui";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRecipeEditor, UNITS, CATEGORIES } from "./hooks/useRecipeEditor";

type Props = {
  recipeId?: string | null;
  onBack?: () => void;
  onSave?: () => void;
  onCreated?: (id: string) => void;
};

const labelCls = "block text-[12px] font-medium text-slate-200/90 mb-2";
const hintCls = "text-xs text-slate-300/60";

const inputBase =
  "w-full bg-white/[0.045] border border-white/10 text-slate-100 outline-none " +
  "placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20";

const inputTitleCls = `${inputBase} h-11 rounded-2xl px-4 text-sm`;
const inputCls = `${inputBase} h-10 rounded-xl px-3 text-sm`;
const inputNumCls = `${inputBase} h-9 rounded-xl px-2 text-sm`;
const selectCls = `${inputBase} h-9 rounded-xl px-2 text-sm`;

const textareaCls =
  "w-full rounded-2xl bg-white/[0.045] border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none " +
  "placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20 resize-none";

const sectionTitleCls =
  "text-[11px] uppercase tracking-wider text-slate-200/70 font-semibold";

const dividerCls = "border-b border-white/10";

export function RecipeEditorMobile({
  recipeId,
  onBack,
  onSave,
  onCreated,
}: Props) {
  const editor = useRecipeEditor({ recipeId, onSave, onCreated });

  const headerTitle = editor.isEdit
    ? editor.title.trim() || "Modifier la recette"
    : "Nouvelle recette";

  if (editor.loading) {
    return (
      <div className={`${ui.dashboardBg} overflow-x-hidden`}>
        <div className="px-4 py-10">
          <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
            <div className="ml-3 text-slate-200">Chargement…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${ui.dashboardBg} overflow-x-hidden`}>
      <div className="px-4 pt-3 pb-32">
        {/* Top */}
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => onBack?.()}
            className={ui.btnGhost}
            type="button"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="min-w-0 flex-1">
            <div className="text-[17px] leading-tight font-semibold text-slate-100 truncate">
              {headerTitle}
            </div>
            <div className="mt-1 text-xs text-slate-300/70">
              Remplis les infos puis enregistre
            </div>
          </div>

          <div className="w-10" />
        </div>

        {editor.errorMsg && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {editor.errorMsg}
          </div>
        )}

        {/* ===== INFOS (sans carte) ===== */}
        <div className={`mt-7 pb-7 ${dividerCls}`}>
          <div className={sectionTitleCls}>Informations</div>
          <div className={`mt-3 ${hintCls}`}>
            Titre, couverts et catégorie
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className={labelCls}>Titre de la recette *</label>
              <input
                value={editor.title}
                onChange={(e) => editor.setTitle(e.target.value)}
                placeholder="Ex: Foie gras, coing et lie de vin"
                className={inputTitleCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
       
              <div>
                <label className={labelCls}>Catégorie</label>
                <select
                  value={editor.category}
                  onChange={(e) => editor.setCategory(e.target.value)}
                  className={`${inputBase} h-11 rounded-2xl px-3 text-sm`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1020]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SECTIONS (sans carte) ===== */}
        <div className={`mt-7 pb-7 ${dividerCls}`}>
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

          <div className="mt-4 space-y-5">
            {editor.sections.map((s, idx) => {
              const ingList = editor.sectionIngredients[s.localId] ?? [];
              const isOnlySection = editor.sections.length === 1;

              return (
                <div key={s.localId} className="pt-1">
                  {/* Header ligne */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-200 font-semibold text-sm">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        value={s.title}
                        onChange={(e) =>
                          editor.setSections((prev) =>
                            prev.map((x) =>
                              x.localId === s.localId
                                ? { ...x, title: e.target.value }
                                : x
                            )
                          )
                        }
                        placeholder="Nom de la section"
                        className={inputCls}
                      />
                    </div>

                    <button
                      onClick={() => editor.toggleCollapse(s.localId)}
                      className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200 inline-flex items-center justify-center"
                      type="button"
                      title={s.collapsed ? "Déplier" : "Replier"}
                    >
                      {s.collapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => editor.removeSection(s.localId)}
                      disabled={isOnlySection}
                      className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
                      type="button"
                      title="Supprimer la section"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {!s.collapsed && (
                    <div className="mt-4 space-y-5">
                      {/* Ingrédients */}
                      <div>
                        <div className="text-[12px] text-slate-200 font-medium mb-3">
                          Ingrédients
                        </div>

                        <div className="space-y-2">
                          {ingList.map((ing, ingIdx) => {
                            const isOnlyIng = ingList.length === 1;
                            return (
                              <div
                                key={ing.localId}
                                className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-2"
                              >
                                <div className="grid grid-cols-[78px_90px_1fr_36px] gap-2 items-center">
                                  <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    value={ing.quantity}
                                    onChange={(e) =>
                                      editor.updateIngredient(
                                        s.localId,
                                        ingIdx,
                                        "quantity",
                                        e.target.value
                                      )
                                    }
                                    className={inputNumCls}
                                    placeholder="Qté"
                                  />

                                  <select
                                    value={ing.unit}
                                    onChange={(e) =>
                                      editor.updateIngredient(
                                        s.localId,
                                        ingIdx,
                                        "unit",
                                        e.target.value
                                      )
                                    }
                                    className={selectCls}
                                  >
                                    {UNITS.map((u) => (
                                      <option
                                        key={u}
                                        value={u}
                                        className="bg-[#0B1020]"
                                      >
                                        {u}
                                      </option>
                                    ))}
                                  </select>

                                  <div className="text-[11px] text-slate-300/30 truncate px-1" />

                                  <button
                                    onClick={() =>
                                      editor.removeIngredient(s.localId, ingIdx)
                                    }
                                    disabled={isOnlyIng}
                                    className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
                                    type="button"
                                    title="Supprimer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="mt-2">
                                  <input
                                    value={ing.designation}
                                    onChange={(e) =>
                                      editor.updateIngredient(
                                        s.localId,
                                        ingIdx,
                                        "designation",
                                        e.target.value
                                      )
                                    }
                                    className={`${inputBase} w-full h-10 rounded-xl px-3 text-sm`}
                                    placeholder="Nom de l’ingrédient"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => editor.addIngredient(s.localId)}
                          className="mt-3 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 text-sm font-medium"
                          type="button"
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter un ingrédient
                        </button>
                      </div>

                      {/* Instructions */}
                      <div>
                        <div className="text-[12px] text-slate-200 font-medium mb-2">
                          Instructions
                        </div>
                        <textarea
                          value={s.instructions}
                          onChange={(e) =>
                            editor.setSections((prev) =>
                              prev.map((x) =>
                                x.localId === s.localId
                                  ? { ...x, instructions: e.target.value }
                                  : x
                              )
                            )
                          }
                          rows={5}
                          placeholder="Étapes / cuisson / dressage…"
                          className={textareaCls}
                        />
                      </div>

                      {/* micro séparateur entre sections */}
                      <div className="pt-1 border-b border-white/10" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== INSTRUCTIONS GÉNÉRALES (sans carte) ===== */}
        <div className="mt-7">
          <div className={sectionTitleCls}>Instructions générales</div>
          <div className={`mt-1 ${hintCls}`}>(optionnel)</div>

          <textarea
            value={editor.generalInstructions}
            onChange={(e) => editor.setGeneralInstructions(e.target.value)}
            rows={6}
            placeholder="Notes globales / timing / organisation…"
            className={`mt-4 ${textareaCls}`}
          />
        </div>
      </div>

      {/* Sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="rounded-[24px] bg-[#0B1020]/92 backdrop-blur ring-1 ring-white/10 shadow-[0_-18px_60px_rgba(0,0,0,0.40)] p-3 flex items-center gap-2">
          <button
            onClick={() => onBack?.()}
            className={`${ui.btnGhost} flex-1 h-11 justify-center`}
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={`${ui.btnPrimary} flex-1 h-11 justify-center`}
            type="button"
          >
            <Save className="w-4 h-4" />
            {editor.saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
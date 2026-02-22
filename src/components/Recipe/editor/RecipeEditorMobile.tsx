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

export function RecipeEditorMobile({ recipeId, onBack, onSave, onCreated }: Props) {
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
          <button onClick={onBack} className={ui.btnGhost} type="button">
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

        {/* Infos recette */}
        <div className="mt-7 rounded-[26px] bg-white/[0.055] ring-1 ring-white/10 p-5">
          <div className="space-y-4">
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
                <label className={labelCls}>Couverts</label>
                <input
                  type="number"
                  min={1}
                  value={editor.servings}
                  onChange={(e) =>
                    editor.setServings(Math.max(1, Number(e.target.value || 1)))
                  }
                  className={inputTitleCls}
                />
              </div>

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

        {/* ===== Sections (UNE SEULE CARTE) ===== */}
        <div className="mt-8 rounded-[26px] bg-white/[0.055] ring-1 ring-white/10 overflow-hidden">
          {/* Header Sections */}
          <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-slate-100 font-semibold">Sections</div>
              <div className="text-xs text-slate-300/60 mt-0.5">
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

          {/* Liste sections : PAS DE CARTE PAR SECTION */}
          <div className="border-t border-white/10">
            {editor.sections.map((s, idx) => {
              const ingList = editor.sectionIngredients[s.localId] ?? [];
              const isOnlySection = editor.sections.length === 1;

              return (
                <div key={s.localId} className="border-b border-white/10 last:border-b-0">
                  {/* Section Row header */}
                  <div className="px-5 py-4 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-slate-200 font-semibold text-sm">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <input
                        value={s.title}
                        onChange={(e) =>
                          editor.setSections((prev) =>
                            prev.map((x) =>
                              x.localId === s.localId ? { ...x, title: e.target.value } : x
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

                  {/* Section content */}
                  {!s.collapsed && (
                    <div className="px-5 pb-5">
                      {/* Ingrédients */}
                      <div className="mt-1">
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
                                {/* Ligne A : Qté + unité + X */}
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
                                      <option key={u} value={u} className="bg-[#0B1020]">
                                        {u}
                                      </option>
                                    ))}
                                  </select>

                                  <div className="text-[11px] text-slate-300/30 truncate px-1">
                                    {/* vide volontaire (layout stable) */}
                                  </div>

                                  <button
                                    onClick={() => editor.removeIngredient(s.localId, ingIdx)}
                                    disabled={isOnlyIng}
                                    className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
                                    type="button"
                                    title="Supprimer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                {/* Ligne B : nom full width */}
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
                                    className="w-full h-10 rounded-xl bg-white/[0.045] border border-white/10 px-3 text-sm text-slate-100 outline-none
                                               placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20"
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
                      <div className="mt-5">
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions générales */}
        <div className="mt-8 rounded-[26px] bg-white/[0.055] ring-1 ring-white/10 p-5">
          <div className="text-slate-100 font-semibold">
            Instructions générales{" "}
            <span className="text-slate-300/60 font-normal">(optionnel)</span>
          </div>
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
            onClick={onBack}
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
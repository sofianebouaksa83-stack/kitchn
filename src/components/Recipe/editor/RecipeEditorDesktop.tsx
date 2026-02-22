import React from "react";
import { PageShell } from "../../Layout/PageShell";
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
  Tag,
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

const inputCls = `${inputBase} h-10 rounded-xl px-3 text-sm`;
const inputNumCls = `${inputBase} h-10 rounded-xl px-3 text-sm`;
const selectCls = `${inputBase} h-10 rounded-xl px-2 text-sm`;

const textareaCls =
  "w-full rounded-2xl bg-white/[0.045] border border-white/10 px-4 py-3 text-sm text-slate-100 outline-none " +
  "placeholder:text-slate-400/50 focus:border-amber-300/30 focus:ring-2 focus:ring-amber-300/20 resize-none";

export function RecipeEditorDesktop({ recipeId, onBack, onSave, onCreated }: Props) {
  const editor = useRecipeEditor({ recipeId, onSave, onCreated });

  const title = editor.isEdit
    ? editor.title?.trim() || "Modifier la recette"
    : "Nouvelle recette";

  return (
    <PageShell
      title={title}
      subtitle="Éditeur"
      icon={<Tag className="w-5 h-5 text-amber-200" />}
      actions={
        <div className="flex items-center gap-2">
          <button onClick={onBack} className={ui.btnGhost} type="button">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <button
            onClick={editor.handleSave}
            disabled={editor.saving}
            className={ui.btnPrimary}
            type="button"
          >
            <Save className="w-4 h-4" />
            {editor.saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      }
    >
      {editor.loading ? (
        <div className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 p-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
          <div className="ml-3 text-slate-200">Chargement…</div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-5xl">
          {editor.errorMsg && (
            <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {editor.errorMsg}
            </div>
          )}

          <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 p-6 space-y-8">
            {/* Infos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Titre de la recette *</label>
                <input
                  value={editor.title}
                  onChange={(e) => editor.setTitle(e.target.value)}
                  placeholder="Ex: Langoustine, bisque, pickles…"
                  className={`${inputBase} h-11 rounded-2xl px-4`}
                />
              </div>

              <div>
                <label className={labelCls}>Couverts</label>
                <input
                  type="number"
                  min={1}
                  value={editor.servings}
                  onChange={(e) =>
                    editor.setServings(Math.max(1, Number(e.target.value || 1)))
                  }
                  className={`${inputBase} h-11 rounded-2xl px-4`}
                />
              </div>

              <div>
                <label className={labelCls}>Catégorie</label>
                <select
                  value={editor.category}
                  onChange={(e) => editor.setCategory(e.target.value)}
                  className={`${inputBase} h-11 rounded-2xl px-3`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0B1020]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sections */}
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
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
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>

              <div className="border-t border-white/10">
                {editor.sections.map((s, idx) => {
                  const ingList = editor.sectionIngredients[s.localId] ?? [];
                  const isOnlySection = editor.sections.length === 1;

                  return (
                    <div key={s.localId} className="border-b border-white/10 last:border-b-0">
                      {/* Header */}
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

                      {!s.collapsed && (
                        <div className="px-5 pb-5">
                          {/* Ingredients grid */}
                          <div className="mt-2">
                            <div className="text-[12px] text-slate-200 font-medium mb-3">
                              Ingrédients
                            </div>

                            <div className="space-y-2">
                              {ingList.map((ing, ingIdx) => {
                                const isOnlyIng = ingList.length === 1;

                                return (
                                  <div
                                    key={ing.localId}
                                    className="grid grid-cols-[86px_96px_1fr_40px] gap-2 items-center rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-2"
                                  >
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
                                      className={`${inputCls} min-w-0`}
                                      placeholder="Ingrédient"
                                    />

                                    <button
                                      onClick={() => editor.removeIngredient(s.localId, ingIdx)}
                                      disabled={isOnlyIng}
                                      className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200/90 inline-flex items-center justify-center disabled:opacity-40"
                                      type="button"
                                      title="Supprimer"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
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
            <div className="rounded-3xl bg-white/[0.03] ring-1 ring-white/10 p-5">
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

            <div className="pt-2 flex justify-end">
              <button
                onClick={editor.handleSave}
                disabled={editor.saving}
                className={ui.btnPrimary}
                type="button"
              >
                <Save className="w-4 h-4" />
                {editor.saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
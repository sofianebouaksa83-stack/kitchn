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
      {/* ✅ plein écran mobile (pas de grosse carte) */}
      <div className="px-4 pt-3 pb-28">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <button onClick={onBack} className={ui.btnGhost} type="button">
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>

          <div className="min-w-0">
            <div className="text-lg font-semibold text-slate-100 truncate">
              {headerTitle}
            </div>
            <div className="mt-1 text-sm text-slate-300/70">
              Remplis les infos puis enregistre
            </div>
          </div>

          <div className="w-10" />
        </div>

        {/* Error */}
        {editor.errorMsg && (
          <div className="mt-5">
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {editor.errorMsg}
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="mt-8 space-y-10">
          {/* Recipe fields card */}
          <div className="rounded-[30px] bg-white/[0.05] ring-1 ring-white/10 p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-200 mb-2">
                  Titre de la recette *
                </label>
                <input
                  value={editor.title}
                  onChange={(e) => editor.setTitle(e.target.value)}
                  placeholder="Ex: Foie gras, coing et lie de vin"
                  className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-200 mb-2">
                    Couverts
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editor.servings}
                    onChange={(e) =>
                      editor.setServings(Math.max(1, Number(e.target.value || 1)))
                    }
                    className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-200 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={editor.category}
                    onChange={(e) => editor.setCategory(e.target.value)}
                    className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
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

          {/* Sections */}
          <div className="rounded-[30px] bg-white/[0.05] ring-1 ring-white/10 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-slate-100 font-semibold">
                Sections (sous-recettes)
              </div>
              <button onClick={editor.addSection} className={ui.btnGhost} type="button">
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {editor.sections.map((s, idx) => {
                const ingList = editor.sectionIngredients[s.localId] ?? [];
                return (
                  <div
                    key={s.localId}
                    className="rounded-[28px] bg-white/[0.04] ring-1 ring-white/10 overflow-hidden"
                  >
                    <div className="px-4 py-4 flex items-center justify-between gap-3 border-b border-white/10">
                      <div className="text-sm text-slate-300/80 flex items-center gap-3">
                        <span className="text-slate-200 font-semibold">
                          Section {idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editor.toggleCollapse(s.localId)}
                          className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-slate-200 inline-flex items-center justify-center"
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
                          className="h-10 w-10 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200 inline-flex items-center justify-center"
                          type="button"
                          title="Supprimer la section"
                          disabled={editor.sections.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!s.collapsed && (
                      <div className="p-4 space-y-5">
                        <div>
                          <label className="block text-sm text-slate-200 mb-2">
                            Nom de la section
                          </label>
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
                            placeholder="Nom de la section (ex: Foie gras)"
                            className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                          />
                        </div>

                        {/* Ingredients */}
                        <div>
                          <div className="text-sm text-slate-200 mb-3 font-medium">
                            Ingrédients
                          </div>

                          <div className="space-y-3">
                            {ingList.map((ing, ingIdx) => (
                              <div key={ing.localId} className="space-y-2">
                                <div className="flex gap-2">
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
                                    className="w-28 h-11 rounded-2xl bg-white/5 border border-white/10 px-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
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
                                    className="w-32 h-11 rounded-2xl bg-white/5 border border-white/10 px-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                                  >
                                    {UNITS.map((u) => (
                                      <option key={u} value={u} className="bg-[#0B1020]">
                                        {u}
                                      </option>
                                    ))}
                                  </select>

                                  <button
                                    onClick={() => editor.removeIngredient(s.localId, ingIdx)}
                                    className="h-11 w-11 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 text-red-200 inline-flex items-center justify-center"
                                    type="button"
                                    title="Supprimer"
                                    disabled={ingList.length === 1}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

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
                                  className="w-full h-11 rounded-2xl bg-white/5 border border-white/10 px-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                                  placeholder="Nom de l'ingrédient"
                                />
                              </div>
                            ))}
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

                        {/* Section instructions */}
                        <div>
                          <div className="text-sm text-slate-200 mb-2 font-medium">
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
                            placeholder="Instructions pour cette section..."
                            className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* General instructions */}
          <div className="rounded-[30px] bg-white/[0.05] ring-1 ring-white/10 p-6">
            <div className="text-slate-100 font-semibold">
              Instructions générales (optionnel)
            </div>
            <textarea
              value={editor.generalInstructions}
              onChange={(e) => editor.setGeneralInstructions(e.target.value)}
              rows={6}
              placeholder="Instructions générales pour la recette complète..."
              className="mt-4 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-amber-300/40 resize-none"
            />
          </div>
        </div>
      </div>

      {/* ✅ sticky bar mobile */}
      <div className="fixed inset-x-0 bottom-0 z-[90] px-4 pb-4">
        <div className="rounded-[26px] bg-[#0B1020]/95 backdrop-blur ring-1 ring-white/10 shadow-[0_-18px_60px_rgba(0,0,0,0.45)] p-3 flex items-center gap-2">
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

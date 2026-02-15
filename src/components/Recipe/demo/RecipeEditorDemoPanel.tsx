import React from "react";

export function RecipeEditorDemoPanel({ onBack }: { onBack?: () => void }) {
  return (
    <div className="h-full w-full p-4 sm:p-5">
      {/* Top bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="mb-3">
          <button
            type="button"
            onClick= {onBack}
            className="relative z-30 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs text-slate-100 hover:bg-white/15 transition"
          >
            ← Retour
          </button>
        </div>
        <div className="text-sm font-semibold text-slate-100">Nouvelle recette</div>
        <div className="px-3 py-1.5 rounded-xl bg-amber-400/90 text-slate-950 text-xs font-semibold">
          Enregistrer
        </div>
      </div>

      {/* Form */}
      <div className="pt-4 space-y-4">
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Titre</div>
          <div className="h-10 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center text-slate-300/70">
            Ex: Foie gras, coing et lie de vin
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="text-xs text-slate-400">Couverts</div>
            <div className="h-10 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center text-slate-300/70">
              4
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-slate-400">Catégorie</div>
            <div className="h-10 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center justify-between text-slate-300/70">
              <span>Entrée</span>
              <span className="text-slate-500">▾</span>
            </div>
          </div>
        </div>

        {/* Section card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
            <div className="text-xs font-semibold text-slate-200">SECTION 1</div>
            <div className="text-xs text-amber-300/90 font-semibold">+ Ajouter une section</div>
          </div>

          <div className="p-4 space-y-4">
            <div className="h-10 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center text-slate-300/70">
              Nom de la section (ex: Foie gras)
            </div>

            {/* Ingredients */}
            <div>
              <div className="text-xs text-slate-300 font-semibold mb-2">Ingrédients</div>
              <div className="space-y-2">
                {[
                  "100 g • Foie gras",
                  "20 g • Coing confit",
                  "QS • Sel fin",
                ].map((line) => (
                  <div
                    key={line}
                    className="h-10 rounded-2xl bg-white/5 border border-white/10 px-4 flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-200/90">{line}</span>
                    <span className="text-slate-500">✕</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-xs text-amber-300/90 font-semibold">
                + Ajouter un ingrédient
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="text-xs text-slate-300 font-semibold mb-2">Instructions</div>
              <div className="h-28 rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-300/70 text-sm">
                Instructions pour cette section…
              </div>
            </div>
          </div>
        </div>

        {/* General instructions */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400">Instructions générales (optionnel)</div>
          <div className="h-24 rounded-2xl bg-white/5 border border-white/10 p-4 text-slate-300/70 text-sm">
            Instructions générales pour la recette complète…
          </div>
        </div>
      </div>
    </div>
  );
}

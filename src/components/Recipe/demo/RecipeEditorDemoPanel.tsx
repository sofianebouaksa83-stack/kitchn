import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { ui } from "../../../styles/ui";

export function RecipeEditorDemoPanel({ onBack }: { onBack?: () => void }) {
  return (
    <div className="h-full w-full rounded-[28px] bg-[#0E1736]/95 ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-4 sm:p-5 lg:p-6 overflow-hidden">
      <div className="flex flex-col h-full">

        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <button
            type="button"
            onClick={onBack}
            className={ui.btnGhost}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="text-sm font-semibold text-slate-100">
            Nouvelle recette
          </div>

          <button className={ui.btnPrimary}>
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>

        {/* CONTENT */}
        <div className="pt-5 space-y-6 overflow-y-auto">

          {/* TITRE */}
          <div>
            <div className="text-xs text-slate-400 mb-2">Titre</div>
            <div className="h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 flex items-center text-slate-300">
              Foie gras
            </div>
          </div>

          {/* META */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <div className="text-xs text-slate-400 mb-2">Couverts</div>
              <div className="h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 flex items-center text-slate-300">
                4
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-2">Catégorie</div>
              <div className="h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 flex items-center justify-between text-slate-300">
                Entrée
                <span className="text-slate-500">▾</span>
              </div>
            </div>

          </div>

          {/* SECTION */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">

            {/* section header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10">
              <div className="text-xs font-semibold text-slate-200">
                SECTION 1
              </div>

              <div className="text-xs text-amber-300 font-semibold">
                + Ajouter une section
              </div>
            </div>

            <div className="p-4 space-y-5">

              {/* section title */}
              <div className="h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 flex items-center text-slate-300">
                Foie gras
              </div>

              {/* INGREDIENTS */}
              <div>
                <div className="text-xs font-semibold text-slate-200 mb-3">
                  Ingrédients
                </div>

                <div className="space-y-2">

                  {[
                    "100 g • Foie gras",
                    "20 g • Coing confit",
                    "QS • Sel fin",
                  ].map((line) => (
                    <div
                      key={line}
                      className="h-11 rounded-2xl bg-white/[0.05] border border-white/10 px-4 flex items-center justify-between"
                    >
                      <span className="text-sm text-slate-200">
                        {line}
                      </span>

                      <span className="text-slate-500">✕</span>
                    </div>
                  ))}

                </div>

                <div className="mt-3 text-xs text-amber-300 font-semibold">
                  + Ajouter un ingrédient
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div>
                <div className="text-xs font-semibold text-slate-200 mb-3">
                  Instructions
                </div>

                <div className="h-32 rounded-2xl bg-white/[0.05] border border-white/10 p-4 text-sm text-slate-300/70">
                  Saisir le foie gras à la poêle très chaude.
                  Déglacer avec la lie de vin.
                  Ajouter le coing confit et rectifier l'assaisonnement.
                </div>
              </div>

            </div>
          </div>

          {/* GENERAL INSTRUCTIONS */}
          <div>
            <div className="text-xs text-slate-400 mb-2">
              Instructions générales (optionnel)
            </div>

            <div className="h-24 rounded-2xl bg-white/[0.05] border border-white/10 p-4 text-sm text-slate-300/70">
              Dressage minute. Ajouter quelques pickles pour l'acidité.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
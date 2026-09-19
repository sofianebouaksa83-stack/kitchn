import React, { useState } from "react";
import { ui } from "../../styles/ui";
import { WorkGroupsDemo } from "../Groups/demo/WorkGroupsDemo";
import { RecipeImportAIDemo } from "../Import/demo/RecipeImportAIDemo";

type TabKey = "groups" | "import";

export function LandingShowcase() {
  const [tab, setTab] = useState<TabKey>("groups");

  return (
    <section className="mt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="text-slate-100 font-semibold text-lg">Aperçu produit</div>
            <div className="text-slate-400 text-sm">Même UI que l’app • démo sans Supabase</div>
          </div>

          <div className="inline-flex rounded-2xl bg-white/5 ring-1 ring-white/10 p-1">
            <button
              type="button"
              onClick={() => setTab("groups")}
              className={[
                "px-4 py-2 rounded-xl text-sm font-medium transition",
                tab === "groups" ? "bg-white/10 text-slate-100" : "text-slate-300 hover:bg-white/5",
              ].join(" ")}
            >
              Groupes
            </button>
            <button
              type="button"
              onClick={() => setTab("import")}
              className={[
                "px-4 py-2 rounded-xl text-sm font-medium transition",
                tab === "import" ? "bg-white/10 text-slate-100" : "text-slate-300 hover:bg-white/5",
              ].join(" ")}
            >
              Import
            </button>
          </div>
        </div>

        <div className={`${ui.cardSoft} p-0 overflow-hidden`}>
          {tab === "groups" ? <WorkGroupsDemo /> : <RecipeImportAIDemo />}
        </div>
      </div>
    </section>
  );
}

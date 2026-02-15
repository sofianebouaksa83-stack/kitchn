import React, { useMemo } from "react";
import { Users } from "lucide-react";
import { ui } from "../../../styles/ui";

type DemoGroup = {
  id: string;
  name: string;
  members_count: number;
  is_owner?: boolean;
};

export function WorkGroupsDemoPanel() {
  const groups = useMemo<DemoGroup[]>(
    () => [
      { id: "g1", name: "JDB", members_count: 3, is_owner: true },
      { id: "g2", name: "BISTRO", members_count: 4, is_owner: true },
      { id: "g3", name: "chef", members_count: 3, is_owner: true },
    ],
    []
  );

  return (
    <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-5 sm:p-7">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-slate-100 flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <Users className="w-5 h-5 text-amber-200" />
            </span>
            Groupes de travail
          </h1>
          <p className="text-sm text-slate-300/70 mt-2">
            Collaborez avec votre équipe (partage de recettes par groupe).
          </p>
          <p className="text-xs text-slate-400 mt-1">Aperçu démo • actions désactivées</p>
        </div>

        <button
          type="button"
          disabled
          className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl opacity-60 cursor-not-allowed`}
          title="Désactivé en démo"
        >
          + Créer un groupe
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g) => (
          <div
            key={g.id}
            className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 border border-white/10 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-md p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-slate-100 font-semibold truncate">{g.name}</div>
                <div className="mt-2 text-sm text-slate-300/80 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-300/70" />
                  {g.members_count} membres
                </div>
              </div>

              {g.is_owner ? (
                <span className="text-[11px] px-3 py-1 rounded-xl border border-amber-400/25 bg-amber-500/10 text-amber-200">
                  Propriétaire
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled
                className={`${ui.btnGhost} px-4 py-2 rounded-2xl opacity-60 cursor-not-allowed`}
                title="Désactivé en démo"
              >
                Gérer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

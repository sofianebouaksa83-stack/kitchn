import {
  Plus,
  Users,
  X,
} from "lucide-react";

import { KitchNLoader } from "../../../components/Loading/KitchNLoader";
import { ui } from "../../../styles/ui";

import type { Group } from "../types/team.types";
import { cn } from "../utils/teamHelpers";

type TeamHeaderProps = {
  groups: Group[];
  loadingGroups: boolean;

  activeGroupId: string;
  onActiveGroupChange: (value: string) => void;

  loadingPlan: boolean;
  isPremium: boolean;
  remainingSlots: number;

  loading: boolean;
  membersCount: number;
  invitationsCount: number;
  activeGroupName?: string;

  canAccess: boolean;
  isOwner: boolean;
  isSecond: boolean;

  showInviteForm: boolean;
  onToggleInviteForm: () => void;
};

export function TeamHeader({
  groups,
  loadingGroups,
  activeGroupId,
  onActiveGroupChange,
  loadingPlan,
  isPremium,
  remainingSlots,
  loading,
  membersCount,
  invitationsCount,
  activeGroupName,
  canAccess,
  isOwner,
  isSecond,
  showInviteForm,
  onToggleInviteForm,
}: TeamHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
          <Users className="w-5 h-5 text-amber-200" />
        </div>

        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
            Équipe
          </h1>

          <p className="text-sm text-slate-300/70 mt-1">
            Gestion des membres, invitations et rôles
            (par groupe)
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-400">
              Groupe :
            </div>

            {loadingGroups ? (
              <div className="inline-flex items-center gap-2 text-xs text-slate-300/70">
                <KitchNLoader className="kitchn-loader--mini" />
                Chargement…
              </div>
            ) : groups.length === 0 ? (
              <div className="text-xs text-red-200">
                Aucun groupe. Crée un groupe pour inviter
                ton équipe.
              </div>
            ) : (
              <div className="relative">
                <select
                  value={activeGroupId}
                  onChange={(event) =>
                    onActiveGroupChange(
                      event.target.value
                    )
                  }
                  className={cn(
                    ui.input,
                    "pr-10 py-2 text-sm"
                  )}
                >
                  {groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {groups.length > 0 && (
              <div className="text-xs text-slate-400">
                {loadingPlan ? (
                  <span className="inline-flex items-center gap-2 text-slate-300/70">
                    <KitchNLoader className="kitchn-loader--mini" />
                    Vérification de l’abonnement…
                  </span>
                ) : isPremium ? (
                  <span className="text-emerald-300">
                    Premium — membres illimités
                  </span>
                ) : (
                  <span>
                    Free — {remainingSlots} place
                    {remainingSlots > 1 ? "s" : ""}{" "}
                    restante
                    {remainingSlots > 1 ? "s" : ""}{" "}
                    (max 10)
                  </span>
                )}
              </div>
            )}
          </div>

          {groups.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {loading
                ? "Chargement…"
                : `${membersCount} membre${
                    membersCount > 1 ? "s" : ""
                  } — ${invitationsCount} invitation${
                    invitationsCount > 1 ? "s" : ""
                  } en attente`}

              {activeGroupName
                ? ` — ${activeGroupName}`
                : ""}

              {canAccess && (
                <span className="ml-2 text-emerald-300/90">
                  (Gestion :{" "}
                  {isOwner
                    ? "Chef"
                    : isSecond
                      ? "Second"
                      : "—"}
                  )
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {groups.length > 0 && canAccess && (
        <button
          type="button"
          onClick={onToggleInviteForm}
          className={`${ui.btnPrimary} px-5 py-2.5 rounded-2xl`}
        >
          {showInviteForm ? (
            <X className="w-5 h-5" />
          ) : (
            <Plus className="w-5 h-5" />
          )}

          {showInviteForm ? "Annuler" : "Inviter"}
        </button>
      )}
    </div>
  );
}
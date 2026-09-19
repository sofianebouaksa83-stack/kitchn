import {
  Crown,
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

  onActiveGroupChange: (
    value: string,
  ) => void;

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
  onToggleInviteForm:
    () => void;
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
    <div
      className="
        rounded-[30px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-5
        shadow-[0_10px_30px_rgba(23,62,49,0.045)]
        sm:p-6
      "
    >
      <div
        className="
          flex flex-col
          gap-5
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div
              className="
                grid h-11 w-11
                shrink-0
                place-items-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
                ring-1
                ring-[#173E31]/8
              "
            >
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-[#A8833E]
                "
              >
                Organisation
              </p>

              <h1
                className="
                  mt-1
                  font-serif
                  text-3xl
                  font-semibold
                  text-[#173E31]
                "
              >
                Équipe
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  leading-relaxed
                  text-[#718078]
                "
              >
                Gère les membres,
                invitations et rôles
                de chaque groupe.
              </p>
            </div>
          </div>

          {/* GROUPE */}
          <div
            className="
              mt-5
              flex flex-col
              gap-3
              sm:flex-row
              sm:flex-wrap
              sm:items-center
            "
          >
            <div
              className="
                text-xs
                font-semibold
                text-[#617168]
              "
            >
              Groupe
            </div>

            {loadingGroups ? (
              <div
                className="
                  inline-flex
                  items-center gap-2
                  text-xs
                  text-[#718078]
                "
              >
                <KitchNLoader className="kitchn-loader--mini" />
                Chargement…
              </div>
            ) : groups.length ===
              0 ? (
              <div
                className="
                  rounded-full
                  bg-[#F8EAE7]
                  px-3 py-1.5
                  text-xs
                  font-medium
                  text-[#A54C48]
                "
              >
                Aucun groupe
              </div>
            ) : (
              <select
                value={
                  activeGroupId
                }
                onChange={(
                  event,
                ) =>
                  onActiveGroupChange(
                    event.target
                      .value,
                  )
                }
                className={cn(
                  ui.input,
                  "h-10 min-w-[190px] py-2 pr-10 text-sm",
                )}
              >
                {groups.map(
                  (group) => (
                    <option
                      key={
                        group.id
                      }
                      value={
                        group.id
                      }
                    >
                      {
                        group.name
                      }
                    </option>
                  ),
                )}
              </select>
            )}

            {groups.length >
              0 ? (
              <>
                {loadingPlan ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      text-[#718078]
                    "
                  >
                    <KitchNLoader className="kitchn-loader--mini" />
                    Vérification…
                  </span>
                ) : isPremium ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-[#E7EEE8]
                      px-3 py-1.5
                      text-xs
                      font-semibold
                      text-[#184C3A]
                    "
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Premium · illimité
                  </span>
                ) : (
                  <span
                    className="
                      rounded-full
                      bg-[#F0F2EC]
                      px-3 py-1.5
                      text-xs
                      font-medium
                      text-[#617168]
                    "
                  >
                    Free ·{" "}
                    {remainingSlots}{" "}
                    place
                    {remainingSlots !==
                    1
                      ? "s"
                      : ""}{" "}
                    restante
                    {remainingSlots !==
                    1
                      ? "s"
                      : ""}
                  </span>
                )}
              </>
            ) : null}
          </div>

          {groups.length >
            0 ? (
            <div
              className="
                mt-3
                flex flex-wrap
                items-center
                gap-2
                text-xs
                text-[#718078]
              "
            >
              <span>
                {loading
                  ? "Chargement…"
                  : `${membersCount} membre${
                      membersCount !==
                      1
                        ? "s"
                        : ""
                    }`}
              </span>

              <span>•</span>

              <span>
                {
                  invitationsCount
                }{" "}
                invitation
                {invitationsCount !==
                1
                  ? "s"
                  : ""}{" "}
                en attente
              </span>

              {activeGroupName ? (
                <>
                  <span>•</span>

                  <span
                    className="
                      font-medium
                      text-[#29493E]
                    "
                  >
                    {
                      activeGroupName
                    }
                  </span>
                </>
              ) : null}

              {canAccess ? (
                <span
                  className="
                    rounded-full
                    bg-[#E7EEE8]
                    px-2.5 py-1
                    font-semibold
                    text-[#184C3A]
                  "
                >
                  Gestion :{" "}
                  {isOwner
                    ? "Chef"
                    : isSecond
                      ? "Second"
                      : "—"}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* ACTION */}
        {groups.length >
          0 &&
        canAccess ? (
          <button
            type="button"
            onClick={
              onToggleInviteForm
            }
            className={
              showInviteForm
                ? `${ui.btnGhost} shrink-0`
                : `${ui.btnPrimary} shrink-0`
            }
          >
            {showInviteForm ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {showInviteForm
              ? "Annuler"
              : "Inviter"}
          </button>
        ) : null}
      </div>

      {groups.length ===
        0 &&
      !loadingGroups ? (
        <div
          className="
            mt-5
            rounded-2xl
            bg-[#F7F5EF]
            px-4 py-3
            text-sm
            text-[#718078]
          "
        >
          Crée d’abord un groupe
          depuis l’onglet{" "}
          <strong className="text-[#173E31]">
            Groupes
          </strong>{" "}
          pour pouvoir inviter ton
          équipe.
        </div>
      ) : null}
    </div>
  );
}
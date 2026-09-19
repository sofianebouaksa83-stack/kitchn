import {
  ArrowRight,
  Check,
  Crown,
  Pencil,
  Users,
  X,
} from "lucide-react";

import { ui } from "../../../styles/ui";
import type { GroupWithMembers } from "../types/groups.types";

export function GroupsGrid(
  props: {
    groups: GroupWithMembers[];
    canManageGroups: boolean;

    editingId: string | null;
    editName: string;

    setEditName: (
      value: string,
    ) => void;

    manageLoading: boolean;

    onStartRename: (
      groupId: string,
      name: string,
    ) => void;

    onCancelRename:
      () => void;

    onConfirmRename: (
      groupId: string,
      name: string,
    ) => Promise<void>;

    onOpenManage: (
      group: GroupWithMembers,
    ) => Promise<void>;

    onRequestCreate:
      () => void;
  },
) {
  const {
    groups,
    canManageGroups,

    editingId,
    editName,
    setEditName,
    manageLoading,

    onStartRename,
    onCancelRename,
    onConfirmRename,

    onOpenManage,
    onRequestCreate,
  } = props;

  if (groups.length === 0) {
    return (
      <div
        className="
          rounded-[30px]
          border border-[#173E31]/10
          bg-[#FBFAF6]
          px-6 py-14
          text-center
          shadow-[0_10px_30px_rgba(23,62,49,0.04)]
        "
      >
        <div
          className="
            mx-auto
            grid h-14 w-14
            place-items-center
            rounded-[20px]
            bg-[#E7EEE8]
            text-[#184C3A]
          "
        >
          <Users className="h-6 w-6" />
        </div>

        <p
          className="
            mt-5
            font-serif
            text-xl
            font-semibold
            text-[#173E31]
          "
        >
          Aucun groupe pour le moment
        </p>

        <p
          className="
            mx-auto mt-2
            max-w-md
            text-sm
            leading-relaxed
            text-[#718078]
          "
        >
          Crée un groupe pour commencer à
          collaborer et partager des recettes
          avec ton équipe.
        </p>

        {canManageGroups ? (
          <button
            onClick={
              onRequestCreate
            }
            className={`${ui.btnPrimary} mt-5`}
            type="button"
          >
            Créer votre premier groupe
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-1
        gap-4
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {groups.map(
        (group) => {
          const memberCount =
            group.members?.length ??
            0;

          return (
            <div
              key={group.id}
              className="
                group
                relative
                cursor-pointer
                overflow-hidden
                rounded-[28px]
                border border-[#173E31]/10
                bg-[#FBFAF6]
                text-left
                shadow-[0_10px_30px_rgba(23,62,49,0.045)]
                transition-all
                duration-200
                hover:-translate-y-1
                hover:border-[#173E31]/18
                hover:shadow-[0_16px_38px_rgba(23,62,49,0.08)]
                active:scale-[0.99]
              "
              onClick={() =>
                void onOpenManage(
                  group,
                )
              }
              role="button"
              tabIndex={0}
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                    "Enter" ||
                  event.key === " "
                ) {
                  void onOpenManage(
                    group,
                  );
                }
              }}
            >
              <div className="p-5 sm:p-6">
                {/* ICON + ACTION */}
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="
                      grid h-11 w-11
                      place-items-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                    "
                  >
                    <Users className="h-5 w-5" />
                  </div>

                  {canManageGroups &&
                  group.isOwner &&
                  editingId !==
                    group.id ? (
                    <button
                      className="
                        inline-flex
                        h-9 w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0F2EC]
                        text-[#718078]
                        transition
                        hover:bg-[#E7EEE8]
                        hover:text-[#184C3A]
                      "
                      title="Renommer"
                      type="button"
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        onStartRename(
                          group.id,
                          group.name ??
                            "",
                        );
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                {/* NAME */}
                {editingId ===
                group.id ? (
                  <div
                    className="
                      mt-5
                      flex items-center
                      gap-2
                    "
                    onClick={(
                      event,
                    ) =>
                      event.stopPropagation()
                    }
                  >
                    <input
                      value={
                        editName
                      }
                      onChange={(
                        event,
                      ) =>
                        setEditName(
                          event.target
                            .value,
                        )
                      }
                      className={`${ui.input} h-10 min-w-0 flex-1`}
                      autoFocus
                    />

                    <button
                      className="
                        inline-flex
                        h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#184C3A]
                        text-[#F7F3EA]
                        transition
                        hover:bg-[#123C2E]
                        disabled:opacity-50
                      "
                      disabled={
                        manageLoading
                      }
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        void onConfirmRename(
                          group.id,
                          editName,
                        );
                      }}
                      title="Enregistrer"
                      type="button"
                    >
                      <Check className="h-4 w-4" />
                    </button>

                    <button
                      className="
                        inline-flex
                        h-10 w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#F0F2EC]
                        text-[#718078]
                        transition
                        hover:bg-[#E7EEE8]
                      "
                      onClick={(
                        event,
                      ) => {
                        event.stopPropagation();

                        onCancelRename();
                      }}
                      title="Annuler"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <h3
                    className="
                      mt-5
                      truncate
                      font-serif
                      text-xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    {group.name}
                  </h3>
                )}

                {/* DESCRIPTION */}
                {group.description ? (
                  <p
                    className="
                      mt-2
                      line-clamp-2
                      min-h-[40px]
                      text-sm
                      leading-relaxed
                      text-[#718078]
                    "
                  >
                    {
                      group.description
                    }
                  </p>
                ) : (
                  <p
                    className="
                      mt-2
                      min-h-[40px]
                      text-sm
                      text-[#8B9791]
                    "
                  >
                    Groupe de recettes partagé
                  </p>
                )}

                {/* META */}
                <div
                  className="
                    mt-5
                    flex items-center
                    justify-between
                    gap-3
                    border-t
                    border-[#173E31]/8
                    pt-4
                  "
                >
                  <div
                    className="
                      inline-flex
                      items-center gap-2
                      text-sm
                      text-[#617168]
                    "
                  >
                    <Users className="h-4 w-4" />

                    {memberCount}{" "}
                    membre
                    {memberCount !== 1
                      ? "s"
                      : ""}
                  </div>

                  <div className="flex items-center gap-2">
                    {group.isOwner ? (
                      <span
                        className="
                          inline-flex
                          items-center gap-1.5
                          rounded-full
                          bg-[#C7A45D]/12
                          px-2.5 py-1
                          text-[11px]
                          font-semibold
                          text-[#8B6C32]
                        "
                      >
                        <Crown className="h-3.5 w-3.5" />
                        Propriétaire
                      </span>
                    ) : null}

                    <span
                      className="
                        grid h-8 w-8
                        place-items-center
                        rounded-full
                        bg-[#F0F2EC]
                        text-[#718078]
                        transition
                        group-hover:bg-[#E7EEE8]
                        group-hover:text-[#184C3A]
                      "
                    >
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}
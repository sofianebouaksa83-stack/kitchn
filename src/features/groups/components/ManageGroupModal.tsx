import {
  useEffect,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useDragControls,
} from "framer-motion";

import {
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";

import type { Profile } from "../../../lib/supabase";

import { ui } from "../../../styles/ui";

import { useGroupInvitation } from "../hooks/useGroupInvitation";

import type { GroupWithMembers } from "../types/groups.types";

import { GroupInvitationSection } from "./GroupInvitationSection";

type ManageGroupModalProps = {
  open: boolean;

  onClose: () => void;

  canManageGroups: boolean;

  manageLoading: boolean;

  selectedGroup:
    GroupWithMembers | null;

  userId: string | null;

  availableTeam: Profile[];

  selectedUserId: string;

  setSelectedUserId: (
    v: string,
  ) => void;

  onAddMember:
    () => Promise<void>;

  onRemoveMember: (
    id: string,
  ) => Promise<void>;

  onDeleteGroup: (
    groupId: string,
  ) => Promise<void>;

  onInvitationSent?:
    () =>
      | Promise<void>
      | void;

  isPremium: boolean;

  ent: {
    maxMembersPerGroup: number;
  };
};

export function ManageGroupModal(
  props: ManageGroupModalProps,
) {
  const {
    open,
    onClose,

    canManageGroups,
    manageLoading,

    selectedGroup,
    userId,

    availableTeam,

    selectedUserId,
    setSelectedUserId,

    onAddMember,
    onRemoveMember,
    onDeleteGroup,

    onInvitationSent,

    isPremium,
    ent,
  } = props;

  const dragControls =
    useDragControls();

  const [
    renderedGroup,
    setRenderedGroup,
  ] =
    useState<GroupWithMembers | null>(
      selectedGroup,
    );

  useEffect(() => {
    if (selectedGroup) {
      setRenderedGroup(
        selectedGroup,
      );
    }
  }, [selectedGroup]);

  useLockBodyScroll(open);

  const group =
    renderedGroup;

  const members =
    group?.members ?? [];

  const isMembersLimitReached =
    !isPremium &&
    members.length >=
      ent.maxMembersPerGroup;

  const invitation =
    useGroupInvitation({
      open,
      group,

      membersLimitReached:
        isMembersLimitReached,

      onInvitationSent,
    });

  const busy =
    manageLoading ||
    invitation.inviteLoading;

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (!open) {
          setRenderedGroup(
            null,
          );
        }
      }}
    >
      {open && group ? (
        <div
          className="
            fixed inset-0 z-50
            flex items-end
            justify-center
            sm:items-center
            sm:p-4
          "
        >
          {/* OVERLAY */}
          <motion.div
            className="
              absolute inset-0
              bg-[#173E31]/22
              backdrop-blur-[3px]
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={onClose}
          />

          {/* MODAL */}
          <motion.div
            className="
              relative
              flex max-h-[92dvh]
              w-full flex-col
              overflow-hidden
              rounded-t-[32px]
              border-t
              border-[#173E31]/10
              bg-[#FBFAF6]
              shadow-[0_-20px_70px_rgba(23,62,49,0.18)]

              sm:max-w-lg
              sm:rounded-[28px]
              sm:border
              sm:border-[#173E31]/10
              sm:shadow-[0_22px_65px_rgba(23,62,49,0.16)]
            "
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
            drag="y"
            dragControls={
              dragControls
            }
            dragListener={false}
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={{
              top: 0,
              bottom: 0.35,
            }}
            onDragEnd={(
              _,
              info,
            ) => {
              if (
                info.offset.y >
                  120 ||
                info.velocity.y >
                  700
              ) {
                onClose();
              }
            }}
            onClick={(
              event,
            ) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}
            <div
              className="
                sticky top-0 z-20
                border-b
                border-[#173E31]/8
                bg-[#FBFAF6]/95
                px-4 pb-3 pt-3
                backdrop-blur-xl

                sm:px-6
                sm:pt-5
              "
              onPointerDown={(
                event,
              ) =>
                dragControls.start(
                  event,
                )
              }
            >
              <div
                className="
                  mx-auto mb-3
                  h-1.5 w-12
                  rounded-full
                  bg-[#C7A45D]/45
                  sm:hidden
                "
              />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-[#A8833E]
                    "
                  >
                    {canManageGroups
                      ? "Administration"
                      : "Groupe"}
                  </p>

                  <h2
                    className="
                      truncate
                      font-serif
                      text-xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    {canManageGroups
                      ? "Gérer"
                      : "Détails"}{" "}
                    : {group.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onPointerDown={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                  onClick={onClose}
                  className="
                    flex h-10 w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#E7EEE8]
                    text-[#184C3A]
                    transition
                    hover:bg-[#DDE8DF]
                  "
                  title="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div
              className="
                overflow-y-auto
                px-4 pb-8 pt-4

                sm:p-6
                sm:pt-5
              "
            >
              {/* READ ONLY */}
              {!canManageGroups ? (
                <div
                  className="
                    rounded-[20px]
                    border border-[#173E31]/8
                    bg-[#E7EEE8]
                    p-4
                    text-sm
                    leading-relaxed
                    text-[#617168]
                  "
                >
                  Seul le{" "}
                  <strong className="text-[#173E31]">
                    propriétaire
                  </strong>{" "}
                  du groupe peut gérer les
                  membres et les paramètres.
                </div>
              ) : null}

              {/* OWNER TOOLS */}
              {canManageGroups ? (
                <div className="space-y-4">
                  <GroupInvitationSection
                    invitation={
                      invitation
                    }
                    busy={busy}
                    isPremium={
                      isPremium
                    }
                    membersLimitReached={
                      isMembersLimitReached
                    }
                    memberCount={
                      members.length
                    }
                    entitlements={
                      ent
                    }
                  />

                  {/* EXISTING TEAM */}
                  {availableTeam.length >
                  0 ? (
                    <div
                      className="
                        rounded-[24px]
                        border border-[#173E31]/10
                        bg-[#F7F5EF]
                        p-4
                      "
                    >
                      <h3
                        className="
                          mb-1
                          font-serif
                          text-lg
                          font-semibold
                          text-[#173E31]
                        "
                      >
                        Ajouter un membre de
                        l’équipe
                      </h3>

                      <p
                        className="
                          mb-4
                          text-xs
                          text-[#718078]
                        "
                      >
                        Ajoute directement une
                        personne déjà présente
                        dans l’équipe.
                      </p>

                      <div
                        className="
                          flex flex-col
                          gap-2
                          sm:flex-row
                        "
                      >
                        <select
                          value={
                            selectedUserId
                          }
                          onChange={(
                            event,
                          ) =>
                            setSelectedUserId(
                              event.target
                                .value,
                            )
                          }
                          className={`${ui.input} flex-1`}
                          disabled={
                            busy ||
                            isMembersLimitReached
                          }
                        >
                          <option value="">
                            -- Choisir un utilisateur --
                          </option>

                          {availableTeam.map(
                            (
                              user,
                            ) => (
                              <option
                                key={
                                  user.id
                                }
                                value={
                                  user.id
                                }
                              >
                                {(user.full_name ||
                                  user.email) +
                                  (user.restaurant_role
                                    ? ` — ${user.restaurant_role}`
                                    : "")}
                              </option>
                            ),
                          )}
                        </select>

                        <button
                          type="button"
                          className={`${ui.btnPrimary} flex items-center justify-center gap-2`}
                          onClick={
                            onAddMember
                          }
                          disabled={
                            busy ||
                            !selectedUserId ||
                            isMembersLimitReached
                          }
                        >
                          <UserPlus className="h-4 w-4" />
                          Ajouter
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* MEMBERS */}
              <div
                className="
                  mt-5
                  border-t
                  border-[#173E31]/8
                  pt-5
                "
              >
                <div
                  className="
                    mb-3
                    flex items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-[#A8833E]
                      "
                    >
                      Équipe
                    </p>

                    <h3
                      className="
                        mt-1
                        font-serif
                        text-lg
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      Membres (
                      {members.length})
                    </h3>
                  </div>

                  <div
                    className="
                      grid h-10 w-10
                      place-items-center
                      rounded-2xl
                      bg-[#E7EEE8]
                      text-[#184C3A]
                    "
                  >
                    <Users className="h-4 w-4" />
                  </div>
                </div>

                <div
                  className="
                    max-h-72
                    space-y-2
                    overflow-auto
                    pr-1
                  "
                >
                  {members.map(
                    (member) => (
                      <div
                        key={
                          member.id
                        }
                        className="
                          flex items-center
                          justify-between
                          gap-3
                          rounded-2xl
                          border border-[#173E31]/8
                          bg-[#F7F5EF]
                          px-4 py-3
                        "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                              truncate
                              text-sm
                              font-medium
                              text-[#173E31]
                            "
                          >
                            {member.full_name ||
                              member.email ||
                              "Sans nom"}
                          </div>

                          <div
                            className="
                              mt-0.5
                              text-xs
                              text-[#718078]
                            "
                          >
                            {member.role}
                          </div>
                        </div>

                        {canManageGroups ? (
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveMember(
                                member.id,
                              )
                            }
                            className="
                              inline-flex
                              h-9 w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              text-[#A86A66]
                              transition
                              hover:bg-[#F5E4E0]
                              hover:text-[#A54C48]
                              disabled:opacity-30
                            "
                            title="Retirer du groupe"
                            disabled={
                              busy ||
                              member.id ===
                                userId
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    ),
                  )}
                </div>

                {/* DELETE GROUP */}
                {canManageGroups ? (
                  <div
                    className="
                      mt-5
                      border-t
                      border-[#173E31]/8
                      pt-4
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onDeleteGroup(
                          group.id,
                        )
                      }
                      disabled={
                        busy
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        px-4 py-2.5
                        text-sm font-medium
                        text-[#A54C48]
                        transition
                        hover:bg-[#F5E4E0]
                        disabled:opacity-40
                      "
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer le groupe
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
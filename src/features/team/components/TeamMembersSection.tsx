import {
  ShieldCheck,
  Trash2,
  User,
  Users,
} from "lucide-react";

import { ui } from "../../../styles/ui";

import type {
  GroupRole,
  TeamMember,
} from "../types/team.types";

import {
  cn,
  roleLabel,
} from "../utils/teamHelpers";

type RoleOption = {
  value: GroupRole;
  label: string;
};

type TeamMembersSectionProps = {
  members: TeamMember[];

  currentUserId?: string;

  groupOwnerId:
    string | null;

  canAccess: boolean;

  roleOptions:
    RoleOption[];

  onChangeRole: (
    memberId: string,
    nextRole: GroupRole,
  ) => void;

  onRemoveMember: (
    memberId: string,
  ) => void;
};

export function TeamMembersSection({
  members,
  currentUserId,
  groupOwnerId,
  canAccess,
  roleOptions,
  onChangeRole,
  onRemoveMember,
}: TeamMembersSectionProps) {
  return (
    <div
      className="
        mt-5
        rounded-[28px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-5
        shadow-[0_8px_24px_rgba(23,62,49,0.04)]
        sm:p-6
      "
    >
      <div
        className="
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

          <h2
            className="
              mt-1
              font-serif
              text-xl
              font-semibold
              text-[#173E31]
            "
          >
            Membres
          </h2>
        </div>

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[#E7EEE8]
            px-3 py-1.5
            text-xs
            font-semibold
            text-[#184C3A]
          "
        >
          <Users className="h-3.5 w-3.5" />
          {members.length}
        </div>
      </div>

      {members.length ===
      0 ? (
        <div
          className="
            mt-5
            rounded-[22px]
            bg-[#F7F5EF]
            p-6
            text-center
          "
        >
          <User
            className="
              mx-auto
              h-6 w-6
              text-[#8B9791]
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-[#718078]
            "
          >
            Aucun membre dans ce
            groupe.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {members.map(
            (member) => {
              const isMe =
                member.id ===
                currentUserId;

              const isOwnerMember =
                Boolean(
                  groupOwnerId &&
                    member.id ===
                      groupOwnerId,
                );

              const rightLabel =
                isMe
                  ? "Vous"
                  : isOwnerMember
                    ? "Chef"
                    : roleLabel(
                        member.role,
                      );

              const canEditThisMember =
                canAccess &&
                !isMe &&
                !isOwnerMember;

              return (
                <div
                  key={
                    member.id
                  }
                  className="
                    flex flex-col
                    gap-4
                    rounded-[22px]
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    p-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div
                    className="
                      flex min-w-0
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        grid h-10 w-10
                        shrink-0
                        place-items-center
                        rounded-2xl
                        bg-[#E7EEE8]
                        text-[#184C3A]
                      "
                    >
                      {isOwnerMember ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className="
                          flex flex-wrap
                          items-center
                          gap-2
                        "
                      >
                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-[#173E31]
                          "
                        >
                          {member.full_name ||
                            member.email}
                        </p>

                        {isMe ? (
                          <span
                            className="
                              rounded-full
                              bg-[#E7EEE8]
                              px-2 py-0.5
                              text-[10px]
                              font-semibold
                              text-[#184C3A]
                            "
                          >
                            Vous
                          </span>
                        ) : null}

                        {isOwnerMember ? (
                          <span
                            className="
                              rounded-full
                              bg-[#C7A45D]/12
                              px-2 py-0.5
                              text-[10px]
                              font-semibold
                              text-[#8B6C32]
                            "
                          >
                            Chef
                          </span>
                        ) : null}
                      </div>

                      <p
                        className="
                          mt-0.5
                          truncate
                          text-xs
                          text-[#718078]
                        "
                      >
                        {member.job_title
                          ? `${member.job_title} • `
                          : ""}
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {canEditThisMember ? (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <select
                        value={
                          member.role
                        }
                        onChange={(
                          event,
                        ) =>
                          onChangeRole(
                            member.id,
                            event.target
                              .value as GroupRole,
                          )
                        }
                        className={cn(
                          ui.input,
                          "h-10 flex-1 py-2 text-sm sm:max-w-[240px]",
                        )}
                      >
                        {roleOptions.map(
                          (
                            option,
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveMember(
                            member.id,
                          )
                        }
                        className="
                          inline-flex
                          h-10 w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          text-[#A54C48]
                          transition
                          hover:bg-[#F5E4E0]
                        "
                        title="Supprimer le membre"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className="
                        self-start
                        rounded-full
                        bg-[#F0F2EC]
                        px-3 py-1.5
                        text-xs
                        font-medium
                        text-[#617168]

                        sm:self-auto
                      "
                    >
                      {rightLabel}
                    </span>
                  )}
                </div>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
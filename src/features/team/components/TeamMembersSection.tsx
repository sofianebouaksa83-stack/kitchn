import { Trash2 } from "lucide-react";

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
  groupOwnerId: string | null;
  canAccess: boolean;
  roleOptions: RoleOption[];

  onChangeRole: (
    memberId: string,
    nextRole: GroupRole
  ) => void;

  onRemoveMember: (memberId: string) => void;
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
    <div className="mt-8">
      <h2 className="text-base font-semibold text-slate-100 mb-4">
        Membres
      </h2>

      <div className="space-y-3">
        {members.map((member) => {
          const isMe =
            member.id === currentUserId;

          const isOwnerMember = Boolean(
            groupOwnerId &&
              member.id === groupOwnerId
          );

          const rightLabel = isMe
            ? "Vous"
            : isOwnerMember
              ? "Chef"
              : roleLabel(member.role);

          const canEditThisMember =
            canAccess &&
            !isMe &&
            !isOwnerMember;

          return (
            <div
              key={member.id}
              className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex justify-between items-center gap-4"
            >
              <div className="min-w-0">
                <p className="text-slate-100 font-medium truncate">
                  {member.full_name}
                </p>

                <p className="text-sm text-slate-300/70 truncate">
                  {member.job_title} • {member.email}
                </p>
              </div>

              {canEditThisMember ? (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(event) =>
                      onChangeRole(
                        member.id,
                        event.target.value as GroupRole
                      )
                    }
                    className={cn(
                      ui.input,
                      "max-w-[220px]"
                    )}
                  >
                    {roleOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveMember(member.id)
                    }
                    className="p-2 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 ring-1 ring-transparent hover:ring-red-500/20"
                    title="Supprimer le membre"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-300/70 whitespace-nowrap">
                  {rightLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
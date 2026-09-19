import {
  Loader2,
  Mail,
} from "lucide-react";

import type { GroupInvitationState } from "../hooks/useGroupInvitation";

import { GROUP_ROLE_OPTIONS } from "../services/groupInvitationService";

import type { InviteRole } from "../types/groups.types";

type GroupInvitationSectionProps = {
  invitation: GroupInvitationState;

  busy: boolean;

  isPremium: boolean;

  membersLimitReached: boolean;

  memberCount: number;

  entitlements: {
    maxMembersPerGroup: number;
  };
};

export function GroupInvitationSection({
  invitation,
  busy,
  isPremium,
  membersLimitReached,
  memberCount,
  entitlements,
}: GroupInvitationSectionProps) {
  return (
    <div
      className="
        rounded-[24px]
        border border-[#173E31]/10
        bg-[#F7F5EF]
        p-4
      "
    >
      {/* HEADER */}
      <div
        className="
          mb-4
          flex items-start
          justify-between
          gap-3
        "
      >
        <div>
          <h3
            className="
              font-serif
              text-lg
              font-semibold
              text-[#173E31]
            "
          >
            Inviter un membre par email
          </h3>

          <p
            className="
              mt-1
              text-xs
              leading-relaxed
              text-[#718078]
            "
          >
            La personne recevra une
            invitation pour rejoindre
            directement ce groupe.
          </p>
        </div>

        <div
          className="
            grid h-10 w-10
            shrink-0
            place-items-center
            rounded-2xl
            bg-[#C7A45D]/12
            text-[#A8833E]
          "
        >
          <Mail className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3">
        {/* EMAIL */}
        <input
          value={
            invitation.inviteEmail
          }
          onChange={(
            event,
          ) => {
            invitation.setInviteEmail(
              event.target.value,
            );

            invitation.clearFeedback();
          }}
          onKeyDown={(
            event,
          ) => {
            if (
              event.key === "Enter"
            ) {
              void invitation.sendInvitation();
            }
          }}
          type="email"
          placeholder="email@exemple.com"
          className="
            h-12 w-full
            rounded-2xl
            border border-[#173E31]/10
            bg-[#FBFAF6]
            px-4
            text-sm
            text-[#173E31]
            outline-none
            placeholder:text-[#8B9791]
            transition
            focus:border-[#C7A45D]/50
            focus:ring-2
            focus:ring-[#C7A45D]/15
            disabled:opacity-50
          "
          disabled={
            busy ||
            membersLimitReached
          }
        />

        {/* ROLE */}
        <select
          value={
            invitation.inviteRole
          }
          onChange={(
            event,
          ) =>
            invitation.setInviteRole(
              event.target
                .value as InviteRole,
            )
          }
          className="
            h-12 w-full
            rounded-2xl
            border border-[#173E31]/10
            bg-[#FBFAF6]
            px-4
            text-sm font-medium
            text-[#173E31]
            outline-none
            transition
            focus:border-[#C7A45D]/50
            focus:ring-2
            focus:ring-[#C7A45D]/15
            disabled:opacity-50
          "
          disabled={
            busy ||
            membersLimitReached
          }
        >
          {GROUP_ROLE_OPTIONS.map(
            (role) => (
              <option
                key={
                  role.value
                }
                value={
                  role.value
                }
              >
                {role.label} (
                {role.helper})
              </option>
            ),
          )}
        </select>

        {/* SEND */}
        <button
          type="button"
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-full
            bg-[#DDAE9D]
            px-5 py-3
            text-sm
            font-semibold
            text-[#173E31]
            shadow-[0_8px_20px_rgba(120,73,57,0.08)]
            transition
            hover:bg-[#D5A18E]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50

            sm:w-auto
          "
          onClick={() =>
            void invitation.sendInvitation()
          }
          disabled={
            busy ||
            membersLimitReached
          }
        >
          {invitation.inviteLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}

          {invitation.inviteLoading
            ? "Envoi..."
            : "Envoyer l’invitation"}
        </button>

        {/* PLAN INFO */}
        {!isPremium ? (
          <div className="text-xs text-[#718078]">
            Limite :{" "}
            {
              entitlements.maxMembersPerGroup
            }{" "}
            membres par groupe
            (actuel :{" "}
            {memberCount}).
          </div>
        ) : (
          <div
            className="
              rounded-xl
              bg-[#E7EEE8]
              px-3 py-2
              text-xs font-semibold
              text-[#184C3A]
            "
          >
            Premium actif : membres et
            invitations illimités.
          </div>
        )}

        {membersLimitReached ? (
          <div
            className="
              rounded-xl
              bg-[#F5ECD9]
              px-3 py-2
              text-xs
              text-[#8B6C32]
            "
          >
            Limite atteinte. Passe
            Premium pour ajouter plus
            de membres.
          </div>
        ) : null}

        {/* SUCCESS */}
        {invitation.inviteSuccess ? (
          <div
            className="
              rounded-2xl
              bg-[#E7EEE8]
              px-3 py-2
              text-xs font-medium
              text-[#184C3A]
            "
          >
            {
              invitation.inviteSuccess
            }
          </div>
        ) : null}

        {/* ERROR */}
        {invitation.inviteError ? (
          <div
            className="
              rounded-2xl
              bg-[#F8EAE7]
              px-3 py-2
              text-xs font-medium
              text-[#A54C48]
            "
          >
            {
              invitation.inviteError
            }
          </div>
        ) : null}
      </div>
    </div>
  );
}
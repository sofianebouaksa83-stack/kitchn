import { Loader2, Mail } from "lucide-react";
import type { GroupInvitationState } from "../hooks/useGroupInvitation";
import { GROUP_ROLE_OPTIONS } from "../services/groupInvitationService";
import type { InviteRole } from "../types/groups.types";

type GroupInvitationSectionProps = {
  invitation: GroupInvitationState;
  busy: boolean;
  isPremium: boolean;
  membersLimitReached: boolean;
  memberCount: number;
  entitlements: { maxMembersPerGroup: number };
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
    <div className="rounded-2xl bg-black/10 p-4 ring-1 ring-amber-400/15">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">
            Inviter un membre par email
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            La personne recevra une invitation pour rejoindre directement ce groupe.
          </p>
        </div>
        <div className="rounded-full bg-amber-400/15 p-2 text-amber-200">
          <Mail className="h-4 w-4" />
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={invitation.inviteEmail}
          onChange={(event) => {
            invitation.setInviteEmail(event.target.value);
            invitation.clearFeedback();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void invitation.sendInvitation();
            }
          }}
          type="email"
          placeholder="email@exemple.com"
          className="w-full rounded-2xl border border-white/10 bg-[#10215a]/70 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20"
          disabled={busy || membersLimitReached}
        />

        <select
          value={invitation.inviteRole}
          onChange={(event) =>
            invitation.setInviteRole(
              event.target.value as InviteRole
            )
          }
          className="w-full rounded-2xl border border-white/10 bg-[#10215a]/70 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20"
          disabled={busy || membersLimitReached}
        >
          {GROUP_ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label} ({role.helper})
            </option>
          ))}
        </select>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 to-orange-500 px-4 py-3 text-sm font-bold text-[#081335] shadow-lg shadow-orange-500/20 transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          onClick={() => void invitation.sendInvitation()}
          disabled={busy || membersLimitReached}
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

        {!isPremium && (
          <div className="text-xs text-slate-400">
            Limite : {entitlements.maxMembersPerGroup} membres par groupe (actuel : {memberCount}).
          </div>
        )}

        {isPremium && (
          <div className="text-xs font-semibold text-emerald-300">
            Premium actif : membres et invitations illimités.
          </div>
        )}

        {membersLimitReached && (
          <div className="text-xs text-amber-200">
            Limite atteinte. Passe Premium pour ajouter plus de membres.
          </div>
        )}

        {invitation.inviteSuccess && (
          <div className="rounded-2xl bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 ring-1 ring-emerald-300/20">
            {invitation.inviteSuccess}
          </div>
        )}

        {invitation.inviteError && (
          <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 ring-1 ring-red-300/20">
            {invitation.inviteError}
          </div>
        )}
      </div>
    </div>
  );
}

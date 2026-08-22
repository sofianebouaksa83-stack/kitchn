import type { FormEventHandler } from "react";
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Trash2,
} from "lucide-react";

import { ui } from "../../../styles/ui";

import type {
  GroupRole,
  Invitation,
  InviteStatus,
} from "../types/team.types";

type TeamInvitationsSectionProps = {
  showInviteForm: boolean;

  loadingPlan: boolean;
  isPremium: boolean;
  currentCount: number;
  isOwner: boolean;

  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;

  inviteRole: GroupRole;
  onInviteRoleChange: (value: GroupRole) => void;

  inviteStatus: InviteStatus;
  inviteMessage: string;

  invitations: Invitation[];

  onSubmit: FormEventHandler<HTMLFormElement>;
  onDeleteInvitation: (id: string) => void;
};

export function TeamInvitationsSection({
  showInviteForm,
  loadingPlan,
  isPremium,
  currentCount,
  isOwner,
  inviteEmail,
  onInviteEmailChange,
  inviteRole,
  onInviteRoleChange,
  inviteStatus,
  inviteMessage,
  invitations,
  onSubmit,
  onDeleteInvitation,
}: TeamInvitationsSectionProps) {
  return (
    <>
      {showInviteForm && (
        <div className="mt-6 rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-5">
          {!loadingPlan &&
          !isPremium &&
          currentCount >= 10 ? (
            <div className="rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
              <AlertCircle className="text-red-300" />

              <p className="text-red-200 text-sm">
                Limite Free atteinte : 10 membres
                (invitations incluses).
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <input
                type="email"
                value={inviteEmail}
                onChange={(event) =>
                  onInviteEmailChange(event.target.value)
                }
                placeholder="email@exemple.com"
                className={ui.input}
                required
              />

              <select
                value={inviteRole}
                onChange={(event) =>
                  onInviteRoleChange(
                    event.target.value as GroupRole
                  )
                }
                className={ui.input}
              >
                {isOwner && (
                  <option value="admin">
                    Second
                  </option>
                )}

                <option value="chef_de_partie">
                  Chef de partie (lecture seule)
                </option>

                <option value="commis">
                  Commis (lecture seule)
                </option>
              </select>

              <button
                type="submit"
                disabled={
                  inviteStatus === "sending" ||
                  loadingPlan
                }
                className={ui.btnPrimary}
              >
                <Mail className="w-4 h-4" />

                {inviteStatus === "sending"
                  ? "Envoi…"
                  : loadingPlan
                    ? "Vérification…"
                    : "Envoyer l’invitation"}
              </button>

              {!loadingPlan && !isPremium && (
                <p className="text-xs text-slate-400">
                  Free : 10 membres max (membres +
                  invitations en attente). Actuellement :{" "}
                  {currentCount}/10.
                </p>
              )}

              {!loadingPlan && isPremium && (
                <p className="text-xs text-emerald-300/90">
                  Premium actif : membres et invitations
                  illimités.
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {inviteStatus === "success" && (
        <div className="mt-6 rounded-3xl bg-emerald-500/10 ring-1 ring-emerald-400/20 p-4 flex gap-3">
          <CheckCircle className="text-emerald-300" />
          <p className="text-emerald-200">
            {inviteMessage}
          </p>
        </div>
      )}

      {inviteStatus === "error" && (
        <div className="mt-6 rounded-3xl bg-red-500/10 ring-1 ring-red-500/20 p-4 flex gap-3">
          <AlertCircle className="text-red-300" />
          <p className="text-red-200">
            {inviteMessage}
          </p>
        </div>
      )}

      {invitations.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base font-semibold text-slate-100 mb-4">
            Invitations en attente
          </h2>

          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex justify-between items-center"
              >
                <div className="min-w-0">
                  <p className="text-slate-100 truncate">
                    {invitation.email}
                  </p>

                  <p className="text-xs text-slate-300/70">
                    Envoyée le{" "}
                    {new Date(
                      invitation.created_at
                    ).toLocaleDateString("fr-FR")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onDeleteInvitation(invitation.id)
                  }
                  className="text-red-300 hover:text-red-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
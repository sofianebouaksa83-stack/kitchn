import type {
  FormEventHandler,
} from "react";

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

  onInviteEmailChange: (
    value: string,
  ) => void;

  inviteRole: GroupRole;

  onInviteRoleChange: (
    value: GroupRole,
  ) => void;

  inviteStatus: InviteStatus;
  inviteMessage: string;

  invitations:
    Invitation[];

  onSubmit:
    FormEventHandler<HTMLFormElement>;

  onDeleteInvitation: (
    id: string,
  ) => void;
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
      {/* INVITE FORM */}
      {showInviteForm ? (
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
          <div className="mb-5 flex items-start gap-3">
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
              <Mail className="h-4 w-4" />
            </div>

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
                Invitation
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
                Inviter un membre
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-[#718078]
                "
              >
                La personne recevra
                une invitation pour
                rejoindre ton équipe.
              </p>
            </div>
          </div>

          {!loadingPlan &&
          !isPremium &&
          currentCount >= 10 ? (
            <div
              className="
                flex gap-3
                rounded-2xl
                border border-[#C05C56]/15
                bg-[#F8EAE7]
                p-4
              "
            >
              <AlertCircle
                className="
                  h-5 w-5
                  shrink-0
                  text-[#A54C48]
                "
              />

              <p
                className="
                  text-sm
                  text-[#9B4944]
                "
              >
                Limite Free atteinte :
                10 membres, invitations
                incluses.
              </p>
            </div>
          ) : (
            <form
              onSubmit={onSubmit}
              className="space-y-4"
            >
              <div>
                <label
                  className="
                    mb-2 block
                    text-xs
                    font-semibold
                    text-[#29493E]
                  "
                >
                  Adresse email
                </label>

                <input
                  type="email"
                  value={
                    inviteEmail
                  }
                  onChange={(
                    event,
                  ) =>
                    onInviteEmailChange(
                      event.target
                        .value,
                    )
                  }
                  placeholder="email@exemple.com"
                  className={
                    ui.input
                  }
                  required
                />
              </div>

              <div>
                <label
                  className="
                    mb-2 block
                    text-xs
                    font-semibold
                    text-[#29493E]
                  "
                >
                  Rôle
                </label>

                <select
                  value={
                    inviteRole
                  }
                  onChange={(
                    event,
                  ) =>
                    onInviteRoleChange(
                      event.target
                        .value as GroupRole,
                    )
                  }
                  className={
                    ui.input
                  }
                >
                  {isOwner ? (
                    <option value="admin">
                      Second
                    </option>
                  ) : null}

                  <option value="chef_de_partie">
                    Chef de partie
                    (lecture seule)
                  </option>

                  <option value="commis">
                    Commis
                    (lecture seule)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={
                  inviteStatus ===
                    "sending" ||
                  loadingPlan
                }
                className={
                  ui.btnPrimary
                }
              >
                <Mail className="h-4 w-4" />

                {inviteStatus ===
                "sending"
                  ? "Envoi…"
                  : loadingPlan
                    ? "Vérification…"
                    : "Envoyer l’invitation"}
              </button>

              {!loadingPlan &&
              !isPremium ? (
                <div
                  className="
                    rounded-xl
                    bg-[#F0F2EC]
                    px-3 py-2
                    text-xs
                    text-[#718078]
                  "
                >
                  Offre Free :{" "}
                  <strong className="text-[#173E31]">
                    {currentCount}/10
                  </strong>{" "}
                  places utilisées.
                </div>
              ) : null}

              {!loadingPlan &&
              isPremium ? (
                <div
                  className="
                    rounded-xl
                    bg-[#E7EEE8]
                    px-3 py-2
                    text-xs
                    font-semibold
                    text-[#184C3A]
                  "
                >
                  Premium actif :
                  membres et invitations
                  illimités.
                </div>
              ) : null}
            </form>
          )}
        </div>
      ) : null}

      {/* SUCCESS */}
      {inviteStatus ===
      "success" ? (
        <div
          className="
            mt-5
            flex gap-3
            rounded-2xl
            border border-[#184C3A]/10
            bg-[#E7EEE8]
            p-4
            text-sm
            text-[#184C3A]
          "
        >
          <CheckCircle className="h-5 w-5 shrink-0" />
          {inviteMessage}
        </div>
      ) : null}

      {/* ERROR */}
      {inviteStatus ===
      "error" ? (
        <div
          className="
            mt-5
            flex gap-3
            rounded-2xl
            border border-[#C05C56]/15
            bg-[#F8EAE7]
            p-4
            text-sm
            text-[#A54C48]
          "
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          {inviteMessage}
        </div>
      ) : null}

      {/* PENDING */}
      {invitations.length >
      0 ? (
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
              En attente
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
              Invitations
            </h2>
          </div>

          <div className="mt-4 space-y-2">
            {invitations.map(
              (invitation) => (
                <div
                  key={
                    invitation.id
                  }
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-2xl
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    px-4 py-3
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-[#173E31]
                      "
                    >
                      {
                        invitation.email
                      }
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-xs
                        text-[#718078]
                      "
                    >
                      Envoyée le{" "}
                      {new Date(
                        invitation.created_at,
                      ).toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteInvitation(
                        invitation.id,
                      )
                    }
                    className="
                      inline-flex
                      h-9 w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-[#A54C48]
                      transition
                      hover:bg-[#F5E4E0]
                    "
                    title="Supprimer l’invitation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
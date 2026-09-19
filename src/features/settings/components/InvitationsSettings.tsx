import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  User,
} from "lucide-react";

import { Section } from "./Section";

import { cn } from "../utils/cn";

import type { PendingInvitationRow } from "../types/settings.types";

type InvitationsSettingsProps = {
  loading: boolean;

  error: string | null;

  invitations:
    PendingInvitationRow[];

  joiningToken:
    string | null;

  onAcceptInvitation: (
    token: string,
  ) => void;
};

function roleLabel(
  role: string | null,
) {
  const value = (
    role ?? ""
  ).toLowerCase();

  if (value === "admin") {
    return "Second";
  }

  if (
    value ===
    "chef_de_partie"
  ) {
    return "Chef de partie";
  }

  if (value === "commis") {
    return "Commis";
  }

  return role ?? "Membre";
}

function isExpired(
  expiresAt: string | null,
) {
  if (!expiresAt) {
    return false;
  }

  return (
    new Date(
      expiresAt,
    ).getTime() <
    Date.now()
  );
}

export function InvitationsSettings({
  loading,
  error,
  invitations,
  joiningToken,
  onAcceptInvitation,
}: InvitationsSettingsProps) {
  return (
    <Section
      title="Invitations"
      icon={
        <Mail className="h-4 w-4" />
      }
      loading={loading}
    >
      <p
        className="
          text-sm
          leading-relaxed
          text-[#718078]
        "
      >
        Rejoins directement un groupe
        depuis une invitation reçue.
      </p>

      {/* ERROR */}
      {error ? (
        <div
          className="
            mt-4
            flex gap-2
            rounded-2xl
            border border-[#C05C56]/20
            bg-[#F8EAE7]
            px-4 py-3
            text-sm
            text-[#9B4944]
          "
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          {error}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {/* EMPTY */}
        {!loading &&
        invitations.length ===
          0 ? (
          <div
            className="
              rounded-[24px]
              border border-[#173E31]/8
              bg-[#F7F5EF]
              p-6
              text-center
            "
          >
            <div
              className="
                mx-auto
                grid h-11 w-11
                place-items-center
                rounded-2xl
                bg-[#E7EEE8]
                text-[#184C3A]
              "
            >
              <Mail className="h-5 w-5" />
            </div>

            <p
              className="
                mt-4
                font-serif
                text-lg
                font-semibold
                text-[#173E31]
              "
            >
              Aucune invitation
            </p>

            <p
              className="
                mt-1
                text-sm
                text-[#718078]
              "
            >
              Les invitations en
              attente apparaîtront ici.
            </p>
          </div>
        ) : null}

        {/* INVITATIONS */}
        {invitations.map(
          (invitation) => {
            const expired =
              isExpired(
                invitation.expires_at,
              );

            const joining =
              joiningToken ===
              invitation.token;

            return (
              <div
                key={
                  invitation.id
                }
                className="
                  rounded-[24px]
                  border border-[#173E31]/10
                  bg-[#F7F5EF]
                  p-4
                "
              >
                <div
                  className="
                    flex flex-col
                    gap-4
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-[#A8833E]
                      "
                    >
                      Groupe
                    </p>

                    <div
                      className="
                        mt-1
                        truncate
                        font-serif
                        text-xl
                        font-semibold
                        text-[#173E31]
                      "
                    >
                      {invitation.work_group_name ??
                        "Groupe"}
                    </div>

                    <div
                      className="
                        mt-3
                        flex flex-wrap
                        gap-2
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-full
                          bg-[#E7EEE8]
                          px-3 py-1.5
                          text-xs
                          text-[#617168]
                        "
                      >
                        <User className="h-3.5 w-3.5 text-[#184C3A]" />

                        Rôle :

                        <span className="font-semibold text-[#173E31]">
                          {roleLabel(
                            invitation.role,
                          )}
                        </span>
                      </span>

                      {invitation.expires_at ? (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-[#F0F2EC]
                            px-3 py-1.5
                            text-xs
                            text-[#718078]
                          "
                        >
                          <Clock className="h-3.5 w-3.5" />

                          Expire le{" "}
                          {new Date(
                            invitation.expires_at,
                          ).toLocaleString(
                            undefined,
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      ) : null}
                    </div>

                    {expired ? (
                      <div
                        className="
                          mt-3
                          flex items-center
                          gap-2
                          rounded-xl
                          bg-[#F5ECD9]
                          px-3 py-2
                          text-xs
                          text-[#8B6C32]
                        "
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />

                        Invitation expirée —
                        demande un nouveau lien.
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled={
                      expired ||
                      joining
                    }
                    onClick={() =>
                      onAcceptInvitation(
                        invitation.token,
                      )
                    }
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                      "bg-[#DDAE9D] text-[#173E31] hover:bg-[#D5A18E]",
                      (expired ||
                        joining) &&
                        "cursor-not-allowed opacity-45",
                    )}
                  >
                    {joining ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Rejoindre…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Rejoindre
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          },
        )}
      </div>
    </Section>
  );
}
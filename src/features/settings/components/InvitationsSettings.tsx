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
  invitations: PendingInvitationRow[];
  joiningToken: string | null;
  onAcceptInvitation: (token: string) => void;
};

function roleLabel(role: string | null) {
  const r = (role ?? "").toLowerCase();

  if (r === "admin") return "Second";
  if (r === "chef_de_partie") return "Chef de partie";
  if (r === "commis") return "Commis";

  return role ?? "Membre";
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
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
      icon={<Mail className="h-4 w-4" />}
      loading={loading}
    >
      <div className="text-sm text-white/60">
        Rejoins un groupe depuis une invitation.
      </div>

      {error && (
        <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 flex gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {!loading && invitations.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
            Aucune invitation en attente.
          </div>
        )}

        {invitations.map((invitation) => {
          const expired = isExpired(invitation.expires_at);
          const joining = joiningToken === invitation.token;

          return (
            <div
              key={invitation.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white/60">
                    Groupe
                  </div>

                  <div className="mt-0.5 text-base font-semibold truncate">
                    {invitation.work_group_name ?? "Groupe"}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs text-white/80">
                      <User className="h-3.5 w-3.5" />
                      Rôle :
                      <span className="text-white/95 font-semibold">
                        {roleLabel(invitation.role)}
                      </span>
                    </span>

                    {invitation.expires_at && (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-xs text-white/70">
                        <Clock className="h-3.5 w-3.5" />

                        Expire le{" "}
                        {new Date(
                          invitation.expires_at
                        ).toLocaleString(undefined, {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  {expired && (
                    <div className="mt-3 text-xs text-amber-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Invitation expirée — demande un nouveau lien.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={expired || joining}
                  onClick={() =>
                    onAcceptInvitation(invitation.token)
                  }
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                    "bg-amber-400 text-black hover:bg-amber-300 transition ring-1 ring-amber-300/60",
                    (expired || joining) &&
                      "opacity-50 cursor-not-allowed"
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
        })}
      </div>
    </Section>
  );
}

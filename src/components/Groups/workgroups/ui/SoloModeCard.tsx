import { RefreshCw } from "lucide-react";
import { InvitationStatusIcon } from "../../../InvitationStatusIcon";
import type { InviteViewState, InvitationRow } from "../hooks/usePendingInvitation";

type Entitlements = {
  maxGroups: number;
  maxMembersPerGroup: number;
};

export function SoloModeCard(props: {
  ui: any;
  errorMsg: string | null;

  checkingInvite: boolean;
  acceptingInvite: boolean;
  inviteMsg: string | null;
  inviteState: InviteViewState;
  pendingInvite: InvitationRow | null;
  acceptSuccess: boolean;

  onRefreshInvite: () => Promise<void>;
  onAcceptInvite: () => Promise<void>;

  canCreateGroup: boolean;
  onCreateGroup: () => void;
  isPremium: boolean;

  // ⚠️ peut être undefined → on protège
  ent?: Entitlements;
  groupsCount?: number;
}) {
  const {
    ui,
    errorMsg,
    checkingInvite,
    acceptingInvite,
    inviteMsg,
    inviteState,
    pendingInvite,
    acceptSuccess,
    onRefreshInvite,
    onAcceptInvite,
    canCreateGroup,
    onCreateGroup,
    isPremium,
    ent,
    groupsCount,
  } = props;

  // ✅ SAFE DEFAULTS (clé du fix)
const safeEnt = ent ?? { maxGroups: 1, maxMembersPerGroup: 10 };


  const safeGroupsCount = groupsCount ?? 0;

  const freeLimitReached =
    !isPremium && safeGroupsCount >= safeEnt.maxGroups;

  const restaurantName =
    pendingInvite?.restaurants?.name ??
    pendingInvite?.restaurant_id ??
    null;

  return (
    <div className="rounded-[28px] bg-white/[0.06] ring-1 ring-white/10 shadow-[0_18px_70px_rgba(0,0,0,0.35)] backdrop-blur-md p-8">
      <h1 className={`${ui.title} mb-2`}>Mode solo</h1>
      <p className={`${ui.muted} mb-6`}>
        Les <b>groupes</b> servent à partager des recettes en équipe. Pour
        l’instant, ton compte n’est rattaché à aucun restaurant.
      </p>

      <div className="rounded-lg bg-white/5 ring-1 ring-white/10 p-4 mb-6">
        <p className="text-slate-200 text-sm">
          ✅ Tu peux continuer à créer/importer tes recettes personnelles.
          <br />
          👥 Tu peux créer ton <b>premier groupe</b> (Free), puis inviter ton
          équipe.
        </p>

        {canCreateGroup && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                if (freeLimitReached) return;
                onCreateGroup();
              }}
              className={`${ui.btnPrimary} w-full sm:w-auto`}
              disabled={freeLimitReached}
              title={
                freeLimitReached
                  ? "Limite Free atteinte (1 groupe max)"
                  : "Créer mon premier groupe"
              }
            >
              + Créer mon premier groupe
            </button>

            <p className="mt-2 text-xs text-slate-400">
              {isPremium
                ? "Premium : groupes illimités."
                : `Version gratuite : ${safeEnt.maxGroups} groupe max / ${safeEnt.maxMembersPerGroupp} membres max.`}
            </p>

            {freeLimitReached && (
              <p className="mt-1 text-xs text-amber-200">
                Limite atteinte. Passe Premium pour créer plusieurs groupes.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-black/10 ring-1 ring-white/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-slate-100 font-semibold">Invitation</div>
            <div className="text-slate-400 text-sm">
              Détection automatique des invitations liées à ton compte.
            </div>
          </div>

          <button
            type="button"
            className={ui.btnGhost}
            onClick={onRefreshInvite}
            disabled={checkingInvite || acceptingInvite}
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3">
          {checkingInvite ? (
            <p className="text-slate-300 text-sm">
              Recherche d’une invitation…
            </p>
          ) : pendingInvite ? (
            <div className="relative rounded-lg bg-black/20 ring-1 ring-white/10 p-3">
              <div className="text-slate-100 text-sm">
                <span className="text-slate-400">Restaurant :</span>{" "}
                {restaurantName}
              </div>

              <div className="text-slate-100 text-sm mt-1">
                <span className="text-slate-400">Rôle proposé :</span>{" "}
                {pendingInvite.role ?? "member"}
              </div>

              <div className="absolute top-4 right-4">
                <InvitationStatusIcon state={inviteState} />
              </div>

              {pendingInvite.expires_at && (
                <div className="text-slate-400 text-xs mt-2">
                  Expire le :{" "}
                  {new Date(pendingInvite.expires_at).toLocaleString()}
                </div>
              )}

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className={ui.btnPrimary}
                  disabled={acceptingInvite || inviteState !== "pending"}
                  onClick={onAcceptInvite}
                >
                  {acceptingInvite
                    ? "Acceptation…"
                    : "Accepter l’invitation"}
                </button>

                <button
                  type="button"
                  className={ui.btnGhost}
                  disabled={acceptingInvite}
                  onClick={() =>
                    alert(
                      "Le flow 'Rejoindre un restaurant' arrive après."
                    )
                  }
                >
                  Rejoindre un restaurant
                </button>
              </div>

              {acceptSuccess && (
                <div className="mt-3 text-emerald-300 text-sm">
                  Invitation acceptée ✅ Chargement de tes groupes…
                </div>
              )}
              {inviteMsg && (
                <div className="mt-3 text-amber-200 text-sm">
                  {inviteMsg}
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-300 text-sm">
              {inviteMsg ?? "Aucune invitation trouvée."}
            </p>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-3 py-2 text-sm">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

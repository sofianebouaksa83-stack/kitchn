import {
  RefreshCw,
  Users,
} from "lucide-react";

import { InvitationStatusIcon } from "../../../components/InvitationStatusIcon";

import { ui } from "../../../styles/ui";

import type {
  InvitationRow,
  InviteViewState,
} from "../types/groups.types";

export function SoloModeCard(
  props: {
    errorMsg: string | null;

    checkingInvite: boolean;
    acceptingInvite: boolean;

    inviteMsg: string | null;
    inviteState: InviteViewState;

    pendingInvite:
      InvitationRow | null;

    acceptSuccess: boolean;

    onRefreshInvite:
      () => Promise<void>;

    onAcceptInvite:
      () => Promise<void>;
  },
) {
  const {
    errorMsg,

    checkingInvite,
    acceptingInvite,

    inviteMsg,
    inviteState,
    pendingInvite,
    acceptSuccess,

    onRefreshInvite,
    onAcceptInvite,
  } = props;

  const restaurantName =
    pendingInvite?.restaurants
      ?.name ??
    pendingInvite?.restaurant_id ??
    null;

  return (
    <div
      className="
        rounded-[30px]
        border border-[#173E31]/10
        bg-[#FBFAF6]
        p-6
        shadow-[0_12px_35px_rgba(23,62,49,0.05)]
        sm:p-8
      "
    >
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <div
          className="
            grid h-12 w-12
            shrink-0
            place-items-center
            rounded-2xl
            bg-[#E7EEE8]
            text-[#184C3A]
          "
        >
          <Users className="h-5 w-5" />
        </div>

        <div>
          <p
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[#A8833E]
            "
          >
            Collaboration
          </p>

          <h1
            className="
              mt-1
              font-serif
              text-3xl
              font-semibold
              text-[#173E31]
            "
          >
            Mode solo
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-relaxed
              text-[#718078]
            "
          >
            Les groupes servent à
            partager des recettes en
            équipe. Pour l’instant,
            ton compte n’est rattaché
            à aucun restaurant.
          </p>
        </div>
      </div>

      {/* INFO */}
      <div
        className="
          mt-6
          rounded-[22px]
          border border-[#173E31]/8
          bg-[#F7F5EF]
          p-4
        "
      >
        <p
          className="
            text-sm
            leading-7
            text-[#617168]
          "
        >
          Tu peux continuer à créer et
          importer tes recettes
          personnelles.
          <br />
          Tu peux aussi créer ton{" "}
          <strong className="text-[#173E31]">
            premier groupe
          </strong>{" "}
          puis inviter ton équipe.
        </p>
      </div>

      {/* INVITATION */}
      <div
        className="
          mt-5
          rounded-[24px]
          border border-[#173E31]/10
          bg-[#F7F5EF]
          p-4
        "
      >
        <div
          className="
            flex items-start
            justify-between
            gap-3
          "
        >
          <div>
            <h2
              className="
                font-serif
                text-lg
                font-semibold
                text-[#173E31]
              "
            >
              Invitation
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-[#718078]
              "
            >
              Détection automatique
              des invitations liées à
              ton compte.
            </p>
          </div>

          <button
            type="button"
            className="
              inline-flex
              h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#E7EEE8]
              text-[#184C3A]
              transition
              hover:bg-[#DDE8DF]
              disabled:opacity-40
            "
            onClick={
              onRefreshInvite
            }
            disabled={
              checkingInvite ||
              acceptingInvite
            }
            title="Rafraîchir"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                checkingInvite
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>
        </div>

        <div className="mt-4">
          {checkingInvite ? (
            <p
              className="
                text-sm
                text-[#718078]
              "
            >
              Recherche d’une invitation…
            </p>
          ) : pendingInvite ? (
            <div
              className="
                relative
                rounded-2xl
                border border-[#173E31]/8
                bg-[#FBFAF6]
                p-4
              "
            >
              <div
                className="
                  pr-12
                  text-sm
                  text-[#173E31]
                "
              >
                <span className="text-[#718078]">
                  Restaurant :
                </span>{" "}
                {restaurantName}
              </div>

              <div
                className="
                  mt-1
                  text-sm
                  text-[#173E31]
                "
              >
                <span className="text-[#718078]">
                  Rôle proposé :
                </span>{" "}
                {pendingInvite.role ??
                  "member"}
              </div>

              <div className="absolute right-4 top-4">
                <InvitationStatusIcon
                  state={
                    inviteState
                  }
                />
              </div>

              {pendingInvite.expires_at ? (
                <div
                  className="
                    mt-2
                    text-xs
                    text-[#8B9791]
                  "
                >
                  Expire le :{" "}
                  {new Date(
                    pendingInvite.expires_at,
                  ).toLocaleString()}
                </div>
              ) : null}

              <div
                className="
                  mt-4
                  flex flex-col
                  gap-2
                  sm:flex-row
                "
              >
                <button
                  type="button"
                  className={
                    ui.btnPrimary
                  }
                  disabled={
                    acceptingInvite ||
                    inviteState !==
                      "pending"
                  }
                  onClick={
                    onAcceptInvite
                  }
                >
                  {acceptingInvite
                    ? "Acceptation…"
                    : "Accepter l’invitation"}
                </button>

                <button
                  type="button"
                  className={
                    ui.btnGhost
                  }
                  disabled={
                    acceptingInvite
                  }
                  onClick={() =>
                    alert(
                      "Le flow 'Rejoindre un restaurant' arrive après.",
                    )
                  }
                >
                  Rejoindre un restaurant
                </button>
              </div>

              {acceptSuccess ? (
                <div
                  className="
                    mt-3
                    rounded-xl
                    bg-[#E7EEE8]
                    px-3 py-2
                    text-sm
                    font-medium
                    text-[#184C3A]
                  "
                >
                  Invitation acceptée ✅
                  Chargement de tes groupes…
                </div>
              ) : null}

              {inviteMsg ? (
                <div
                  className="
                    mt-3
                    text-sm
                    text-[#A8833E]
                  "
                >
                  {inviteMsg}
                </div>
              ) : null}
            </div>
          ) : (
            <p
              className="
                text-sm
                text-[#718078]
              "
            >
              {inviteMsg ??
                "Aucune invitation trouvée."}
            </p>
          )}
        </div>

        {errorMsg ? (
          <div
            className="
              mt-4
              rounded-xl
              border border-[#C05C56]/20
              bg-[#F8EAE7]
              px-3 py-2
              text-sm
              text-[#9B4944]
            "
          >
            {errorMsg}
          </div>
        ) : null}
      </div>
    </div>
  );
}
import {
  Check,
  CreditCard,
  Crown,
  Sparkles,
} from "lucide-react";

import { ui } from "../../../styles/ui";

type FreeSubscriptionViewProps = {
  embedded: boolean;
  error: string | null;
  onOpenCheckout?: () => void;
};

function Feature({
  children,
  active = true,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <li
      className={`
        flex items-center gap-3
        text-sm
        ${
          active
            ? "text-[#29493E]"
            : "text-[#8B9791]"
        }
      `}
    >
      <span
        className={`
          grid h-6 w-6
          shrink-0
          place-items-center
          rounded-full
          ${
            active
              ? "bg-[#E7EEE8] text-[#184C3A]"
              : "bg-[#F0F2EC] text-[#9AA49F]"
          }
        `}
      >
        <Check className="h-3.5 w-3.5" />
      </span>

      {children}
    </li>
  );
}

export function FreeSubscriptionView({
  embedded,
  error,
  onOpenCheckout,
}: FreeSubscriptionViewProps) {
  return (
    <div
      className={
        embedded
          ? ""
          : ui.dashboardBg
      }
    >
      <div
        className={
          embedded
            ? ""
            : `${ui.containerWide} px-4 py-6 sm:px-6 sm:py-8`
        }
      >
        <div className="mx-auto max-w-6xl">
          {!embedded ? (
            <div className="mb-8 flex items-start gap-3">
              <div
                className="
                  grid h-11 w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                  ring-1 ring-[#173E31]/8
                "
              >
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[#A8833E]
                  "
                >
                  Facturation
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
                  Mon abonnement
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#718078]
                  "
                >
                  Tu utilises actuellement
                  l’offre gratuite Kitch’n.
                </p>
              </div>
            </div>
          ) : null}

          {error ? (
            <div
              className="
                mb-5
                rounded-2xl
                border border-[#C05C56]/20
                bg-[#F8EAE7]
                px-4 py-3
                text-sm
                text-[#9B4944]
              "
            >
              {error}
            </div>
          ) : null}

          {/* PLAN ACTUEL */}
          <div
            className="
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-5
              shadow-[0_10px_30px_rgba(23,62,49,0.04)]
              sm:p-6
            "
          >
            <div
              className="
                flex items-start
                justify-between
                gap-4
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
                  Plan actuel
                </p>

                <h2
                  className="
                    mt-1
                    font-serif
                    text-3xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Free
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#718078]
                  "
                >
                  Les fonctions essentielles
                  pour cuisiner avec Kitch’n.
                </p>
              </div>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-[#F0F2EC]
                  px-3 py-1.5
                  text-xs
                  font-semibold
                  text-[#617168]
                "
              >
                Gratuit
              </span>
            </div>

            <div
              className="
                mt-6
                border-t
                border-[#173E31]/8
                pt-5
              "
            >
              <h3
                className="
                  font-serif
                  text-lg
                  font-semibold
                  text-[#173E31]
                "
              >
                Fonctionnalités incluses
              </h3>

              <ul className="mt-4 space-y-3">
                <Feature>
                  Création de recettes
                </Feature>

                <Feature>
                  Accès aux fonctions de base
                </Feature>

                <Feature active={false}>
                  Import et génération IA limités
                </Feature>

                <Feature active={false}>
                  Fonctionnalités avancées limitées
                </Feature>
              </ul>
            </div>
          </div>

          {/* PREMIUM */}
          <div
            className="
              mt-5
              overflow-hidden
              rounded-[28px]
              border border-[#C7A45D]/25
              bg-[#F7F5EF]
              shadow-[0_10px_30px_rgba(23,62,49,0.04)]
            "
          >
            <div
              className="
                border-b
                border-[#C7A45D]/15
                bg-[#E7EEE8]
                p-5
                sm:p-6
              "
            >
              <div
                className="
                  flex items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#A8833E]
                    "
                  >
                    <Crown className="h-4 w-4" />
                    Kitch’n Premium
                  </div>

                  <h2
                    className="
                      mt-2
                      font-serif
                      text-2xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    Débloque tout Kitch’n
                  </h2>

                  <p
                    className="
                      mt-2
                      max-w-xl
                      text-sm
                      leading-relaxed
                      text-[#617168]
                    "
                  >
                    Profite de l’import IA,
                    des fonctions avancées et
                    des prochaines évolutions.
                  </p>
                </div>

                <div
                  className="
                    hidden h-11 w-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    bg-[#C7A45D]/15
                    text-[#A8833E]
                    sm:grid
                  "
                >
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <ul className="space-y-3">
                <Feature>
                  Import et génération IA
                </Feature>

                <Feature>
                  Fonctionnalités Premium débloquées
                </Feature>

                <Feature>
                  Gestion d’abonnement via Stripe
                </Feature>

                <Feature>
                  Évolutions futures incluses
                </Feature>
              </ul>

              <button
                type="button"
                onClick={onOpenCheckout}
                className={`${ui.btnPrimary} mt-6 w-full justify-center sm:w-auto`}
              >
                <CreditCard className="h-4 w-4" />
                Passer à Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
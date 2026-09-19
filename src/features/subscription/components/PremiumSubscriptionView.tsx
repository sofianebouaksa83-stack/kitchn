import {
  AlertCircle,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Loader2,
} from "lucide-react";

import { ui } from "../../../styles/ui";

import type {
  Plan,
  Subscription,
} from "../types/subscription.types";

import {
  formatSubscriptionDate,
  getSubscriptionStatusInfo,
} from "../utils/subscriptionHelpers";

type PremiumSubscriptionViewProps = {
  embedded: boolean;

  subscription:
    Subscription | null;

  plan: Plan;

  error:
    string | null;

  managingSubscription:
    boolean;

  onManageSubscription:
    () => void;
};

function PremiumFeature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <li
      className="
        flex items-center
        gap-3
        text-sm
        text-[#29493E]
      "
    >
      <span
        className="
          grid h-6 w-6
          shrink-0
          place-items-center
          rounded-full
          bg-[#E7EEE8]
          text-[#184C3A]
        "
      >
        <Check className="h-3.5 w-3.5" />
      </span>

      {children}
    </li>
  );
}

export function PremiumSubscriptionView({
  embedded,
  subscription,
  plan,
  error,
  managingSubscription,
  onManageSubscription,
}: PremiumSubscriptionViewProps) {
  const statusInfo =
    getSubscriptionStatusInfo(
      subscription?.status,
    );

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
                  Gère ton abonnement
                  Premium et ta facturation.
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

          {/* PREMIUM CARD */}
          <div
            className="
              overflow-hidden
              rounded-[28px]
              border border-[#C7A45D]/25
              bg-[#FBFAF6]
              shadow-[0_12px_35px_rgba(23,62,49,0.05)]
            "
          >
            <div
              className="
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
                    Premium
                  </div>

                  <h2
                    className="
                      mt-2
                      font-serif
                      text-3xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    {plan.name}
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-medium
                      text-[#617168]
                    "
                  >
                    {(
                      plan.price_monthly /
                      100
                    ).toFixed(2)}
                    € / mois
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    rounded-full
                    bg-[#FBFAF6]
                    px-3 py-1.5
                    text-xs
                    font-semibold
                    text-[#184C3A]
                    ring-1
                    ring-[#173E31]/8
                  "
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {/* INFOS */}
              <div
                className="
                  grid grid-cols-1
                  gap-3
                  md:grid-cols-2
                "
              >
                <div
                  className="
                    rounded-[22px]
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        grid h-9 w-9
                        shrink-0
                        place-items-center
                        rounded-xl
                        bg-[#E7EEE8]
                        text-[#184C3A]
                      "
                    >
                      <Calendar className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          text-[#718078]
                        "
                      >
                        Prochain renouvellement
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          text-[#173E31]
                        "
                      >
                        {formatSubscriptionDate(
                          subscription?.current_period_end ??
                            null,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    rounded-[22px]
                    border border-[#173E31]/8
                    bg-[#F7F5EF]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        grid h-9 w-9
                        shrink-0
                        place-items-center
                        rounded-xl
                        bg-[#E7EEE8]
                        text-[#184C3A]
                      "
                    >
                      <CreditCard className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          text-[#718078]
                        "
                      >
                        Mode de paiement
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-semibold
                          text-[#173E31]
                        "
                      >
                        Carte bancaire
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CANCELLATION */}
              {subscription?.cancel_at_period_end ? (
                <div
                  className="
                    mt-4
                    flex items-start
                    gap-3
                    rounded-[20px]
                    border border-[#C7A45D]/20
                    bg-[#F5ECD9]
                    p-4
                  "
                >
                  <AlertCircle
                    className="
                      mt-0.5
                      h-5 w-5
                      shrink-0
                      text-[#A8833E]
                    "
                  />

                  <div>
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-[#7F622D]
                      "
                    >
                      Abonnement en cours
                      d’annulation
                    </p>

                    <p
                      className="
                        mt-1
                        text-sm
                        leading-relaxed
                        text-[#8B7041]
                      "
                    >
                      Ton abonnement restera
                      actif jusqu’au{" "}
                      {formatSubscriptionDate(
                        subscription.current_period_end,
                      )}
                      .
                    </p>
                  </div>
                </div>
              ) : null}

              {/* FEATURES */}
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
                  {plan.features
                    .creation_recettes ? (
                    <PremiumFeature>
                      Création de recettes
                    </PremiumFeature>
                  ) : null}

                  {plan.features
                    .import_ai ? (
                    <PremiumFeature>
                      Import et génération IA
                    </PremiumFeature>
                  ) : null}

                  <PremiumFeature>
                    Support par email
                  </PremiumFeature>
                </ul>
              </div>
            </div>
          </div>

          {/* MANAGE */}
          <div
            className="
              mt-5
              rounded-[28px]
              border border-[#173E31]/10
              bg-[#FBFAF6]
              p-5
              shadow-[0_10px_30px_rgba(23,62,49,0.04)]
              sm:p-6
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#A8833E]
              "
            >
              Facturation
            </p>

            <h3
              className="
                mt-1
                font-serif
                text-xl
                font-semibold
                text-[#173E31]
              "
            >
              Gérer mon abonnement
            </h3>

            <p
              className="
                mt-2
                max-w-xl
                text-sm
                leading-relaxed
                text-[#718078]
              "
            >
              Accède au portail Stripe
              pour modifier ton moyen de
              paiement ou gérer ton
              abonnement.
            </p>

            <button
              type="button"
              onClick={
                onManageSubscription
              }
              disabled={
                managingSubscription
              }
              className={`
                ${ui.btnPrimary}
                mt-5
                ${
                  managingSubscription
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }
              `}
            >
              {managingSubscription ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirection…
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Gérer mon abonnement
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
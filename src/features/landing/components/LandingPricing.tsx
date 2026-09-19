import { motion } from "framer-motion";

import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";

import { cn } from "../../../utils/cn";

import type { LandingSubscriptionState } from "../hooks/useLandingSubscription";

const FREE_FEATURES = [
  "Création de recettes",
  "Accès aux groupes et dossiers",
  "Usage standard de l’application",
  "Sans paiement requis",
];

const PREMIUM_FEATURES = [
  "Import et génération IA",
  "Fonctionnalités premium débloquées",
  "Gestion d’abonnement via Stripe",
  "Évolutions futures incluses",
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)",
  },

  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

function FeatureList({
  features,
  premium = false,
}: {
  features: string[];
  premium?: boolean;
}) {
  return (
    <ul className="mb-7 space-y-3">
      {features.map((feature) => (
        <li
          key={feature}
          className="
            flex
            items-center
            gap-3
            text-sm
            text-[#29493E]
          "
        >
          <span
            className={cn(
              "grid h-6 w-6 shrink-0 place-items-center rounded-full",
              premium
                ? "bg-[#C7A45D]/14 text-[#A8833E]"
                : "bg-[#E7EEE8] text-[#184C3A]",
            )}
          >
            <Check className="h-3.5 w-3.5" />
          </span>

          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

type LandingPricingProps = {
  userPresent: boolean;

  onStart: () => void;

  subscription: LandingSubscriptionState;
};

export function LandingPricing({
  userPresent,
  onStart,
  subscription,
}: LandingPricingProps) {
  const freeIsCurrent =
    subscription.currentPlan === "free";

  const premiumIsCurrent =
    subscription.currentPlan === "premium";

  const buttonBase =
    "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]";

  return (
    <section
      id="pricing"
      className="
        relative
        mt-20
        pb-10
        sm:mt-28
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          sm:px-6
        "
      >
        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mx-auto
            max-w-3xl
            text-center
          "
        >
          <div
            className="
              mx-auto
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#E7EEE8]
              px-3.5
              py-1.5
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-[#A8833E]
            "
          >
            <Sparkles className="h-3.5 w-3.5" />

            Tarifs
          </div>

          <h2
            className="
              mt-6
              font-serif
              text-3xl
              font-semibold
              tracking-[-0.025em]
              text-[#173E31]
              sm:text-4xl
            "
          >
            Simple, clair,
            <span className="text-[#A8833E]">
              {" "}
              prêt pour ton équipe.
            </span>
          </h2>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-[#617168]
            "
          >
            Commence gratuitement, puis
            débloque les fonctions avancées
            quand tu en as besoin.
          </p>
        </motion.div>

        {/* ERROR */}
        {subscription.pricingError ? (
          <div
            className="
              mx-auto
              mt-8
              max-w-3xl
              rounded-2xl
              border
              border-[#C05C56]/20
              bg-[#F8EAE7]
              px-4
              py-3
              text-center
              text-sm
              text-[#9B4944]
            "
          >
            {subscription.pricingError}
          </div>
        ) : null}

        {/* PLANS */}
        <div
          className="
            mx-auto
            mt-10
            grid
            max-w-6xl
            gap-6
            md:grid-cols-2
            lg:gap-8
          "
        >
          {/* FREE */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.6,
              delay: 0.04,
            }}
            className={cn(
              "relative overflow-hidden rounded-[30px] border bg-[#FBFAF6] shadow-[0_14px_40px_rgba(23,62,49,0.05)]",
              freeIsCurrent
                ? "border-[#184C3A]/25"
                : "border-[#173E31]/10",
            )}
          >
            {freeIsCurrent ? (
              <div
                className="
                  absolute
                  right-5
                  top-5
                  rounded-full
                  bg-[#E7EEE8]
                  px-3
                  py-1.5
                  text-[11px]
                  font-semibold
                  text-[#184C3A]
                "
              >
                Plan actuel
              </div>
            ) : null}

            <div className="p-6 sm:p-8">
              <div
                className="
                  mb-5
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <span
                    className="
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#A8833E]
                    "
                  >
                    Plan de base
                  </span>

                  <h3
                    className="
                      mt-2
                      font-serif
                      text-3xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    Free
                  </h3>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#718078]
                    "
                  >
                    Pour utiliser Kitch’n
                    au quotidien avec les
                    fonctions essentielles.
                  </p>
                </div>

                <div
                  className="
                    grid
                    h-12
                    w-12
                    shrink-0
                    place-items-center
                    rounded-[18px]
                    bg-[#E7EEE8]
                    text-[#184C3A]
                  "
                >
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div
                className="
                  mb-6
                  border-b
                  border-[#173E31]/8
                  pb-6
                "
              >
                <div
                  className="
                    flex
                    items-end
                    gap-1
                  "
                >
                  <span
                    className="
                      font-serif
                      text-5xl
                      font-semibold
                      tracking-tight
                      text-[#173E31]
                    "
                  >
                    0€
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#718078]
                  "
                >
                  Sans engagement
                </p>
              </div>

              <FeatureList
                features={FREE_FEATURES}
              />

              <button
                type="button"
                onClick={onStart}
                className={cn(
                  buttonBase,
                  freeIsCurrent
                    ? "bg-[#E7EEE8] text-[#184C3A] hover:bg-[#DDE8DF]"
                    : "bg-[#DDAE9D] text-[#173E31] shadow-[0_8px_22px_rgba(120,73,57,0.10)] hover:-translate-y-0.5 hover:bg-[#D5A18E]",
                )}
              >
                {userPresent
                  ? freeIsCurrent
                    ? "Plan actuel"
                    : "Continuer avec Free"
                  : "Commencer gratuitement"}
              </button>

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-[#8B9791]
                "
              >
                Aucun paiement requis
              </p>
            </div>
          </motion.div>

          {/* PREMIUM */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className={cn(
              "relative overflow-hidden rounded-[30px] border shadow-[0_18px_50px_rgba(23,62,49,0.08)]",
              "bg-[#F7F5EF]",
              premiumIsCurrent
                ? "border-[#C7A45D]/45"
                : "border-[#C7A45D]/25",
            )}
          >
            <div
              className="
                absolute
                inset-x-0
                top-0
                h-1
                bg-[#C7A45D]
              "
            />

            <div
              className="
                border-b
                border-[#C7A45D]/15
                bg-[#E7EEE8]
                p-6
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-4
                "
              >
                <div>
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[#A8833E]
                    "
                  >
                    <Crown className="h-3.5 w-3.5" />

                    Premium
                  </span>

                  <h3
                    className="
                      mt-2
                      font-serif
                      text-3xl
                      font-semibold
                      text-[#173E31]
                    "
                  >
                    Premium
                  </h3>

                  <p
                    className="
                      mt-2
                      max-w-sm
                      text-sm
                      leading-6
                      text-[#617168]
                    "
                  >
                    Pour aller plus loin
                    avec les fonctionnalités
                    avancées de Kitch’n.
                  </p>
                </div>

                <div
                  className="
                    grid
                    h-12
                    w-12
                    shrink-0
                    place-items-center
                    rounded-[18px]
                    bg-[#FBFAF6]
                    text-[#A8833E]
                    ring-1
                    ring-[#C7A45D]/15
                  "
                >
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {premiumIsCurrent ? (
                <div
                  className="
                    mb-5
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-[#C7A45D]/12
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-[#8B6C32]
                  "
                >
                  <Crown className="h-3.5 w-3.5" />

                  Ton abonnement actuel
                </div>
              ) : null}

              <div
                className="
                  mb-6
                  border-b
                  border-[#173E31]/8
                  pb-6
                "
              >
                <div
                  className="
                    flex
                    items-end
                    gap-2
                  "
                >
                  <span
                    className="
                      font-serif
                      text-5xl
                      font-semibold
                      tracking-tight
                      text-[#173E31]
                    "
                  >
                    9,90€
                  </span>

                  <span
                    className="
                      mb-1
                      text-sm
                      text-[#718078]
                    "
                  >
                    / mois
                  </span>
                </div>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#718078]
                  "
                >
                  Toutes les fonctions
                  avancées de Kitch’n
                </p>
              </div>

              <FeatureList
                features={PREMIUM_FEATURES}
                premium
              />

              {subscription.subscriptionLoading ? (
                <button
                  type="button"
                  disabled
                  className={cn(
                    buttonBase,
                    "cursor-not-allowed bg-[#DDAE9D] text-[#173E31] opacity-70",
                  )}
                >
                  <Loader2 className="h-5 w-5 animate-spin" />

                  Chargement…
                </button>
              ) : premiumIsCurrent ? (
                <button
                  type="button"
                  onClick={() =>
                    void subscription.manage()
                  }
                  disabled={
                    subscription.loadingPortal
                  }
                  className={cn(
                    buttonBase,
                    "bg-[#184C3A] text-[#F7F3EA] shadow-[0_8px_22px_rgba(23,62,49,0.14)] hover:-translate-y-0.5 hover:bg-[#123C2E]",
                    subscription.loadingPortal &&
                      "cursor-not-allowed opacity-70",
                  )}
                >
                  {subscription.loadingPortal ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />

                      Ouverture…
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />

                      Gérer mon abonnement
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    userPresent
                      ? () =>
                          void subscription.upgrade()
                      : onStart
                  }
                  disabled={
                    subscription.loadingCheckout
                  }
                  className={cn(
                    buttonBase,
                    "bg-[#DDAE9D] text-[#173E31] shadow-[0_8px_22px_rgba(120,73,57,0.12)] hover:-translate-y-0.5 hover:bg-[#D5A18E]",
                    subscription.loadingCheckout &&
                      "cursor-not-allowed opacity-70",
                  )}
                >
                  {subscription.loadingCheckout ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />

                      Redirection…
                    </>
                  ) : userPresent ? (
                    <>
                      <Crown className="h-4 w-4" />

                      Passer au Premium
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4" />

                      Créer un compte et passer Premium
                    </>
                  )}
                </button>
              )}

              <p
                className="
                  mt-3
                  text-center
                  text-xs
                  text-[#8B9791]
                "
              >
                Paiement sécurisé via Stripe
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
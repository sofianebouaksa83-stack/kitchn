import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { ui } from "../../../styles/ui";
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
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mb-6 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex gap-3">
          <Check className="mt-0.5 h-5 w-5 text-emerald-400" />
          <span className="text-white/90">{feature}</span>
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
  const freeIsCurrent = subscription.currentPlan === "free";
  const premiumIsCurrent =
    subscription.currentPlan === "premium";

  return (
    <section id="pricing" className="relative mt-20 pb-10 sm:mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className={cn(ui.badge, "mx-auto inline-flex")}>
            Tarifs
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-slate-100 sm:text-4xl">
            Simple, clair, prêt pour ton équipe
          </h2>
        </motion.div>

        {subscription.pricingError && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 ring-1 ring-red-500/20">
            {subscription.pricingError}
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-2 lg:gap-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.04 }}
            className={cn(
              ui.card,
              freeIsCurrent
                ? "ring-2 ring-amber-400/30"
                : "ring-1 ring-white/10",
              "rounded-3xl"
            )}
          >
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-amber-300">
                    Plan de base
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-slate-100">
                    Free
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Pour utiliser Kitch’n au quotidien avec les fonctions essentielles.
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-400/10 p-3 ring-1 ring-amber-400/20">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-slate-100">
                  0€
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Sans engagement
                </p>
              </div>

              <FeatureList features={FREE_FEATURES} />

              <button
                type="button"
                onClick={onStart}
                className={cn(ui.btnPrimary, "w-full")}
              >
                {userPresent
                  ? freeIsCurrent
                    ? "Plan actuel"
                    : "Continuer avec Free"
                  : "Commencer gratuitement"}
              </button>
              <p className="mt-2 text-center text-xs text-slate-500">
                Aucun paiement requis
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              ui.card,
              premiumIsCurrent
                ? "ring-2 ring-amber-400/30"
                : "ring-1 ring-white/10",
              "relative overflow-hidden rounded-3xl"
            )}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
            <div className="p-6 sm:p-8">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                  <h3 className="mt-1 text-2xl font-bold text-slate-100">
                    Premium
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    Pour aller plus loin avec les fonctionnalités avancées de Kitch’n.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
                  <Users className="h-6 w-6 text-slate-200" />
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-slate-100">
                  9,90€
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  Par mois
                </p>
              </div>

              <FeatureList features={PREMIUM_FEATURES} />

              {subscription.subscriptionLoading ? (
                <button
                  type="button"
                  disabled
                  className={cn(
                    ui.btnPrimary,
                    "w-full opacity-80"
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Chargement…
                  </span>
                </button>
              ) : premiumIsCurrent ? (
                <button
                  type="button"
                  onClick={() => void subscription.manage()}
                  disabled={subscription.loadingPortal}
                  className={cn(ui.btnPrimary, "w-full")}
                >
                  {subscription.loadingPortal ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Ouverture…
                    </span>
                  ) : (
                    "Gérer mon abonnement"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    userPresent
                      ? () => void subscription.upgrade()
                      : onStart
                  }
                  disabled={subscription.loadingCheckout}
                  className={cn(ui.btnPrimary, "w-full")}
                >
                  {subscription.loadingCheckout ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Redirection…
                    </span>
                  ) : userPresent ? (
                    "Passer au Premium"
                  ) : (
                    "Créer un compte et passer Premium"
                  )}
                </button>
              )}

              <p className="mt-2 text-center text-xs text-slate-500">
                Paiement sécurisé via Stripe
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

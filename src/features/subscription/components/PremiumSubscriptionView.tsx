import {
  AlertCircle,
  Calendar,
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
  subscription: Subscription | null;
  plan: Plan;
  error: string | null;
  managingSubscription: boolean;
  onManageSubscription: () => void;
};

export function PremiumSubscriptionView({
  embedded,
  subscription,
  plan,
  error,
  managingSubscription,
  onManageSubscription,
}: PremiumSubscriptionViewProps) {
  const statusInfo = getSubscriptionStatusInfo(
    subscription?.status
  );

  return (
    <div className={embedded ? "" : ui.dashboardBg}>
      <div
        className={
          embedded
            ? ""
            : `${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`
        }
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <CreditCard className="w-5 h-5 text-amber-200" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Mon abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Gérez votre abonnement Premium et consultez vos
                informations de facturation.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className={`${ui.glassPanel} p-6 sm:p-7 mb-6`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-300 text-sm font-semibold mb-2">
                  <Crown className="w-4 h-4" />
                  Premium
                </div>

                <h2 className="text-2xl font-bold text-slate-100">
                  {plan.name}
                </h2>

                <p className="text-slate-300 mt-1">
                  {(plan.price_monthly / 100).toFixed(2)}€ / mois
                </p>
              </div>

              <div>
                <span
                  className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${statusInfo.className}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className={`${ui.card} p-4`}>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">
                      Prochain renouvellement
                    </p>
                    <p className="font-semibold text-slate-100">
                      {formatSubscriptionDate(
                        subscription?.current_period_end ?? null
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`${ui.card} p-4`}>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">
                      Mode de paiement
                    </p>
                    <p className="font-semibold text-slate-100">
                      Carte bancaire
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 ring-1 ring-amber-400/10 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />

                <div>
                  <p className="font-semibold text-amber-200">
                    Abonnement en cours d’annulation
                  </p>
                  <p className="text-sm text-amber-200/80 mt-1">
                    Votre abonnement restera actif jusqu’au{" "}
                    {formatSubscriptionDate(
                      subscription.current_period_end
                    )}
                    .
                  </p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800/80">
              <h3 className="font-semibold text-slate-100 mb-3">
                Fonctionnalités incluses
              </h3>

              <ul className="space-y-2">
                {plan.features.creation_recettes && (
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Création de recettes
                  </li>
                )}

                {plan.features.import_ai && (
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Import et génération IA
                  </li>
                )}

                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Support par email
                </li>
              </ul>
            </div>
          </div>

          <div className={`${ui.glassPanel} p-6 sm:p-7`}>
            <h3 className="font-semibold text-slate-100 mb-3">
              Gérer mon abonnement
            </h3>

            <p className={`${ui.muted} mb-5`}>
              Accédez au portail Stripe pour mettre à jour votre
              moyen de paiement ou annuler votre abonnement.
            </p>

            <button
              onClick={onManageSubscription}
              disabled={managingSubscription}
              className={[
                ui.btnPrimary,
                managingSubscription
                  ? "opacity-60 cursor-not-allowed"
                  : "",
              ].join(" ")}
              type="button"
            >
              {managingSubscription ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
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
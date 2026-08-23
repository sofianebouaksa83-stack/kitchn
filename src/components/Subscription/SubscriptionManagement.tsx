import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, CreditCard, Calendar, AlertCircle, Crown } from "lucide-react";
import { ui } from "../../styles/ui";
import { formatSubscriptionDate, getSubscriptionStatusInfo, } from "../../features/subscription/utils/subscriptionHelpers";
import { useSubscriptionData } from "../../features/subscription/hooks/useSubscriptionData";

const { subscription, plan, loading, error, setError,} = useSubscriptionData();

type SubscriptionManagementProps = {
  embedded?: boolean;
  onOpenCheckout?: () => void;
};

export function SubscriptionManagement({
  embedded = false,
  onOpenCheckout,
}: SubscriptionManagementProps) {
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    void loadSubscription();
  }, []);

  async function loadSubscription() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setSubscription(null);
        setPlan(null);
        return;
      }

      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError) throw subError;

      const normalizedPlanId =
        resolveSubscriptionPlanId(subData);

      setSubscription(subData ?? null);

      const { data: planData, error: planError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("id", normalizedPlanId)
        .single();

      if (planError) throw planError;
      setPlan(planData);
    } catch (err) {
      console.error("Error loading subscription:", err);
      setError(err instanceof Error ? err.message : "Impossible de charger l’abonnement");
      setSubscription(null);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    setManagingSubscription(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("manage-subscription");

      if (invokeError) {
        const details = await (invokeError as { context?: { text?: () => Promise<string> } }).context
          ?.text?.()
          .catch(() => null);
        throw new Error(details || invokeError.message || "Impossible d’ouvrir le portail Stripe");
      }

      if (!data?.url) {
        throw new Error("URL du portail introuvable");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Error managing subscription:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de l’ouverture du portail de gestion");
    } finally {
      setManagingSubscription(false);
    }
  }

  const isPremium = plan?.id === "premium";
  const statusInfo = getSubscriptionStatusInfo( subscription?.status );

  if (loading) {
    return (
      <div className={embedded ? "" : ui.dashboardBg}>
        <div className={embedded ? "" : `${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <CreditCard className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Abonnement</h1>
                <p className="text-sm text-slate-300/70 mt-1">Chargement…</p>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[320px]">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    );
  }

if (!plan) {
  return null;
}

if (!isPremium) {
  return (
    <div className={embedded ? "" : ui.dashboardBg}>
      <div className={embedded ? "" : `${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-500/15 ring-1 ring-white/10 grid place-items-center">
              <CreditCard className="w-5 h-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Mon abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Vous êtes actuellement sur le plan gratuit.
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
                <div className="text-sm text-slate-300/70 mb-2">Plan actuel</div>
                <h2 className="text-2xl font-bold text-slate-100">Free</h2>
                <p className="text-slate-300 mt-1">Accès de base à Kitch’n</p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-slate-500/15 text-slate-300 ring-1 ring-white/10">
                Free
              </span>
            </div>

            <div className="pt-6 border-t border-slate-800/80">
              <h3 className="font-semibold text-slate-100 mb-3">
                Fonctionnalités incluses
              </h3>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Création de recettes
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Accès de base
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  Import et génération IA non inclus
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  Gestion avancée non incluse
                </li>
              </ul>
            </div>
          </div>

          <div className={`${ui.glassPanel} p-6 sm:p-7`}>
            <h3 className="font-semibold text-slate-100 mb-3">
              Passer à Premium
            </h3>
            <p className={`${ui.muted} mb-5`}>
              Débloquez l’import IA, les fonctionnalités avancées et l’expérience complète Kitch’n.
            </p>

            <button
              onClick={onOpenCheckout}
              className={`${ui.btnPrimary} w-full`}
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                Passer au Premium
              </span>
            </button>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Premium</h2>
                  <p className="text-slate-300 mt-1">
                    Toutes les fonctionnalités avancées de Kitch’n
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25">
                  Premium
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Fonctionnalités incluses
                </h3>

                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Import et génération IA
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Fonctionnalités premium débloquées
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Gestion d’abonnement via Stripe
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Évolutions futures incluses
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}          

  return (
    <div className={embedded ? "" : ui.dashboardBg}>
      <div className={embedded ? "" : `${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <CreditCard className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">Mon abonnement</h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Gérez votre abonnement Premium et consultez vos informations de facturation.
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
                <h2 className="text-2xl font-bold text-slate-100">{plan.name}</h2>
                <p className="text-slate-300 mt-1">{(plan.price_monthly / 100).toFixed(2)}€ / mois</p>
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
                    <p className="text-sm text-slate-400">Prochain renouvellement</p>
                    <p className="font-semibold text-slate-100">{formatSubscriptionDate(subscription?.current_period_end ?? null)}</p>
                  </div>
                </div>
              </div>

              <div className={`${ui.card} p-4`}>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Mode de paiement</p>
                    <p className="font-semibold text-slate-100">Carte bancaire</p>
                  </div>
                </div>
              </div>
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 ring-1 ring-amber-400/10 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-200">Abonnement en cours d’annulation</p>
                  <p className="text-sm text-amber-200/80 mt-1">
                    Votre abonnement restera actif jusqu’au {formatSubscriptionDate(subscription.current_period_end)}.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-800/80">
              <h3 className="font-semibold text-slate-100 mb-3">Fonctionnalités incluses</h3>
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
            <h3 className="font-semibold text-slate-100 mb-3">Gérer mon abonnement</h3>
            <p className={`${ui.muted} mb-5`}>
              Accédez au portail Stripe pour mettre à jour votre moyen de paiement ou annuler votre abonnement.
            </p>

            <button
              onClick={handleManageSubscription}
              disabled={managingSubscription}
              className={[ui.btnPrimary, managingSubscription ? "opacity-60 cursor-not-allowed" : ""].join(" ")}
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

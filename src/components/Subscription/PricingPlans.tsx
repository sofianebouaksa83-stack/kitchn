import { useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Check, Users, Sparkles, Loader2, Crown } from "lucide-react";
import { ui } from "../../styles/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";

type PricingPlansProps = {
  currentPlanId?: string | null;
  onOpenCheckout?: () => void;
};

export function PricingPlans({
    currentPlanId,
    onOpenCheckout,
  }: PricingPlansProps) {
  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription(user?.id);

  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedPlanId = useMemo(() => {
    if (currentPlanId) return currentPlanId;
    if (subLoading) return null;
    return isPremium ? "premium" : "free";
  }, [currentPlanId, isPremium, subLoading]);

  async function handleUpgrade() {
    setError(null);
    onOpenCheckout?.();
  }

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            planId: "premium",
          },
        }
      );

      if (error) {
        const details = await (error as { context?: { text?: () => Promise<string> } }).context
          ?.text?.()
          .catch(() => null);
        throw new Error(details || error.message || "Erreur checkout");
      }

      if (!data?.url) {
        throw new Error("URL de paiement introuvable");
      }

      onOpenCheckout?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Impossible de passer au Premium";
      setError(message);
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function handleManage() {
    setError(null);
    setLoadingPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke("manage-subscription");
      if (error) throw error;
      if (!data?.url) throw new Error("URL du portail introuvable");
      window.location.href = data.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Impossible d’ouvrir la gestion d’abonnement";
      setError(message);
    } finally {
      setLoadingPortal(false);
    }
  }

  const freeIsCurrent = resolvedPlanId === "free";
  const premiumIsCurrent = resolvedPlanId === "premium";

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                {subLoading
                  ? "Chargement de votre abonnement…"
                  : premiumIsCurrent
                  ? "Vous utilisez actuellement le plan Premium"
                  : "Vous utilisez actuellement le plan Free"}
              </p>
              <p className={`${ui.muted} mt-2`}>
                Le plan Free reste utilisable sans carte bancaire. Premium débloque les fonctions avancées et la gestion complète de l’abonnement.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-8 grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className={`${ui.card} ${freeIsCurrent ? "ring-2 ring-amber-400/30" : "ring-1 ring-white/10"} rounded-3xl`}>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-300">Plan de base</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">Free</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Pour utiliser Kitch’n au quotidien avec les fonctions essentielles.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20 p-3">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-slate-100">0€</div>
                  <p className="text-sm text-slate-400 mt-1">Sans engagement</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Création de recettes</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Accès aux groupes et dossiers</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Usage standard de l’application</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Sans paiement requis</span>
                  </li>
                </ul>

                <button
                  className={`${ui.btnPrimary} w-full`}
                  disabled
                  type="button"
                >
                  {freeIsCurrent ? "Plan actuel" : "Plan Free"}
                </button>

                <p className="text-xs text-slate-500 mt-2 text-center">Aucun paiement requis</p>
              </div>
            </div>

            <div className={`${ui.card} ${premiumIsCurrent ? "ring-2 ring-amber-400/30" : "ring-1 ring-white/10"} rounded-3xl`}>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <Crown className="w-3.5 h-3.5" />
                      Premium
                    </span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">Premium</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Pour aller plus loin avec les fonctionnalités avancées de Kitch’n.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                    <Users className="w-6 h-6 text-slate-200" />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-slate-100">9,90€</div>
                  <p className="text-sm text-slate-400 mt-1">Par mois</p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Import et génération IA</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Fonctionnalités premium débloquées</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Gestion d’abonnement via Stripe</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Évolutions futures incluses</span>
                  </li>
                </ul>

                {premiumIsCurrent ? (
                  <button
                    onClick={handleManage}
                    disabled={loadingPortal}
                    className={`${ui.btnPrimary} w-full`}
                    type="button"
                  >
                    {loadingPortal ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Ouverture…
                      </span>
                    ) : (
                      "Gérer mon abonnement"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={false}
                    className={`${ui.btnPrimary} w-full`}
                    type="button"
                  >
                    {loadingCheckout ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Redirection…
                      </span>
                    ) : (
                      "Passer au Premium"
                    )}
                  </button>
                )}

                <p className="text-xs text-slate-500 mt-2 text-center">
                  Paiement sécurisé via Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

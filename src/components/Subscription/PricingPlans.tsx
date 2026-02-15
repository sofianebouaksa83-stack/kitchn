import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Check, Users, Sparkles, Loader2 } from "lucide-react";
import { ui } from "../../styles/ui";
import { useAuth } from "../../contexts/AuthContext";
import { useSubscription } from "../../hooks/useSubscription";

type PricingPlansProps = {
  currentPlanId?: string | null;
};

export function PricingPlans({ currentPlanId }: PricingPlansProps) {
  void currentPlanId;

  const { user } = useAuth();
  const { isPremium, loading: subLoading } = useSubscription(user?.id);

  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade() {
    setError(null);
    setLoadingCheckout(true);

    try {
      const successUrl = `${window.location.origin}/#subscription-success`;
      const cancelUrl = `${window.location.origin}/#subscription-cancel`;

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            planId: "premium",
            successUrl,
            cancelUrl,
          },
        }
      );

      if (error) {
        const details = await (error as any).context?.text?.().catch(() => null);
        throw new Error(details || error.message || "Erreur checkout");
      }

      if (!data?.url) throw new Error("URL de paiement introuvable");
      window.location.href = data.url;
    } catch (e: any) {
      setError(e?.message ?? "Impossible de passer au Premium");
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
    } catch (e: any) {
      setError(e?.message ?? "Impossible d’ouvrir la gestion d’abonnement");
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
                  : isPremium
                  ? "Vous utilisez actuellement le plan Premium"
                  : "Vous utilisez actuellement le plan Free"}
              </p>
              <p className={`${ui.muted} mt-2`}>
                Aucune page n’est bloquée. Certaines actions sont simplement limitées selon votre usage.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm text-center">
              {error}
            </div>
          )}

          <div className="mt-8 grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* FREE */}
            <div className={`${ui.card} ring-2 ring-amber-400/30 rounded-3xl`}>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-xs font-semibold text-amber-300">Recommandé</span>
                    <h3 className="text-2xl font-bold text-slate-100 mt-1">Free</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      Accès complet à Kitch’n, sans carte bancaire.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-amber-400/10 ring-1 ring-amber-400/20 p-3">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Accès à tout le site</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Import IA illimité</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">1 groupe personnel</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Jusqu’à 10 membres par groupe</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Utilisable sans restaurant</span>
                  </li>
                </ul>

                <button className={`${ui.btnPrimary} w-full`} disabled type="button">
                  Plan actuel
                </button>

                <p className="text-xs text-slate-500 mt-2 text-center">Aucun paiement requis</p>
              </div>
            </div>

            {/* PREMIUM */}
            <div className={`${ui.card} rounded-3xl`}>
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">Premium</h3>
                    <p className="text-slate-400 text-sm mt-2">Pour les équipes qui veulent scaler.</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3">
                    <Users className="w-6 h-6 text-slate-200" />
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Groupes multiples</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Plus de membres par groupe</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <span className="text-white/90">Organisation d’équipes étendues</span>
                  </li>
                </ul>

                {isPremium ? (
                  <button
                    onClick={handleManage}
                    disabled={loadingPortal}
                    className={`${ui.btnPrimary} w-full`}
                    type="button"
                  >
                    {loadingPortal ? "Ouverture…" : "Gérer mon abonnement"}
                  </button>
                ) : (
                  <button
                    onClick={handleUpgrade}
                    disabled={loadingCheckout}
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
                  Aucun prix affiché pour l’instant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

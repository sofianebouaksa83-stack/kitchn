import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, CreditCard, Users, Calendar, AlertCircle } from "lucide-react";
import { PricingPlans } from "./PricingPlans";
import { ui } from "../../styles/ui";

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  max_users: number;
  features: {
    creation_recettes: boolean;
    import_ai: boolean;
    multi_etablissements: boolean;
  };
}

export function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingSubscription, setManagingSubscription] = useState(false);

  useEffect(() => {
    void loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (!profile?.restaurant_id) return;

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", profile.restaurant_id)
        .maybeSingle();

      if (subData) {
        setSubscription(subData);

        const { data: planData } = await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", subData.plan_id)
          .single();

        if (planData) setPlan(planData);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        alert("Vous devez être connecté");
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-subscription`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create portal session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error managing subscription:", error);
      alert("Erreur lors de l'ouverture du portail de gestion");
    } finally {
      setManagingSubscription(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Actif", className: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25" },
      past_due: { label: "Paiement échoué", className: "bg-red-500/15 text-red-300 ring-1 ring-red-400/25" },
      canceled: { label: "Annulé", className: "bg-slate-500/15 text-slate-300 ring-1 ring-white/10" },
      trialing: { label: "Essai gratuit", className: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25" },
    };

    const s =
      statusMap[status] || { label: status, className: "bg-slate-500/15 text-slate-300 ring-1 ring-white/10" };

    return (
      <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${s.className}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={ui.dashboardBg}>
        <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
                <CreditCard className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                  Abonnement
                </h1>
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

  // Pas d’abonnement -> affiche les plans (PricingPlans est déjà plein écran)
  if (!subscription || !plan) {
    return <PricingPlans currentPlanId={null} />;
  }

  // Abonnement actif
  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <CreditCard className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Mon abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Gérez votre abonnement et consultez vos informations de facturation
              </p>
            </div>
          </div>

          <div className={`${ui.glassPanel} p-6 sm:p-7 mb-6`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">{plan.name}</h2>
                <p className="text-slate-300 mt-1">{(plan.price_monthly / 100).toFixed(0)}€ / mois</p>
              </div>
              <div>{getStatusBadge(subscription.status)}</div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className={`${ui.card} p-4`}>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Utilisateurs</p>
                    <p className="font-semibold text-slate-100">Jusqu&apos;à {plan.max_users}</p>
                  </div>
                </div>
              </div>

              <div className={`${ui.card} p-4`}>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-300 mt-1" />
                  <div>
                    <p className="text-sm text-slate-400">Prochain renouvellement</p>
                    <p className="font-semibold text-slate-100">{formatDate(subscription.current_period_end)}</p>
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

            {subscription.cancel_at_period_end && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-400/20 ring-1 ring-amber-400/10 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-300 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-200">Abonnement en cours d&apos;annulation</p>
                  <p className="text-sm text-amber-200/80 mt-1">
                    Votre abonnement sera annulé le {formatDate(subscription.current_period_end)}. Vous conserverez
                    l&apos;accès jusqu&apos;à cette date.
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
                    Création de recettes illimitée
                  </li>
                )}
                {plan.features.import_ai && (
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Import et génération IA
                  </li>
                )}
                {plan.features.multi_etablissements && (
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Gestion multi-établissements
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
              Accédez au portail Stripe pour modifier votre plan, mettre à jour votre moyen de paiement ou annuler
              votre abonnement.
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

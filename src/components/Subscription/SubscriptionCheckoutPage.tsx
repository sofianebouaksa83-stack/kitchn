import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { ui } from "../../styles/ui";
import { SubscriptionPaymentForm } from "./SubscriptionPaymentForm";
type Props = {
  onBack: () => void;
};

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export function SubscriptionCheckoutPage({ onBack }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: { planId: "premium" },
          }
        );

        if (error) {
          const details = await (error as { context?: { text?: () => Promise<string> } }).context
            ?.text?.()
            .catch(() => null);
          throw new Error(details || error.message || "Erreur checkout");
        }

        if (!data?.clientSecret) {
          throw new Error("Client secret introuvable");
        }

        if (!alive) return;
        setClientSecret(data.clientSecret);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Impossible d'initialiser le paiement");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void init();

    return () => {
      alive = false;
    };
  }, []);

const options = useMemo(() => {
  if (!clientSecret) return null;

  return {
    clientSecret,
    elementsOptions: {
      appearance: {
        theme: "night" as const,
        variables: {
          colorPrimary: "#f59e0b",
          colorBackground: "rgba(15,23,42,0.65)",
          colorText: "#f8fafc",
          colorTextSecondary: "rgba(148,163,184,0.82)",
          colorDanger: "#ef4444",
          fontFamily: "Inter, system-ui, sans-serif",
          borderRadius: "16px",
        },

        rules: {
          ".Block": {
            backgroundColor: "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            boxShadow: "none",
          },

          ".AccordionItem": {
            backgroundColor: "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            boxShadow: "none",
          },

          ".AccordionItem--selected": {
            backgroundColor: "rgba(15,23,42,0.82)",
            border: "1px solid rgba(148,163,184,0.28)",
            borderRadius: "16px",
            boxShadow: "none",
          },

          ".Input": {
            backgroundColor: "rgba(15,23,42,0.88)",
            border: "1px solid rgba(148,163,184,0.22)",
            color: "#f8fafc",
            boxShadow: "none",
          },

          ".Input:focus": {
            border: "1px solid rgba(245,158,11,0.40)",
            boxShadow: "0 0 0 1px rgba(245,158,11,0.22)",
          },

          ".Label": {
            color: "#e2e8f0",
            fontWeight: "600",
          },

          ".Tab": {
            backgroundColor: "rgba(15,23,42,0.72)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "none",
          },

          ".Tab--selected": {
            backgroundColor: "rgba(30,41,59,0.95)",
            border: "1px solid rgba(148,163,184,0.28)",
          },

          ".TabIcon": {
            display: "none",
          },

          ".TabLabel": {
            color: "#f8fafc",
            fontWeight: "600",
          },

          ".TermsText": {
            color: "rgba(148,163,184,0.78)",
          },
        }
      },
      loader: "auto" as const,
    },
  };
}, [clientSecret]);

  return (
    <div className={ui.dashboardBg}>
      <div className={`${ui.containerWide} py-8 px-4 sm:px-6`}>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className={`${ui.glassPanel} p-6 sm:p-8`}>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300">
                <img
                  src="/toque-premium.svg"
                  alt="Kitch'n Premium"
                  className="h-[48px] w-[48px] object-contain shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"                />
                  <span className="text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.25)]">
                    Kitch'n Premium
                  </span>              
                </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-100">
                Passez au plan Premium
              </h1>

              <p className="mt-3 text-slate-300">
                Débloquez l’import IA, les fonctions premium et la gestion avancée.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-4xl font-bold text-slate-100">9,90€</div>
                <p className="mt-1 text-sm text-slate-400">
                  sans engagement • annulation à tout moment
                </p>

                <ul className="mt-6 space-y-3 text-slate-200">
                  <li>✔ Import et génération IA</li>
                  <li>✔ Fonctionnalités premium débloquées</li>
                  <li>✔ Gestion d’abonnement via Stripe</li>
                  <li>✔ Évolutions futures incluses</li>
                </ul>
              </div>
            </div>

              <div className={`${ui.glassPanel} p-6 sm:p-8`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">
                      Paiement sécurisé
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Abonnement mensuel géré de façon sécurisée via Stripe.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Sécurisé
                  </div>
                </div>

                {loading && (
                  <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
                    <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                  </div>
                )}

                {error && !loading && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

               {!loading && !error && options && (
                  <CheckoutProvider stripe={stripePromise} options={options}>
                    <SubscriptionPaymentForm />
                  </CheckoutProvider>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

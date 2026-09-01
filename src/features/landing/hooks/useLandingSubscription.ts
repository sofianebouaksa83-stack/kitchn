import { useMemo, useState } from "react";
import { useSubscription } from "../../../hooks/useSubscription";
import { supabase } from "../../../lib/supabase";

export function useLandingSubscription(
  userId: string | undefined
) {
  const { isPremium, loading: subscriptionLoading } =
    useSubscription(userId);
  const [loadingCheckout, setLoadingCheckout] =
    useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [pricingError, setPricingError] =
    useState<string | null>(null);

  const currentPlan = useMemo(() => {
    if (subscriptionLoading) return null;
    return isPremium ? "premium" : "free";
  }, [isPremium, subscriptionLoading]);

  const upgrade = async () => {
    setPricingError(null);
    setLoadingCheckout(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        { body: { planId: "premium" } }
      );

      if (error) {
        const details = await (
          error as {
            context?: { text?: () => Promise<string> };
          }
        ).context?.text?.().catch(() => null);

        throw new Error(
          details || error.message || "Erreur checkout"
        );
      }

      if (!data?.url) {
        throw new Error("URL de paiement introuvable");
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      setPricingError(
        error instanceof Error
          ? error.message
          : "Impossible de passer au Premium"
      );
    } finally {
      setLoadingCheckout(false);
    }
  };

  const manage = async () => {
    setPricingError(null);
    setLoadingPortal(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription"
      );

      if (error) throw error;
      if (!data?.url) {
        throw new Error("URL du portail introuvable");
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      setPricingError(
        error instanceof Error
          ? error.message
          : "Impossible d’ouvrir la gestion d’abonnement"
      );
    } finally {
      setLoadingPortal(false);
    }
  };

  return {
    currentPlan,
    subscriptionLoading,
    loadingCheckout,
    loadingPortal,
    pricingError,
    upgrade,
    manage,
  };
}

export type LandingSubscriptionState = ReturnType<
  typeof useLandingSubscription
>;

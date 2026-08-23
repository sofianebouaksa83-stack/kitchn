import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  Plan,
  Subscription,
} from "../types/subscription.types";
import { resolveSubscriptionPlanId } from "../utils/subscriptionHelpers";

export function useSubscriptionData() {
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const { data: subData, error: subError } =
        await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

      if (subError) throw subError;

      const normalizedPlanId =
        resolveSubscriptionPlanId(subData);

      setSubscription(subData ?? null);

      const { data: planData, error: planError } =
        await supabase
          .from("subscription_plans")
          .select("*")
          .eq("id", normalizedPlanId)
          .single();

      if (planError) throw planError;

      setPlan(planData);
    } catch (error) {
      console.error(
        "Error loading subscription:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de charger l’abonnement"
      );

      setSubscription(null);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    subscription,
    plan,
    loading,
    error,
    setError,
  };
}
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useSubscription(userId?: string | null) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        if (!cancelled) {
          setLoading(false);
          setIsPremium(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);

      try {
        // 1) restaurant_id du user
        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", userId)
          .maybeSingle();

        if (pErr) throw pErr;

        const restaurantId = profile?.restaurant_id ?? null;
        if (!restaurantId) {
          if (!cancelled) {
            setIsPremium(false);
            setLoading(false);
          }
          return;
        }

        // 2) current_plan_id du restaurant
        const { data: rest, error: rErr } = await supabase
          .from("restaurants")
          .select("current_plan_id")
          .eq("id", restaurantId)
          .maybeSingle();

        if (rErr) throw rErr;

        // 3) Premium = si un plan est présent (à ajuster si tu as un plan free explicite)
        const premium = !!rest?.current_plan_id;

        if (!cancelled) {
          setIsPremium(premium);
          setLoading(false);
        }
      } catch (e) {
        console.error("useSubscription error:", e);
        if (!cancelled) {
          setIsPremium(false);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { loading, isPremium, status: null as any, currentPeriodEnd: null };
}

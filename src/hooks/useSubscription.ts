import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type SubscriptionRow = {
  user_id: string;
  plan_id: string | null;
  status: string | null;
  current_period_end: string | null;
  updated_at?: string | null;
};

export function useSubscription(userId?: string | null) {
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setIsPremium(false);
      setStatus(null);
      setCurrentPeriodEnd(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("user_id, plan_id, status, current_period_end, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      const row = (data?.[0] as SubscriptionRow | undefined) ?? null;

      console.log("SUB ROW:", row);

      const premium =
        row?.plan_id === "premium" &&
        ["active", "trialing"].includes(row?.status ?? "");

      setIsPremium(premium);
      setStatus(row?.status ?? null);
      setCurrentPeriodEnd(row?.current_period_end ?? null);
    } catch (e) {
      console.error("useSubscription error:", e);
      setIsPremium(false);
      setStatus(null);
      setCurrentPeriodEnd(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`subscription-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void load();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, load]);

  return { loading, isPremium, status, currentPeriodEnd, reload: load };
}
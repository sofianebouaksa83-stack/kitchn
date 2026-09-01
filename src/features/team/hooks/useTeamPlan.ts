import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../../../lib/supabase";

type UseTeamPlanProps = {
  userId?: string;
  profile: unknown;
};

type TeamPlanProfile = {
  plan?: string | null;
  is_premium?: boolean | null;
  subscription_status?: string | null;
} | null;

function isProfilePremium(profile: unknown) {
  const value = profile as TeamPlanProfile;

  return (
    value?.plan === "premium" ||
    value?.is_premium === true ||
    value?.subscription_status === "active"
  );
}

function resolvePlan(data: TeamPlanProfile) {
  if (data?.plan) {
    return String(data.plan);
  }

  if (
    data?.is_premium === true ||
    data?.subscription_status === "active"
  ) {
    return "premium";
  }

  return "free";
}

export function useTeamPlan({
  userId,
  profile,
}: UseTeamPlanProps) {
  const [loadingPlan, setLoadingPlan] =
    useState(true);

  const [freshPlan, setFreshPlan] =
    useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setFreshPlan(null);
      setLoadingPlan(false);
      return;
    }

    let cancelled = false;

    async function loadPlan() {
      setLoadingPlan(true);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "plan, subscription_status, is_premium"
          )
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        setFreshPlan(resolvePlan(data));
      } catch (error) {
        console.error(
          "[TeamManagement] loadPlan error:",
          error
        );

        if (!cancelled) {
          setFreshPlan(
            isProfilePremium(profile)
              ? "premium"
              : "free"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPlan(false);
        }
      }
    }

    void loadPlan();

    return () => {
      cancelled = true;
    };
  }, [userId, profile]);

  const isPremium = useMemo(() => {
    if (freshPlan) {
      return freshPlan === "premium";
    }

    return isProfilePremium(profile);
  }, [freshPlan, profile]);

  async function refreshPremiumStatus() {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "plan, subscription_status, is_premium"
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      setFreshPlan(resolvePlan(data));
    } catch (error) {
      console.error(
        "[TeamManagement] refreshPremiumStatus error:",
        error
      );
    }
  }

  return {
    loadingPlan,
    isPremium,
    refreshPremiumStatus,
  };
}
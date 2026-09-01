import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  getAiImportQuota,
  type AiImportQuota,
} from "../../../services/aiImportQuota";

export function useAiImportQuota(
  user: User | null
) {
  const [quota, setQuota] =
    useState<AiImportQuota | null>(null);
  const [quotaLoading, setQuotaLoading] =
    useState(false);

  const loadQuota = useCallback(async () => {
    const result = await getAiImportQuota();
    setQuota(result);

    return result;
  }, []);

  const refreshQuota = useCallback(async () => {
    if (!user) {
      setQuota(null);
      return null;
    }

    try {
      setQuotaLoading(true);
      return await loadQuota();
    } catch (error) {
      console.error("Erreur quota IA:", error);
      return null;
    } finally {
      setQuotaLoading(false);
    }
  }, [loadQuota, user]);

  useEffect(() => {
    void refreshQuota();
  }, [refreshQuota]);

  return {
    quota,
    quotaLoading,
    loadQuota,
    refreshQuota,
  };
}
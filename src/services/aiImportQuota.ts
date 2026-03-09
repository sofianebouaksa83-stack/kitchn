import { supabase } from "../lib/supabase";

export type UserPlan = "free" | "premium";

export type AiImportQuota = {
  plan: UserPlan;
  period_key: string;
  import_count: number;
  limit_count: number; // -1 = illimité
  remaining: number;   // -1 = illimité
  can_import: boolean;
};

export type ConsumeAiImportQuotaResult = {
  allowed: boolean;
  plan: UserPlan;
  period_key: string;
  import_count: number;
  limit_count: number;
  remaining: number;
  message: string;
};

export async function getAiImportQuota(): Promise<AiImportQuota> {
  const { data, error } = await supabase.rpc("get_ai_import_quota");

  if (error) {
    throw new Error(error.message || "Impossible de récupérer le quota IA");
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Réponse quota vide");
  }

  return {
    plan: (row.plan ?? "free") as UserPlan,
    period_key: row.period_key ?? "",
    import_count: Number(row.import_count ?? 0),
    limit_count: Number(row.limit_count ?? 30),
    remaining: Number(row.remaining ?? 0),
    can_import: Boolean(row.can_import),
  };
}

/**
 * Idéalement à utiliser dans l'Edge Function import-recipe,
 * pas directement dans le front.
 */
export async function consumeAiImportQuota(): Promise<ConsumeAiImportQuotaResult> {
  const { data, error } = await supabase.rpc("consume_ai_import_quota");

  if (error) {
    throw new Error(error.message || "Impossible de consommer le quota IA");
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error("Réponse consommation vide");
  }

  return {
    allowed: Boolean(row.allowed),
    plan: (row.plan ?? "free") as UserPlan,
    period_key: row.period_key ?? "",
    import_count: Number(row.import_count ?? 0),
    limit_count: Number(row.limit_count ?? 30),
    remaining: Number(row.remaining ?? 0),
    message: row.message ?? "",
  };
}
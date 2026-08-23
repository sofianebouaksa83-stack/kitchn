import type { Subscription } from "../types/subscription.types";

type SubscriptionStatusInfo = {
  label: string;
  className: string;
};

const ACTIVE_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
]);

const STATUS_INFO: Record<string, SubscriptionStatusInfo> = {
  active: {
    label: "Actif",
    className:
      "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25",
  },
  past_due: {
    label: "Paiement à vérifier",
    className:
      "bg-red-500/15 text-red-300 ring-1 ring-red-400/25",
  },
  canceled: {
    label: "Annulé",
    className:
      "bg-slate-500/15 text-slate-300 ring-1 ring-white/10",
  },
  trialing: {
    label: "Essai",
    className:
      "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25",
  },
  inactive: {
    label: "Free",
    className:
      "bg-slate-500/15 text-slate-300 ring-1 ring-white/10",
  },
};

export function resolveSubscriptionPlanId(
  subscription:
    | Pick<Subscription, "status" | "plan_id">
    | null
    | undefined
): "premium" | "free" {
  if (
    subscription &&
    ACTIVE_STATUSES.has(subscription.status) &&
    subscription.plan_id === "premium"
  ) {
    return "premium";
  }

  return "free";
}

export function formatSubscriptionDate(
  dateString: string | null
) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getSubscriptionStatusInfo(
  status?: string
): SubscriptionStatusInfo {
  return (
    STATUS_INFO[status ?? "inactive"] ?? {
      label: status ?? "Inconnu",
      className:
        "bg-slate-500/15 text-slate-300 ring-1 ring-white/10",
    }
  );
}
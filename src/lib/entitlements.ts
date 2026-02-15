// src/lib/entitlements.ts

export type PremiumGateKey = "groups.limit" | "members.limit";

export type GroupEntitlements = {
  maxGroups: number;
  maxMembersPerGroup: number;
};

export function getGroupEntitlements(isPremium: boolean): GroupEntitlements {
  if (isPremium) {
    return {
      maxGroups: Number.POSITIVE_INFINITY,
      maxMembersPerGroup: Number.POSITIVE_INFINITY,
    };
  }

  // Plan Free
  return {
    maxGroups: 1,
    maxMembersPerGroup: 10,
  };
}

export function getPremiumCopy(key: PremiumGateKey) {
  switch (key) {
    case "groups.limit":
      return {
        title: "Limite du plan Free atteinte",
        body:
          "Le plan Free permet de créer 1 groupe avec jusqu’à 10 membres. " +
          "Passe au Premium pour créer plusieurs groupes et organiser des équipes plus larges.",
        cta: "Passer au Premium",
      };

    case "members.limit":
      return {
        title: "Limite du plan Free atteinte",
        body:
          "Le plan Free est limité à 10 membres par groupe. " +
          "Passe au Premium pour inviter plus de personnes et scaler ton équipe.",
        cta: "Passer au Premium",
      };

    default:
      return {
        title: "Fonctionnalité Premium",
        body:
          "Cette fonctionnalité est disponible avec le plan Premium, " +
          "pensé pour les équipes qui souhaitent grandir.",
        cta: "Découvrir le Premium",
      };
  }
}

import { Crown, ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { ui } from "../../styles/ui";
import { PageShell } from "../Layout/PageShell";

type UpgradePromptProps = {
  feature: string;
  requiredPlan?: "premium" | "Premium";
  inline?: boolean;
};

export function UpgradePrompt({
  feature,
  requiredPlan = "Premium",
  inline = false,
}: UpgradePromptProps) {
  const planLabel = "Premium";
  void requiredPlan;

  if (inline) {
    return (
      <div className={[ui.card, "flex items-center gap-2 px-3 py-2 text-amber-300"].join(" ")}>
        <Crown className="h-4 w-4 shrink-0 text-amber-400" />

        <span className="text-sm text-slate-200/90">
          Fonctionnalité réservée au plan{" "}
          <span className="font-semibold text-amber-300">{planLabel}</span>
        </span>

        <Link to="/subscription" className={`${ui.linkAmber} ml-auto`}>
          Voir l’abonnement
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <PageShell
      title="Passez au Premium"
      subtitle={
        <>
          <span className="text-slate-200/90">{feature}</span> est disponible avec le plan{" "}
          <span className="font-semibold text-amber-300">{planLabel}</span>. Passez au Premium pour débloquer cette fonctionnalité.
        </>
      }
      icon={<Crown className="h-5 w-5 text-amber-200" />}
      maxWidth="2xl"
      centerHeader
    >
      <div className="text-center">
        <Link to="/subscription" className={`${ui.btnPrimary} inline-flex`}>
          <Crown className="h-5 w-5" />
          Voir les offres
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </PageShell>
  );
}

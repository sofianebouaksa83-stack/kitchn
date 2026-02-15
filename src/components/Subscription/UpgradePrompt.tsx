import { Crown, ArrowRight } from "lucide-react";
import { Link } from "./Link";
import { ui } from "../../styles/ui";
import { PageShell } from "../Layout/PageShell";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: "Pro" | "Pro+";
  inline?: boolean;
}

export function UpgradePrompt({ feature, requiredPlan, inline = false }: UpgradePromptProps) {
  if (inline) {
    return (
      <div className={[ui.card, "flex items-center gap-2 px-3 py-2 text-amber-300"].join(" ")}>
        <Crown className="w-4 h-4 text-amber-400 shrink-0" />

        <span className="text-sm text-slate-200/90">
          Fonctionnalité réservée au plan{" "}
          <span className="font-semibold text-amber-300">{requiredPlan}</span>
        </span>

        <Link to="/subscription" className={`${ui.linkAmber} ml-auto`}>
          Upgrade
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  return (
    <PageShell
      title={`Passez au plan ${requiredPlan}`}
      subtitle={
        <>
          <span className="text-slate-200/90">{feature}</span> est disponible à partir du plan{" "}
          <span className="font-semibold text-amber-300">{requiredPlan}</span>. Mettez à niveau pour débloquer cette fonctionnalité.
        </>
      }
      icon={<Crown className="w-5 h-5 text-amber-200" />}
      maxWidth="2xl"
      centerHeader
    >
      <div className="text-center">
        <Link to="/subscription" className={`${ui.btnPrimary} inline-flex`}>
          <Crown className="w-5 h-5" />
          Voir les plans
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </PageShell>
  );
}


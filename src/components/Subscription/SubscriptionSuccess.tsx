import { CheckCircle } from "lucide-react";
import { Link } from "./Link";
import { PageShell } from "../Layout/PageShell";

export function SubscriptionSuccess() {
  return (
    <PageShell
      title="Abonnement activé"
      subtitle="Votre abonnement a été activé. Vous pouvez maintenant profiter de toutes les fonctionnalités."
      icon={<CheckCircle className="w-5 h-5 text-emerald-200" />}
      maxWidth="2xl"
      centerHeader
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/20 mb-6">
          <CheckCircle className="w-9 h-9 text-emerald-400" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex">
            Retour à l’accueil
          </Link>

          <Link to="/subscription" className="inline-flex">
            Voir mon abonnement
          </Link>
        </div>
      </div>
    </PageShell>
  );
}


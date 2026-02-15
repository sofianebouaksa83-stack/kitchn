import { XCircle } from "lucide-react";
import { Link } from "./Link";
import { PageShell } from "../Layout/PageShell";

export function SubscriptionCancel() {
  return (
    <PageShell
      title="Souscription annulée"
      subtitle="Vous avez annulé le processus de souscription. Aucun paiement n’a été effectué."
      icon={<XCircle className="w-5 h-5 text-slate-200" />}
      maxWidth="2xl"
      centerHeader
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-500/15 ring-1 ring-white/10 mb-6">
          <XCircle className="w-9 h-9 text-slate-300" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/subscription" className="inline-flex">
            Voir les plans
          </Link>

          <Link to="/" className="inline-flex">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </PageShell>
  );
}


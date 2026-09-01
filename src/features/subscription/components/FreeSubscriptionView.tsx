import { CreditCard } from "lucide-react";
import { ui } from "../../../styles/ui";

type FreeSubscriptionViewProps = {
  embedded: boolean;
  error: string | null;
  onOpenCheckout?: () => void;
};

export function FreeSubscriptionView({
  embedded,
  error,
  onOpenCheckout,
}: FreeSubscriptionViewProps) {
  return (
    <div className={embedded ? "" : ui.dashboardBg}>
      <div
        className={
          embedded
            ? ""
            : `${ui.containerWide} py-6 sm:py-8 px-4 sm:px-6`
        }
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-500/15 ring-1 ring-white/10 grid place-items-center">
              <CreditCard className="w-5 h-5 text-slate-200" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Mon abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Vous êtes actuellement sur le plan gratuit.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className={`${ui.glassPanel} p-6 sm:p-7 mb-6`}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-slate-300/70 mb-2">
                  Plan actuel
                </div>
                <h2 className="text-2xl font-bold text-slate-100">
                  Free
                </h2>
                <p className="text-slate-300 mt-1">
                  Accès de base à Kitch’n
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-slate-500/15 text-slate-300 ring-1 ring-white/10">
                Free
              </span>
            </div>

            <div className="pt-6 border-t border-slate-800/80">
              <h3 className="font-semibold text-slate-100 mb-3">
                Fonctionnalités incluses
              </h3>

              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Création de recettes
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Accès de base
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  Import et génération IA non inclus
                </li>
                <li className="flex items-center gap-2 text-slate-200/90">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                  Gestion avancée non incluse
                </li>
              </ul>
            </div>
          </div>

          <div className={`${ui.glassPanel} p-6 sm:p-7`}>
            <h3 className="font-semibold text-slate-100 mb-3">
              Passer à Premium
            </h3>

            <p className={`${ui.muted} mb-5`}>
              Débloquez l’import IA, les fonctionnalités avancées
              et l’expérience complète Kitch’n.
            </p>

            <button
              onClick={onOpenCheckout}
              className={`${ui.btnPrimary} w-full`}
              type="button"
            >
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="w-5 h-5" />
                Passer au Premium
              </span>
            </button>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">
                    Premium
                  </h2>
                  <p className="text-slate-300 mt-1">
                    Toutes les fonctionnalités avancées de Kitch’n
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/25">
                  Premium
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <h3 className="font-semibold text-slate-100 mb-3">
                  Fonctionnalités incluses
                </h3>

                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Import et génération IA
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Fonctionnalités premium débloquées
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Gestion d’abonnement via Stripe
                  </li>
                  <li className="flex items-center gap-2 text-slate-200/90">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Évolutions futures incluses
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
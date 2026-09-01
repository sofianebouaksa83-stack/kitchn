import {
  CreditCard,
  Loader2,
} from "lucide-react";
import { ui } from "../../../styles/ui";

type SubscriptionLoadingViewProps = {
  embedded: boolean;
};

export function SubscriptionLoadingView({
  embedded,
}: SubscriptionLoadingViewProps) {
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
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 ring-1 ring-amber-400/25 grid place-items-center">
              <CreditCard className="w-5 h-5 text-amber-200" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-100">
                Abonnement
              </h1>
              <p className="text-sm text-slate-300/70 mt-1">
                Chargement…
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[320px]">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

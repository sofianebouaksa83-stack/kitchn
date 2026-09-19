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
    <div
      className={
        embedded
          ? ""
          : ui.dashboardBg
      }
    >
      <div
        className={
          embedded
            ? ""
            : `${ui.containerWide} px-4 py-6 sm:px-6 sm:py-8`
        }
      >
        <div className="mx-auto max-w-6xl">
          {!embedded ? (
            <div className="flex items-start gap-3">
              <div
                className="
                  grid h-11 w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  bg-[#E7EEE8]
                  text-[#184C3A]
                "
              >
                <CreditCard className="h-5 w-5" />
              </div>

              <div>
                <h1
                  className="
                    font-serif
                    text-3xl
                    font-semibold
                    text-[#173E31]
                  "
                >
                  Abonnement
                </h1>

                <p
                  className="
                    mt-1
                    text-sm
                    text-[#718078]
                  "
                >
                  Chargement de ton abonnement…
                </p>
              </div>
            </div>
          ) : null}

          <div
            className="
              flex min-h-[260px]
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  grid h-14 w-14
                  place-items-center
                  rounded-[20px]
                  bg-[#E7EEE8]
                "
              >
                <Loader2
                  className="
                    h-6 w-6
                    animate-spin
                    text-[#184C3A]
                  "
                />
              </div>

              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                  text-[#617168]
                "
              >
                Chargement de l’abonnement…
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
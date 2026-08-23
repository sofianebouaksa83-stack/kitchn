import { useState } from "react";
import { supabase } from "../../../lib/supabase";

type UseSubscriptionPortalParams = {
  onErrorChange: (message: string | null) => void;
};

export function useSubscriptionPortal({
  onErrorChange,
}: UseSubscriptionPortalParams) {
  const [
    managingSubscription,
    setManagingSubscription,
  ] = useState(false);

  async function handleManageSubscription() {
    setManagingSubscription(true);
    onErrorChange(null);

    try {
      const { data, error: invokeError } =
        await supabase.functions.invoke(
          "manage-subscription"
        );

      if (invokeError) {
        const details = await (
          invokeError as {
            context?: {
              text?: () => Promise<string>;
            };
          }
        ).context
          ?.text?.()
          .catch(() => null);

        throw new Error(
          details ||
            invokeError.message ||
            "Impossible d’ouvrir le portail Stripe"
        );
      }

      if (!data?.url) {
        throw new Error("URL du portail introuvable");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(
        "Error managing subscription:",
        error
      );

      onErrorChange(
        error instanceof Error
          ? error.message
          : "Erreur lors de l’ouverture du portail de gestion"
      );
    } finally {
      setManagingSubscription(false);
    }
  }

  return {
    managingSubscription,
    handleManageSubscription,
  };
}
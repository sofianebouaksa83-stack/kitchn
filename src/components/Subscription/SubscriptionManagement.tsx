import { FreeSubscriptionView } from "../../features/subscription/components/FreeSubscriptionView";
import { PremiumSubscriptionView } from "../../features/subscription/components/PremiumSubscriptionView";
import { SubscriptionLoadingView } from "../../features/subscription/components/SubscriptionLoadingView";
import { useSubscriptionData } from "../../features/subscription/hooks/useSubscriptionData";
import { useSubscriptionPortal } from "../../features/subscription/hooks/useSubscriptionPortal";

type SubscriptionManagementProps = {
  embedded?: boolean;
  onOpenCheckout?: () => void;
};

export function SubscriptionManagement({
  embedded = false,
  onOpenCheckout,
}: SubscriptionManagementProps) {
  const {
    subscription,
    plan,
    loading,
    error,
    setError,
  } = useSubscriptionData();

  const {
    managingSubscription,
    handleManageSubscription,
  } = useSubscriptionPortal({
    onErrorChange: setError,
  });

  if (loading) {
    return (
      <SubscriptionLoadingView
        embedded={embedded}
      />
    );
  }

  if (!plan) {
    return null;
  }

  if (plan.id !== "premium") {
    return (
      <FreeSubscriptionView
        embedded={embedded}
        error={error}
        onOpenCheckout={onOpenCheckout}
      />
    );
  }

  return (
    <PremiumSubscriptionView
      embedded={embedded}
      subscription={subscription}
      plan={plan}
      error={error}
      managingSubscription={managingSubscription}
      onManageSubscription={handleManageSubscription}
    />
  );
}
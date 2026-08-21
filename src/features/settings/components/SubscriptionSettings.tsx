import { Section } from "./Section";
import { SubscriptionManagement } from "../../../components/Subscription/SubscriptionManagement";

type SubscriptionSettingsProps = {
  onOpenCheckout?: () => void;
};

export function SubscriptionSettings({
  onOpenCheckout,
}: SubscriptionSettingsProps) {
  return (
    <Section>
      <SubscriptionManagement
        embedded
        onOpenCheckout={onOpenCheckout}
      />
    </Section>
  );
}
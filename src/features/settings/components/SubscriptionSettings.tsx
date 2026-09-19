import {
  CreditCard,
} from "lucide-react";

import { Section } from "./Section";

import { SubscriptionManagement } from "../../../components/Subscription/SubscriptionManagement";

type SubscriptionSettingsProps = {
  onOpenCheckout?: () => void;
};

export function SubscriptionSettings({
  onOpenCheckout,
}: SubscriptionSettingsProps) {
  return (
    <Section
      title="Abonnement"
      icon={
        <CreditCard className="h-4 w-4" />
      }
    >
      <div
        className="
          mb-5
          rounded-2xl
          bg-[#E7EEE8]
          px-4 py-3
          text-sm
          leading-relaxed
          text-[#617168]
        "
      >
        Consulte ton offre actuelle et
        gère ton abonnement Kitch’n.
      </div>

      <SubscriptionManagement
        embedded
        onOpenCheckout={
          onOpenCheckout
        }
      />
    </Section>
  );
}
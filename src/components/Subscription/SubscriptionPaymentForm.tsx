import { PaymentElement, useCheckout } from "@stripe/react-stripe-js/checkout";
import { Loader2, Check, ShieldCheck } from "lucide-react";

export function SubscriptionPaymentForm() {
  const checkoutState = useCheckout();

  if (checkoutState.type === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[220px]">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  if (checkoutState.type === "error") {
    return (
      <div className="rounded-2xl bg-red-500/10 text-red-300 ring-1 ring-red-500/20 px-4 py-3 text-sm">
        {checkoutState.error.message}
      </div>
    );
  }

  const { checkout } = checkoutState;

  async function handlePay() {
    const result = await checkout.confirm();

    if (result.type === "error") {
      console.error(result.error.message);
    }
  }

  return (
    <div>
      <PaymentElement />
      <div className="mt-4 grid gap-2 text-xs text-slate-300 items-center justify-center">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          Accès immédiat aux fonctionnalités Premium
        </div>
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          Sans engagement, annulable à tout moment
        </div>
        <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Paiement sécurisé et chiffré via Stripe
                    </div>
      </div>
      <button
        onClick={handlePay}
 className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"        type="button"
      >
        Activer Kitch’n Premium
      </button>

<div className="mt-3 text-xs text-slate-400 text-center">
  Annulable à tout moment • Paiement sécurisé via Stripe
</div>
    </div>
  );
}
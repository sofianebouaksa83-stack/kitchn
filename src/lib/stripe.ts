import { loadStripe } from "@stripe/stripe-js";

// ⚠️ récupère la clé depuis .env
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Debug (à enlever après)
console.log("Stripe key:", stripeKey);

if (!stripeKey) {
  console.error("❌ Stripe publishable key is missing");
}

export const stripePromise = stripeKey
  ? loadStripe(stripeKey)
  : null;
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY");
if (!stripeWebhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
if (!supabaseServiceRoleKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

function toIsoOrNull(unixSeconds?: number | null): string | null {
  if (unixSeconds == null) return null;
  const d = new Date(unixSeconds * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function getUserIdFromSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const directUserId = subscription.metadata?.user_id;
  if (directUserId) return directUserId;

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return null;

  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) return null;

  return customer.metadata?.user_id ?? null;
}

async function upsertSubscriptionFromStripeSubscription(
  subscriptionId: string
): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = await getUserIdFromSubscription(subscription);

  if (!userId) {
    console.error("Missing user_id for subscription", subscription.id);
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_id: "premium",
      status: subscription.status,
      current_period_start: toIsoOrNull(subscription.current_period_start),
      current_period_end: toIsoOrNull(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Upsert subscription error:", error);
    throw error;
  }
}

async function markSubscriptionActiveFromInvoice(
  invoice: Stripe.Invoice
): Promise<void> {
  if (!invoice.subscription) return;

  const subscriptionId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription.id;

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = await getUserIdFromSubscription(subscription);

  if (!userId) {
    console.error("Missing user_id for invoice/subscription", subscription.id);
    return;
  }

  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id ?? null;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan_id: "premium",
      status: "active",
      current_period_start: toIsoOrNull(subscription.current_period_start),
      current_period_end: toIsoOrNull(subscription.current_period_end),
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Invoice active upsert error:", error);
    throw error;
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.user_id ?? null;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!userId) {
    console.error("Missing user_id in checkout session metadata", session.id);
    return;
  }

  const payload: Record<string, unknown> = {
    user_id: userId,
    stripe_customer_id: customerId,
    plan_id: "premium",
    updated_at: new Date().toISOString(),
  };

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    payload.stripe_subscription_id = subscription.id;
    payload.status = subscription.status;
    payload.current_period_start = toIsoOrNull(subscription.current_period_start);
    payload.current_period_end = toIsoOrNull(subscription.current_period_end);
    payload.cancel_at_period_end = subscription.cancel_at_period_end ?? false;
  } else {
    payload.status = "incomplete";
  }

  const { error } = await supabase
    .from("subscriptions")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("Checkout completed upsert error:", error);
    throw error;
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = await getUserIdFromSubscription(subscription);

  if (!userId) {
    console.error("Missing user_id in deleted subscription", subscription.id);
    return;
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({
      plan_id: "free",
      status: "canceled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
      current_period_start: null,
      current_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    console.error("Subscription deleted update error:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    console.log("Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const eventSubscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripeSubscription(eventSubscription.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        const userId = subscription.metadata?.user_id;

        if (!userId) {
          console.error("Missing user_id in metadata");
          break;
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        console.log("Subscription activated for user:", userId);

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
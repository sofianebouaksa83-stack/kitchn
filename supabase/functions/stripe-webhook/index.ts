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

function getCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id ?? null;
}

function isPremiumStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing";
}

async function syncProfilePlan(
  userId: string,
  subscriptionStatus: string
): Promise<void> {
  const premium = isPremiumStatus(subscriptionStatus);

  const { error } = await supabase
    .from("profiles")
    .update({
      plan: premium ? "premium" : "free",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[stripe-webhook] Profile plan update error:", error);
    throw error;
  }

  console.log(
    "[stripe-webhook] Profile synced:",
    JSON.stringify({
      userId,
      plan: premium ? "premium" : "free",
      subscriptionStatus,
    })
  );
}

async function getUserIdFromSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  const directUserId = subscription.metadata?.user_id;
  if (directUserId) return directUserId;

  const customerId = getCustomerId(subscription.customer);
  if (!customerId) return null;

  const customer = await stripe.customers.retrieve(customerId);
  if ("deleted" in customer && customer.deleted) return null;

  return customer.metadata?.user_id ?? null;
}

async function upsertSubscriptionRow(params: {
  userId: string;
  customerId: string | null;
  subscriptionId: string | null;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      plan_id: isPremiumStatus(params.status) ? "premium" : "free",
      status: params.status,
      current_period_start: params.currentPeriodStart ?? null,
      current_period_end: params.currentPeriodEnd ?? null,
      cancel_at_period_end: params.cancelAtPeriodEnd ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("[stripe-webhook] Subscription upsert error:", error);
    throw error;
  }
}

async function upsertSubscriptionFromStripeSubscription(
  subscriptionId: string
): Promise<void> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = await getUserIdFromSubscription(subscription);

  if (!userId) {
    console.error("[stripe-webhook] Missing user_id for subscription", subscription.id);
    return;
  }

  const customerId = getCustomerId(subscription.customer);

  await upsertSubscriptionRow({
    userId,
    customerId,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: toIsoOrNull(subscription.current_period_start),
    currentPeriodEnd: toIsoOrNull(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  });

  await syncProfilePlan(userId, subscription.status);
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
    console.error("[stripe-webhook] Missing user_id for invoice/subscription", subscription.id);
    return;
  }

  const customerId = getCustomerId(subscription.customer);

  await upsertSubscriptionRow({
    userId,
    customerId,
    subscriptionId: subscription.id,
    status: "active",
    currentPeriodStart: toIsoOrNull(subscription.current_period_start),
    currentPeriodEnd: toIsoOrNull(subscription.current_period_end),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
  });

  await syncProfilePlan(userId, "active");
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.user_id ?? null;
  const customerId = getCustomerId(
    session.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null
  );

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (!userId) {
    console.error("[stripe-webhook] Missing user_id in checkout session metadata", session.id);
    return;
  }

  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await upsertSubscriptionRow({
      userId,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: toIsoOrNull(subscription.current_period_start),
      currentPeriodEnd: toIsoOrNull(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    });

    await syncProfilePlan(userId, subscription.status);
  } else {
    await upsertSubscriptionRow({
      userId,
      customerId,
      subscriptionId: null,
      status: "incomplete",
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    });

    await syncProfilePlan(userId, "incomplete");
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = await getUserIdFromSubscription(subscription);

  if (!userId) {
    console.error("[stripe-webhook] Missing user_id in deleted subscription", subscription.id);
    return;
  }

  const customerId = getCustomerId(subscription.customer);

  await upsertSubscriptionRow({
    userId,
    customerId,
    subscriptionId: null,
    status: "canceled",
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  });

  await syncProfilePlan(userId, "canceled");
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
    console.error("[stripe-webhook] Signature error:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    console.log("[stripe-webhook] Event received:", event.type);

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
        await markSubscriptionActiveFromInvoice(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      default:
        console.log("[stripe-webhook] Unhandled event type:", event.type);
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] Handler error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
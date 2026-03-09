import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { planId } = await req.json();

    if (planId !== "premium") {
      throw new Error("Invalid plan");
    }

    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", "premium")
      .single();

    if (planError || !plan) {
      throw new Error("Plan not found");
    }

    if (!plan.stripe_price_id) {
      throw new Error("Stripe price not configured");
    }

    const { data: existingSub, error: existingErr } = await supabase
      .from("subscriptions")
      .select("status, stripe_customer_id, stripe_subscription_id, plan_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingErr) {
      throw new Error(existingErr.message);
    }

    if (
      existingSub &&
      existingSub.plan_id === "premium" &&
      ["active", "trialing"].includes(existingSub.status ?? "")
    ) {
      return new Response(
        JSON.stringify({
          error: "User already has an active subscription",
          alreadyPremium: true,
        }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let customerId = existingSub?.stripe_customer_id ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;
    } else {
      await stripe.customers.update(customerId, {
        email: user.email ?? undefined,
        metadata: {
          user_id: user.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: "https://www.kitchnpro.com/#subscription-success",
      cancel_url: "https://www.kitchnpro.com/#subscription-cancel",
      metadata: {
        user_id: user.id,
        plan_id: "premium",
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: "premium",
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-checkout-session error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
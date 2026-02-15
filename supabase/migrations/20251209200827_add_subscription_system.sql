/*
  # Add Subscription System with Stripe Integration

  ## Overview
  This migration adds a complete subscription management system with three tiers:
  - Starter (9€/month): Basic recipes, 3 users max
  - Pro (19€/month): + AI Import, 15 users max
  - Pro+ (29€/month): + Multi-restaurants, 45 users max

  ## New Tables
  
  ### `subscription_plans`
  Stores the available subscription plans with their features and limits:
  - `id` (text, primary key) - Plan identifier (starter/pro/pro_plus)
  - `name` (text) - Display name
  - `price_monthly` (integer) - Price in cents (900, 1900, 2900)
  - `stripe_price_id` (text) - Stripe Price ID (to be configured)
  - `max_users` (integer) - Maximum team members allowed
  - `features` (jsonb) - Available features as JSON
  - `display_order` (integer) - Order for display

  ### `subscriptions`
  Stores active subscriptions for restaurants:
  - `id` (uuid, primary key)
  - `restaurant_id` (uuid, foreign key) - Links to restaurants table
  - `stripe_customer_id` (text) - Stripe Customer ID
  - `stripe_subscription_id` (text) - Stripe Subscription ID
  - `plan_id` (text, foreign key) - Current plan
  - `status` (text) - Subscription status (active/canceled/past_due/etc)
  - `current_period_start` (timestamptz) - Billing period start
  - `current_period_end` (timestamptz) - Billing period end
  - `cancel_at_period_end` (boolean) - Will cancel at period end
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Modified Tables
  
  ### `restaurants`
  - Add `current_plan_id` (text) - Current subscription plan (defaults to null = free/trial)

  ## Security
  - Enable RLS on all new tables
  - Users can view their own restaurant's subscription
  - Only system (service role) can modify subscriptions via webhooks
  - Users can view all available plans

  ## Indexes
  - Index on restaurant_id for fast subscription lookups
  - Index on stripe_customer_id and stripe_subscription_id for webhook processing
  - Unique constraint on restaurant_id (one subscription per restaurant)
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly integer NOT NULL,
  stripe_price_id text,
  max_users integer NOT NULL DEFAULT 3,
  features jsonb NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(restaurant_id)
);

-- Add current_plan_id to restaurants if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'restaurants' AND column_name = 'current_plan_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN current_plan_id text REFERENCES subscription_plans(id);
  END IF;
END $$;

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, price_monthly, max_users, features, display_order)
VALUES
  ('starter', 'Starter', 900, 3, '{"creation_recettes": true, "import_ai": false, "multi_etablissements": false}'::jsonb, 1),
  ('pro', 'Pro', 1900, 15, '{"creation_recettes": true, "import_ai": true, "multi_etablissements": false}'::jsonb, 2),
  ('pro_plus', 'Pro+', 2900, 45, '{"creation_recettes": true, "import_ai": true, "multi_etablissements": true}'::jsonb, 3)
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
-- Everyone can view available plans
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for subscriptions
-- Users can view their restaurant's subscription
CREATE POLICY "Users can view own restaurant subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    restaurant_id IN (
      SELECT restaurant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Only service role can insert/update subscriptions (via webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at_trigger ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Function to sync restaurant current_plan_id when subscription changes
CREATE OR REPLACE FUNCTION sync_restaurant_plan()
RETURNS TRIGGER AS $$
BEGIN
  -- Update restaurant's current_plan_id when subscription is created or updated
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    UPDATE restaurants
    SET current_plan_id = NEW.plan_id
    WHERE id = NEW.restaurant_id;
    RETURN NEW;
  END IF;
  
  -- Clear restaurant's current_plan_id when subscription is deleted
  IF (TG_OP = 'DELETE') THEN
    UPDATE restaurants
    SET current_plan_id = NULL
    WHERE id = OLD.restaurant_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync restaurant plan
DROP TRIGGER IF EXISTS sync_restaurant_plan_trigger ON subscriptions;
CREATE TRIGGER sync_restaurant_plan_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_restaurant_plan();
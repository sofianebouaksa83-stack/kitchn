export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

export type PlanFeatures = {
  premium?: boolean;
  import_ai?: boolean;
  creation_recettes?: boolean;
};

export type Plan = {
  id: string;
  name: string;
  price_monthly: number;
  max_users: number;
  features: PlanFeatures;
};
import { createClient } from "@supabase/supabase-js";
import { rememberAwareStorage } from "./authStorage";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: rememberAwareStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  job_title?: string | null;
  establishment?: string | null;
  restaurant_id?: string | null;
  restaurant_role?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Recipe = {
  id: string;
  user_id: string;
  restaurant_id: string | null;
  title: string;
  category: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  allergens: string[];
  steps: { step: number; description: string }[];
  notes: string;
  is_base_recipe: boolean;
  created_at: string;
  updated_at: string;
};

export type Ingredient = {
  id: string;
  recipe_id: string;
  order_index: number;
  quantity: number;
  unit: string;
  designation: string;
  sub_recipe_id: string | null;
  cost_per_unit: number | null;
  created_at: string;
};

export type WorkGroup = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  restaurant_id: string | null;
  created_at: string;
};

export type RecipeShare = {
  id: string;
  recipe_id: string;
  shared_with_user_id: string | null;
  shared_with_group_id: string | null;
  permission: "read" | "edit";
  shared_by: string;
  shared_at: string;
};

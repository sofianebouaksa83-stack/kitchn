import { supabase } from "../../../lib/supabase";

export async function loadNavOrder(
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("nav_order")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return (data?.nav_order ?? []) as string[];
}

export async function saveNavOrder(
  userId: string,
  keys: string[]
): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: userId,
        nav_order: keys,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) throw error;
}
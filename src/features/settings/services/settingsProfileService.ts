import { supabase } from "../../../lib/supabase";

import type { ProfileRow } from "../types/settings.types";

export async function loadOrCreateProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as ProfileRow;

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .insert({ id: userId, locale: "fr" })
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted as ProfileRow;
}

export async function saveProfile(
  userId: string,
  payload: Partial<ProfileRow>
) {
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) throw error;
}

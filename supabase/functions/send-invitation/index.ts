import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type ReqBody = {
  email: string;
  restaurantId: string;
  role: "second" | "commis" | "stagiaire";
};

function generateToken(): string {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ success: false, error: "Missing auth" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: userRes, error: userErr } = await supabaseUser.auth.getUser();
    const user = userRes?.user;
    if (userErr || !user) return new Response(JSON.stringify({ success: false, error: "Not authenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = (await req.json()) as ReqBody;
    const email = (body.email ?? "").toLowerCase().trim();
    const { restaurantId, role } = body;

    if (!email || !restaurantId || !role) {
      return new Response(JSON.stringify({ success: false, error: "email, restaurantId, role requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Vérif chef + même restaurant
    const { data: me } = await supabaseUser
      .from("profiles")
      .select("restaurant_id, restaurant_role")
      .eq("id", user.id)
      .maybeSingle();

    if (!me || me.restaurant_role !== "chef" || me.restaurant_id !== restaurantId) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Lookup user par email (service role)
    const { data: usersPage, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (listErr) throw listErr;

    const found = (usersPage?.users ?? []).find(u => (u.email ?? "").toLowerCase() === email);

    if (!found) {
      return new Response(JSON.stringify({ success: false, code: "NO_ACCOUNT", error: "Aucun compte avec cet email" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Vérif: user a déjà un restaurant ?
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, restaurant_id")
      .eq("id", found.id)
      .maybeSingle();

    // Si le profil n’existe pas encore → on le crée (safe)
    if (!targetProfile) {
      await supabaseAdmin.from("profiles").insert({ id: found.id, email });
    } else if (targetProfile.restaurant_id) {
      return new Response(JSON.stringify({ success: false, code: "ALREADY_IN_RESTAURANT", error: "Utilisateur déjà rattaché à un restaurant" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Empêcher doublon pending
    const { data: existing } = await supabaseAdmin
      .from("invitations")
      .select("id")
      .eq("invited_user_id", found.id)
      .eq("restaurant_id", restaurantId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ success: false, code: "ALREADY_PENDING", error: "Invitation déjà en attente" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

    const { data: invitation, error: invErr } = await supabaseAdmin
      .from("invitations")
      .insert({
        restaurant_id: restaurantId,
        email,
        role,
        token,
        invited_user_id: found.id,
        expires_at: expiresAt,
      })
      .select("id, token, invited_user_id, expires_at")
      .maybeSingle();

    if (invErr || !invitation) throw invErr;

    return new Response(JSON.stringify({ success: true, invitation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message ?? "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

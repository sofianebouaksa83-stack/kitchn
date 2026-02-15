// supabase/functions/manage-users/index.ts
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Action = "list" | "setRole" | "attachUser" | "detachUser";

type Body =
  | { action: "list" }
  | { action: "setRole"; userId: string; restaurant_role: string }
  | {
      action: "attachUser";
      userId?: string;
      email?: string;
      full_name?: string;
      restaurant_role?: string;
    }
  | { action: "detachUser"; userId: string };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function bad(msg: string, status = 400) {
  return json({ error: msg }, status);
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return bad("Method not allowed", 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return bad("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", 500);
  }

  // Client admin (bypass RLS) - utilisé uniquement dans la function
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Vérif JWT entrant
  const token = getBearerToken(req);
  if (!token) return bad("Missing Authorization Bearer token", 401);

  // Client "user" (pour valider le token via getUser)
  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return bad("Invalid token", 401);

  const callerId = userData.user.id;

  // Récupère profil appelant (restaurant_id + role)
  const { data: callerProfile, error: callerProfErr } = await admin
    .from("profiles")
    .select("id, restaurant_id, restaurant_role")
    .eq("id", callerId)
    .maybeSingle();

  if (callerProfErr) return bad(callerProfErr.message, 500);
  if (!callerProfile?.restaurant_id) return bad("Caller has no restaurant", 403);

  const callerRole = (callerProfile.restaurant_role || "").toLowerCase();
  const isManager = callerRole === "owner" || callerRole === "admin";
  if (!isManager) return bad("Not allowed (owner/admin only)", 403);

  // Parse body
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body", 400);
  }

  const action = (body as any)?.action as Action;
  if (!action) return bad("Missing action", 400);

  const restaurantId = callerProfile.restaurant_id;

  // Helpers
  async function getUserIdByEmail(email: string) {
    // Repose sur profiles.email (plus simple que lister auth.users)
    const { data, error } = await admin
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data?.id ?? null;
  }

  async function ensureProfileExists(params: {
    id: string;
    email?: string | null;
    full_name?: string | null;
  }) {
    const { data, error } = await admin
      .from("profiles")
      .select("id")
      .eq("id", params.id)
      .maybeSingle();
    if (error) throw new Error(error.message);

    if (!data) {
      const { error: insErr } = await admin.from("profiles").insert({
        id: params.id,
        email: params.email ?? null,
        full_name: params.full_name ?? null,
      });
      if (insErr) throw new Error(insErr.message);
    }
  }

  try {
    // 1) LIST
    if (action === "list") {
      const { data, error } = await admin
        .from("profiles")
        .select("id, email, full_name, restaurant_role, created_at")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false });

      if (error) return bad(error.message, 500);
      return json({ users: data ?? [] });
    }

    // 2) SET ROLE
    if (action === "setRole") {
      const { userId, restaurant_role } = body as Extract<Body, { action: "setRole" }>;
      if (!userId) return bad("Missing userId");
      if (!restaurant_role) return bad("Missing restaurant_role");

      // sécurité: on ne modifie que si la cible est dans le même restaurant
      const { data: target, error: tErr } = await admin
        .from("profiles")
        .select("id, restaurant_id")
        .eq("id", userId)
        .maybeSingle();

      if (tErr) return bad(tErr.message, 500);
      if (!target) return bad("Target user not found", 404);
      if (target.restaurant_id !== restaurantId) return bad("Target not in your restaurant", 403);

      const { error } = await admin
        .from("profiles")
        .update({ restaurant_role })
        .eq("id", userId);

      if (error) return bad(error.message, 500);
      return json({ ok: true });
    }

    // 3) ATTACH USER (rattacher un compte de test existant)
    if (action === "attachUser") {
      const { userId, email, full_name, restaurant_role } =
        body as Extract<Body, { action: "attachUser" }>;

      let targetId = userId ?? null;

      if (!targetId && email) {
        targetId = await getUserIdByEmail(email);
      }

      if (!targetId) {
        return bad("Provide userId or an email that exists in profiles", 400);
      }

      await ensureProfileExists({ id: targetId, email: email ?? null, full_name: full_name ?? null });

      const { error } = await admin
        .from("profiles")
        .update({
          restaurant_id: restaurantId,
          restaurant_role: restaurant_role ?? "staff",
        })
        .eq("id", targetId);

      if (error) return bad(error.message, 500);
      return json({ ok: true, userId: targetId });
    }

    // 4) DETACH USER (retirer du restaurant)
    if (action === "detachUser") {
      const { userId } = body as Extract<Body, { action: "detachUser" }>;
      if (!userId) return bad("Missing userId");

      // vérifie même restaurant
      const { data: target, error: tErr } = await admin
        .from("profiles")
        .select("id, restaurant_id")
        .eq("id", userId)
        .maybeSingle();

      if (tErr) return bad(tErr.message, 500);
      if (!target) return bad("Target user not found", 404);
      if (target.restaurant_id !== restaurantId) return bad("Target not in your restaurant", 403);

      // Optionnel mais recommandé: retirer des groupes
      // (adapte les noms si ta table diffère)
      await admin.from("group_members").delete().eq("user_id", userId);

      const { error } = await admin
        .from("profiles")
        .update({ restaurant_id: null, restaurant_role: null })
        .eq("id", userId);

      if (error) return bad(error.message, 500);
      return json({ ok: true });
    }

    return bad("Unknown action", 400);
  } catch (e) {
    return bad(e?.message ?? "Server error", 500);
  }
});

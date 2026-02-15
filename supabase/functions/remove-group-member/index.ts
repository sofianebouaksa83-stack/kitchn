import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info, X-Client-Info",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = await req.json().catch(() => ({}));
  const groupId = body?.groupId as string | undefined;
  const userId = body?.userId as string | undefined;

  if (!groupId || !userId) return json({ error: "Missing groupId or userId" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY"); // ✅ ton secret ajouté dans Dashboard

  if (!supabaseUrl || !serviceKey) return json({ error: "Missing env" }, 500);

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Auth caller
  const authHeader = req.headers.get("Authorization") || "";
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  const jwt = m?.[1];
  if (!jwt) return json({ error: "Unauthorized" }, 401);

  const authClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: u, error: uErr } = await authClient.auth.getUser();
  const callerId = u?.user?.id;
  if (uErr || !callerId) return json({ error: "Invalid token" }, 401);

  // Caller must be admin of the group
  const { data: callerMembership, error: cmErr } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", callerId)
    .maybeSingle();

  if (cmErr) return json({ error: cmErr.message }, 500);
  if (!callerMembership || callerMembership.role !== "admin") {
    return json({ error: "Admin only" }, 403);
  }

  // Prevent removing yourself (recommended)
  if (callerId === userId) {
    return json({ error: "Tu ne peux pas te supprimer toi-même" }, 400);
  }

  const { error: delErr } = await admin
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId);

  if (delErr) return json({ error: delErr.message }, 500);

  return json({ ok: true });
});

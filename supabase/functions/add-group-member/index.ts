import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, apikey, x-client-info, X-Client-Info",
};

function res(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return res({ error: "Method not allowed" }, 405);

  const { groupId, email } = await req.json();

  if (!groupId || !email) {
    return res({ error: "groupId and email required" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY")!;

  const admin = createClient(supabaseUrl, serviceKey);

  // user calling the function
  const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!jwt) return res({ error: "Unauthorized" }, 401);

  const authClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: auth } = await authClient.auth.getUser();
  const callerId = auth?.user?.id;
  if (!callerId) return res({ error: "Invalid token" }, 401);

  // check admin of group
  const { data: member } = await admin
    .from("group_members")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", callerId)
    .maybeSingle();

  if (!member || member.role !== "admin") {
    return res({ error: "Admin only" }, 403);
  }

  // find user by email
  const { data: target } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!target) {
    return res({ error: "User not found" }, 404);
  }

  // Déjà membre ?
  const { data: existing, error: exErr } = await admin
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", groupId)
    .eq("user_id", target.id)
    .maybeSingle();

if (exErr) return json({ error: exErr.message }, 500);

  // Si déjà présent, on renvoie OK (idempotent)
if (existing) {
  return json({ ok: true, alreadyMember: true });
}

  // insert member
  const { error: insErr } = await admin.from("group_members").insert({
  group_id: groupId,
  user_id: target.id,
  role: "member",
});
if (insErr) return json({ error: insErr.message }, 500);
return json({ ok: true });


});
